/** Textual blueprint used by the in-app "System blueprint" screen and docs. */

export const ARCHITECTURE_DIAGRAM = `┌─────────────────────────────────────────────────────────────────────┐
│                        BANGKOK TRANSIT SUPER APP                     │
│  React Native · Expo SDK 52 · TypeScript · Reanimated · expo-image   │
└───────────────┬─────────────────────────────────────┬───────────────┘
                │ HTTPS / REST (Supabase Edge)         │ WSS (GTFS-RT)
┌───────────────▼───────────────────────┐   ┌─────────▼──────────────────┐
│  API GATEWAY  ·  Cloudflare CDN+WAF   │   │  REALTIME INGEST           │
│  /v1/route  /v1/stops  /v1/fares      │   │  GTFS-RT protobuf parser   │
│  /v1/journey  /v1/assistant  /v1/geo  │   │  14 feeds · 5 s cadence    │
└───────────────┬───────────────────────┘   └─────────┬──────────────────┘
                │                                     │
┌───────────────▼─────────────────────────────────────▼───────────────┐
│                    BACKEND  ·  FastAPI (Python)                     │
│  routing worker · fare engine · NLU/RAG assistant · tile server    │
└───────────────┬─────────────────────────────────────┬───────────────┘
                │                                     │
┌───────────────▼───────────────────────┐   ┌─────────▼──────────────────┐
│  PostgreSQL 16 + PostGIS 3.4          │   │  REDIS                     │
│  gtfs_static · gtfs_realtime snapshots│   │  vehicle cache · sessions  │
│  user_profiles · favorites · history  │   │  pub/sub websocket fan-out │
│  multilingual_texts (MM/TH/EN)        │   └────────────────────────────┘
└───────────────────────────────────────┘
   MAPS: OpenStreetMap tiles (raster) + Vector layers (MapLibre) + Overpass API
   CLOUD: Cloudflare (edge) · Vercel (web build) · Supabase (db + auth + storage)
   AI:   sentence-transformers (TH/MY/EN embeddings) · pgvector · GPT router
`;

export const DATAFLOW_DIAGRAM = ` BMTA / BTS / MRT / ARL feed servers
        │  gtfs-static.zip (daily)      │  GTFS-RT protobuf (5 s)
        ▼                               ▼
  ┌───────────────┐              ┌──────────────────┐
  │ ETL worker    │              │ RT ingester      │
  │ validate.csv  │              │ TripUpdate       │
  │ stops/routes  │              │ VehiclePosition  │
  │ shapes (1.35×)│              │ Alert            │
  └──────┬────────┘              └────────┬─────────┘
         │ upsert                          │ upsert + pub/sub
         ▼                                 ▼
  ┌──────────────────────────────────────────────────┐
  │            PostgreSQL + PostGIS + Redis          │
  └───────────────────────┬──────────────────────────┘
                          │ Dijkstra (node, line) states
                          ▼
  ┌──────────────────────────────────────────────────┐
  │  /v1/journey  →  walk → bus → rail → walk legs   │
  │  fare per boarding · transfers · crowd · CO₂      │
  └───────────────────────┬──────────────────────────┘
                          ▼
                 React Native client (this app)
`;

