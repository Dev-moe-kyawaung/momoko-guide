# 02 · Database schema (PostgreSQL 16 + PostGIS 3.4)

Full DDL also lives in [`src/data/blueprint.ts`](../src/data/blueprint.ts) (`DB_SCHEMA_SQL`) and is viewable in-app under *Settings → System blueprint → Database*.

## 2.1 Entity relationship overview

```
gtfs_agency ─┬─< gtfs_routes ─< gtfs_trips ─< gtfs_stop_times >─ gtfs_stops
             │                                  │
             └─< gtfs_fares                     └─< transit_edges (routing graph)

user_profiles ─┬─< favorites
               └─< journey_history ──(legs jsonb)──▶ transit edge snapshot

multilingual_texts (entity_type, entity_id, lang, field) → all display strings
landmarks ──(category, trilingual names, geography point)

gtfs_rt_vehicle_positions / gtfs_rt_trip_updates / gtfs_rt_alerts  (time-series)
```

## 2.2 Core DDL (excerpt)

```sql
CREATE TABLE gtfs_stops (
  stop_id      text PRIMARY KEY,
  stop_code    text,
  stop_name_en text, stop_name_th text, stop_name_my text,
  stop_lat     double precision, stop_lon double precision,
  location     geography(Point,4326) GENERATED ALWAYS AS
                 (ST_SetSRID(ST_MakePoint(stop_lon, stop_lat),4326)) STORED,
  smart_type   text CHECK (smart_type IN ('classic','renovated','digital')),
  shelter      boolean DEFAULT true,
  wheelchair   boolean DEFAULT false
);
CREATE INDEX gtfs_stops_geo ON gtfs_stops USING GIST (location);

CREATE TABLE transit_edges (
  edge_id   bigserial PRIMARY KEY,
  from_stop text, to_stop text,
  mode      text CHECK (mode IN ('walk','bus','boat','rail')),
  line_id   text,
  geom      geography(LineString,4326),
  dist_m    numeric(8,2),
  avg_speed numeric(5,2),   -- km/h profile per hour-of-day
  fare_thb  numeric(6,2)    -- boarding fare, charged once per line ride
);
CREATE INDEX transit_edges_geom ON transit_edges USING GIST (geom);

CREATE TABLE multilingual_texts (
  entity_type text, entity_id text,
  lang        text CHECK (lang IN ('th','my','en')),
  field       text, value text,
  source      text DEFAULT 'manual',   -- manual | mt | operator_feed
  updated_at  timestamptz DEFAULT now(),
  PRIMARY KEY (entity_type, entity_id, lang, field)
);
```

> The full file covers: `gtfs_agency`, `gtfs_routes`, `gtfs_stops`, `gtfs_trips`,
> `gtfs_stop_times`, `gtfs_fares`, `transit_edges`, `gtfs_rt_vehicle_positions`,
> `gtfs_rt_trip_updates`, `gtfs_rt_alerts`, `user_profiles`, `favorites`,
> `journey_history`, `multilingual_texts`, `landmarks`.

## 2.3 Design notes

1. **Routing graph as data.** `transit_edges` is generated nightly from GTFS shapes with a 1.35× road detour factor (bus) and 1.12× (rail). Walking edges are created on demand in PostGIS (`ST_DWithin(location, 340)`) — the client mirrors this with a 340 m radius so offline plans match online ones.
2. **Fares live on edges, not trips.** The boarding fare is attached to the first edge of each line ride; downstream edges are `0`, so summed edge fares equal the real ticket price including multi-leg journeys.
3. **Multilingual content is a table, not columns**, once names outgrow three languages or need operator overrides; the three base columns in `gtfs_stops` are the feed-native mirror for fast bulk loads.
4. **Realtime is append-only.** Snapshots are partitioned by day and pruned after 48 h; only the latest vehicle state is cached in Redis for map tiles.
5. **Journeys store a JSON snapshot** (`legs jsonb`) so history stays renderable after GTFS updates change ids.
