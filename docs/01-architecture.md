# 01 · System architecture

## 1.1 Full architecture diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                     BANGKOK TRANSIT SUPER APP (mobile)              │
│   React Native · Expo SDK 52 · TypeScript · AsyncStorage · expo-image│
│   Tabs: Home · Live Map · Planner · AI Assistant · Settings          │
└───────────────┬─────────────────────────────────────┬───────────────┘
                │ HTTPS (REST, Supabase Edge)          │ WSS (GTFS-RT stream)
┌───────────────▼───────────────────────┐   ┌─────────▼──────────────────┐
│  EDGE  ·  Cloudflare CDN + WAF        │   │  REALTIME INGEST (FastAPI) │
│  /v1/route  /v1/stops  /v1/fare       │   │  protobuf parser · 14 feeds│
│  /v1/journey  /v1/assistant  /v1/geo  │   │  TripUpdate · VehiclePos   │
└───────────────┬───────────────────────┘   └─────────┬──────────────────┘
                │                                     │
┌───────────────▼─────────────────────────────────────▼───────────────┐
│                     BACKEND SERVICES (FastAPI)                      │
│  routing worker · fare engine · NLU/RAG assistant · tile proxy     │
└───────────────┬─────────────────────────────────────┬───────────────┘
                │                                     │
┌───────────────▼───────────────────────┐   ┌─────────▼──────────────────┐
│  PostgreSQL 16 + PostGIS 3.4          │   │  REDIS 7                   │
│  gtfs_static · rt_snapshots · users   │   │  vehicle cache (5 s TTL)   │
│  multilingual_texts · landmarks       │   │  pub/sub → websocket fanout│
└───────────────────────────────────────┘   └────────────────────────────┘

  MAPS   : OSM raster tiles (CDN) + vector layers + Overpass API landmarks
  AI     : multilingual embeddings (TH/MY/EN) · pgvector · GPT route reasoning
  CLOUD  : Cloudflare (edge/DNS) · Vercel (web build) · Supabase (db/auth/storage)
```

## 1.2 Client architecture (this repository)

```
App.tsx ─ providers: SafeArea → AppProvider (persist) → ThemeProvider
        └─ NavigationContainer → NativeStackNavigator
             ├─ Main ─ MainProvider(tab state + planner draft)
             │          ├─ HomeScreen      next departures, stats, smart-city feed
             │          ├─ MapScreen       vector map canvas + filters + GPS
             │          ├─ PlannerScreen   from/to autocomplete + objectives
             │          ├─ AssistantScreen multilingual chat (NLU + route reasoning)
             │          └─ SettingsScreen  language, theme, a11y, offline, glossary
             ├─ StopDetail       arrivals, walking map, landmarks, transfers
             ├─ StationDetail    next trains, directions, exits, fare calculator
             ├─ Journey          leg timeline + 3-language narration
             ├─ SmartBoard       full-screen digital signage simulation
             ├─ Blueprint        architecture / schema / API / roadmap viewer
             └─ Offline          tile packs + GTFS cache management
```

### Key client modules

| Module | Responsibility |
|---|---|
| `src/lib/router.ts` | Builds the multimodal graph once (rail edges per line, bus/boat edges per route, 340 m walking links, paid interchange corridors), runs Dijkstra per objective, groups edges into legs and narrates every leg in TH/MY/EN. |
| `src/lib/gtfs.ts` | `vehiclesAt(epochSec)` — deterministic vehicle simulation; `arrivalsForStop()` — remaining-path ETA + schedule fallback; `trainsForStation()` — headway-phased countdowns; `sampleFeedEntity()` — production-shaped JSON. |
| `src/lib/nlu.ts` | Unicode-range detection + intent parser (greeting, help, nearest rail/bus, route, fare, crowd). |
| `src/components/MapCanvas.tsx` | WGS84 → screen projection (Mercator-lite at 13.8°N), river/road/rail polylines drawn with rotated Views, stop/station/vehicle/GPS markers, tap handling. |
| `src/store.tsx` | Settings (language, theme, font scale, high contrast, reduce motion, offline), favourites, journey history — persisted in AsyncStorage. |

## 1.3 Realtime pipeline

```
BMTA/BTS/MRT/ARL feed servers
   │ gtfs-static.zip (daily 03:00 ICT)      │ GTFS-RT protobuf (5 s)
   ▼                                        ▼
ETL worker (validate + normalise)     RT ingester (parse + enrich)
   │                                        │
   └────────────►  PostgreSQL  ◄────────────┘
                        │
            Redis pub/sub  →  WebSocket /v1/stream/vehicles
                        │
            REST /v1/journey (Dijkstra worker, p95 < 120 ms)
```

Freshness rules implemented in the app:

* `feed_age > 120 s` → arrivals fall back to static headways and get a `SCHEDULED` badge.
* `offlineMode` → realtime paused, timetable + cached tiles only (Offline screen).
* Vehicle objects carry `delay_s`; ETAs add `max(0, delay_s)`.

## 1.4 Smart-city integration points

| Programme | App surface |
|---|---|
| 1,100 Smart Stops | `smart_type` on every stop → renovated (walking map) vs digital (board) |
| 2,200 EV buses | `fuel = electric` → EV badge on arrivals + zero-emission copy |
| 13,500 ITS sensors | feed the `avg_speed` profile used by routing |
| 1,200 AI junctions | crowd/delay inference model input |
| Rabbit + EMV | fare engine `payment_mode` and daily cap logic |