export const DB_SCHEMA_SQL = `-- ============ GTFS STATIC (mirror of feeds.txt) ============
CREATE TABLE gtfs_agency (
  agency_id    text PRIMARY KEY,
  name_en      text, name_th text, name_my text,
  url          text, timezone text DEFAULT 'Asia/Bangkok'
);

CREATE TABLE gtfs_routes (
  route_id     text PRIMARY KEY,
  agency_id    text REFERENCES gtfs_agency(agency_id),
  route_short  text, route_long_en text, route_long_th text, route_long_my text,
  route_type   smallint,          -- 3 = bus, 4 = ferry, 700 = rail
  route_color  char(6),           -- BMTA / BTS / MRT livery
  fuel         text DEFAULT 'diesel'  -- diesel | electric | n/a
);

CREATE TABLE gtfs_stops (
  stop_id      text PRIMARY KEY,
  stop_code    text,
  stop_name_en text, stop_name_th text, stop_name_my text,
  stop_lat     double precision, stop_lon double precision,
  location     geography(Point,4326) GENERATED ALWAYS AS
                 (ST_SetSRID(ST_MakePoint(stop_lon, stop_lat),4326)) STORED,
  zone_id      smallint,
  smart_type   text CHECK (smart_type IN ('classic','renovated','digital')),
  shelter      boolean DEFAULT true,
  wheelchair   boolean DEFAULT false
);
CREATE INDEX gtfs_stops_geo ON gtfs_stops USING GIST (location);

CREATE TABLE gtfs_stop_times (
  trip_id      text, stop_id      text REFERENCES gtfs_stops(stop_id),
  arrival_s    integer, departure_s integer,
  stop_sequence smallint, PRIMARY KEY (trip_id, stop_sequence)
);

CREATE TABLE gtfs_trips (
  trip_id      text PRIMARY KEY,
  route_id     text REFERENCES gtfs_routes(route_id),
  direction_id smallint, headsign_en text, headsign_th text, headsign_my text,
  shape_id     text
);

CREATE TABLE gtfs_fares (
  fare_id      text PRIMARY KEY,
  payment_mode text,            -- rabbit | emv | cash
  currency     text DEFAULT 'THB',
  transfer_max smallint DEFAULT 0,
  daily_cap_thb numeric(6,2)    -- EMV contactless daily cap
);

-- ============ POSTGIS ROUTING GRAPH ============
CREATE TABLE transit_edges (
  edge_id     bigserial PRIMARY KEY,
  from_stop   text, to_stop    text,
  mode        text CHECK (mode IN ('walk','bus','boat','rail')),
  line_id     text,
  geom        geography(LineString,4326),
  dist_m      numeric(8,2),
  avg_speed   numeric(5,2),     -- km/h by hour-of-day profile
  fare_thb    numeric(6,2)      -- boarding fare, charged once per line ride
);
CREATE INDEX transit_edges_geom ON transit_edges USING GIST (geom);
CREATE INDEX transit_edges_line ON transit_edges(line_id);

-- ============ GTFS REALTIME ============
CREATE TABLE gtfs_rt_vehicle_positions (
  vehicle_id    text, trip_id text, route_id text,
  lat double precision, lon double precision,
  bearing numeric(5,2), speed numeric(6,2),
  occupancy_status text,
  observed_at   timestamptz DEFAULT now(),
  PRIMARY KEY (vehicle_id, observed_at)
);
CREATE TABLE gtfs_rt_trip_updates (
  trip_id     text, stop_id text,
  arrival_ts  timestamptz, delay_s integer,
  observed_at timestamptz DEFAULT now()
);
CREATE TABLE gtfs_rt_alerts (
  alert_id text PRIMARY KEY, cause text, effect text,
  header jsonb, description jsonb, active_period tstzrange
);

-- ============ USERS ============
CREATE TABLE user_profiles (
  user_id     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_provider text DEFAULT 'apple',
  lang        text CHECK (lang IN ('th','my','en')) DEFAULT 'th',
  theme       text DEFAULT 'system',
  font_scale  numeric(3,2) DEFAULT 1.0,
  high_contrast boolean DEFAULT false,
  home_loc    geography(Point,4326),
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE favorites (
  user_id  uuid REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  place_id text,               -- stop_id | station_id | landmark_id
  label    text,
  PRIMARY KEY (user_id, place_id)
);

CREATE TABLE journey_history (
  id         bigserial PRIMARY KEY,
  user_id    uuid REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  from_id    text, to_id text,
  legs       jsonb,            -- snapshot of journey legs
  fare_thb   numeric(6,2),
  duration_s integer,
  co2_kg     numeric(5,3),
  created_at timestamptz DEFAULT now()
);

-- ============ MULTILINGUAL CONTENT ============
CREATE TABLE multilingual_texts (
  entity_type text,            -- stop | route | alert | ai_reply | landmark
  entity_id   text,
  lang        text CHECK (lang IN ('th','my','en')),
  field       text,            -- name | description | instruction
  value       text,
  source      text DEFAULT 'manual',  -- manual | mt | operator_feed
  updated_at  timestamptz DEFAULT now(),
  PRIMARY KEY (entity_type, entity_id, lang, field)
);

-- landmark indicators for walking maps (30+ categories)
CREATE TABLE landmarks (
  landmark_id text PRIMARY KEY,
  category    text,            -- temple|mall|park|hospital|university|market|...
  name_en text, name_th text, name_my text,
  geom geography(Point,4326)
);
CREATE INDEX landmarks_geom ON landmarks USING GIST (geom);
`;

export interface ApiEndpoint {
  method: string;
  path: string;
  desc: { en: string; th: string; my: string };
  sample: string;
}

export const API_ENDPOINTS: ApiEndpoint[] = [
  {
    method: 'GET',
    path: '/v1/stops/near?lat=13.7446&lng=100.5347&radius=300',
    desc: { en: 'Nearest stops & stations (PostGIS KNN)', th: 'ป้าย/สถานีใกล้เคียง (PostGIS KNN)', my: 'အနီးဆုံး ဂိတ်/ဘူတာ (PostGIS KNN)' },
    sample: `{
  "results": [
    { "stop_id": "2112", "name": { "en": "Victory Monument",
      "th": "อนุสาวรีย์ชัยสมรภูมิ", "my": "အောင်ခြိန်ရုပ်တု" },
      "distance_m": 42, "smart_type": "digital" }
  ]
}`,
  },
  {
    method: 'GET',
    path: '/v1/journey?from=stop-victory&to=arl-suvarnabhumi&objective=fastest',
    desc: { en: 'Multimodal journey (walk→bus→rail→walk)', th: 'เส้นทางหลายรูปแบบ', my: 'ရောနှော ခရီးစဉ်' },
    sample: `{
  "duration_min": 61, "fare_thb": 47, "transfers": 1, "co2_kg": 1.42,
  "legs": [
    { "mode": "walk", "distance_m": 120, "min": 3 },
    { "mode": "bus",  "route": "511", "stops": 6, "min": 18, "fare_thb": 15 },
    { "mode": "rail", "line": "bts-sukhumvit", "toward": "Samrong",
      "platform": "Platform 2", "stops": 4, "min": 11 },
    { "mode": "rail", "line": "arl", "toward": "Suvarnabhumi",
      "stops": 6, "min": 24, "fare_thb": 32 }
  ]
}`,
  },
  {
    method: 'GET',
    path: '/v1/stops/2205/arrivals',
    desc: { en: 'Live arrivals at a stop (GTFS-RT merged)', th: 'รถมาถึงแบบเรียลไทม์', my: 'တိုက်ရိုက် ရောက်ရှိချိန်' },
    sample: `{
  "arrivals": [
    { "route": "511", "dest": "Pak Kret", "eta_s": 210,
      "occupancy": "FEW_SEATS_AVAILABLE", "realtime": true },
    { "route": "77", "dest": "Min Buri", "eta_s": 640, "realtime": false }
  ]
}`,
  },
  {
    method: 'GET',
    path: '/v1/fare?from=bts-siam&to=arl-suvarnabhumi&payment=emv',
    desc: { en: 'Fare matrix lookup (Rabbit / EMV / cash)', th: 'คำนวณค่าโดยสาร', my: 'လက်ငင်း တွက်ချက်မှု' },
    sample: `{
  "legs": [{ "operator": "BTS", "thb": 44 }, { "operator": "ARL", "thb": 45 }],
  "total_thb": 89, "daily_cap_thb": 65, "payable_thb": 65,
  "payment": "emv", "currency": "THB"
}`,
  },
  {
    method: 'POST',
    path: '/v1/assistant/message',
    desc: { en: 'Multilingual NLU + RAG route reasoning', th: 'ผู้ช่วย AI หลายภาษา', my: '၃ ဘာသာ AI လက်ထောက်' },
    sample: `{
  "text": "ไปพระบรมมหาราชวังจาก BTS อโศก",
  "detected_lang": "th",
  "intent": { "kind": "route", "from": "bts-asok", "to": "lm-grandpalace" },
  "reply": { "th": "ใช้เวลา 27 นาที · 22 บาท · เปลี่ยน 1 ครั้ง" }
}`,
  },
  {
    method: 'WS',
    path: '/v1/stream/vehicles?routes=511,77,ev12',
    desc: { en: 'WebSocket vehicle positions (5 s cadence)', th: 'ตำแหน่งรถผ่าน WebSocket', my: 'WebSocket မှ ယာဉ်အနေအထား' },
    sample: `{
  "vehicles": [
    { "id": "bus-511-0", "route": "511", "lat": 13.73721,
      "lng": 100.56013, "bearing": 271.4, "delay_s": 90,
      "type": "BYD K9 electric" }
  ]
}`,
  },
];

export const GTFS_SAMPLE = `# routes.txt
route_id,agency_id,route_short_name,route_long_name,route_type,route_color,fuel
bus-511,BMTA,511,Pak Kret – Sathorn,3,3FA9A0,diesel
bus-ev12,BMTA,EV-12,Siam – Samrong,3,22B07D,electric
boat-cb1,CExpress,CB1,Sathorn – Wang Lang,4,2F9BD6,n/a

# stops.txt
stop_id,stop_code,stop_name,stop_lat,stop_lon,smart_type,shelter
2205,2205,"Asok Junction",13.737200,100.559500,digital,true
2112,2112,"Victory Monument",13.764700,100.537800,digital,true

# stop_times.txt (trip bus-511-0730)
trip_id,stop_id,arrival,departure,stop_sequence
bus-511-0730,1001,07:30:00,07:30:00,1
bus-511-0730,2205,07:58:00,07:58:15,5

# realtime: TripUpdate (protobuf → JSON projection)
{
  "trip_update": {
    "trip": { "trip_id": "bus-511-0730", "route_id": "511" },
    "stop_time_update": [
      { "stop_id": "2205", "arrival": { "time": 1770000000, "delay": 90 } }
    ]
  }
}`;

export const SMART_STOP_LOGIC = `Smart Stop decision tree (per stop_id, evaluated every 60 s):

IF smart_type = 'digital':
   board = next 5 arrivals (GTFS-RT TripUpdate, fallback: static headway)
   IF feed_age > 120 s -> show SCHEDULED badge + timetable fallback
   crowd = ML inference(vehicle occupancy + historical load profile)
   rotate pages every 8 s: [arrivals] -> [network + AI notice]
   languages: th | my | en (locale of last tap, default th)
ELSE IF smart_type = 'renovated':
   physical walking map printed on panel (30+ landmark indicators)
   QR -> deep link /stops/{stop_id} in this app
ELSE:
   app-only realtime (GPS "Near Me" detection)
`;
