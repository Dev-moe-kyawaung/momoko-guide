# 06 · GTFS integration guide

## 6.1 Feed sources

| Feed | Type | Cadence | Notes |
|---|---|---|---|
| BMTA bus | GTFS-Static + GTFS-RT (TripUpdate, VehiclePosition) | daily static / 5 s RT | 5,199 stops, ~370 routes, 2,200 EV vehicles |
| BTS Skytrain | GTFS-Static (schedules published by BTS) | weekly | 3 lines incl. Gold Line extension |
| MRT (BEM/SRT) | GTFS-Static + RT arrival feed | daily / 60 s | Blue, Purple, Yellow, Pink |
| Airport Rail Link (SRTET) | GTFS-Static | weekly | Phaya Thai ↔ Suvarnabhumi |
| Chao Phraya Express | GTFS-Static (route_type 4) | weekly | pier-based, flag-flier fares |

## 6.2 Files consumed

```
agency.txt  routes.txt  trips.txt  stop_times.txt  stops.txt
calendar.txt  calendar_dates.txt  shapes.txt  transfers.txt  fare_attributes.txt  fare_rules.txt
```

Important fields used by the app:

* `stops.txt`: `stop_id, stop_code, stop_name, stop_lat, stop_lon, zone_id, location_type, parent_station`
* `transfers.txt`: same-complex interchanges become `INTERCHANGES` in `src/data/rail.ts` (platform → gate → exit corridors)
* `fare_attributes.txt`: `transfer_price`, `payment_method` mapped to Rabbit / EMV / cash

## 6.3 Ingestion pipeline

```
1. download   : S3 fetch of gtfs-static.zip (03:00 ICT daily)
2. validate   : MobilityData gtfs-validator (errors block deploy)
3. normalise  : split stop_name into name_en / name_th / name_my via multilingual_texts
4. enrich     : smart_type from the BMTA smart-stop register (classic|renovated|digital)
5. geometry   : build transit_edges from shapes.txt with detour factors
                bus 1.35× · boat 1.15× · rail 1.12× (calibrated against OSRM)
6. index      : GIST index on geography(Point) + edge geoms
7. publish    : new dataset version (gtfs_static_version = YYYY.MM.N)
```

## 6.4 Realtime ingestion

```
protobuf (FeedMessage) → VehiclePosition / TripUpdate / Alert
  → dedupe by (vehicle_id, timestamp)   → Redis cache (TTL 5 s)
  → upsert gtfs_rt_vehicle_positions    → pub/sub channel vehicles:{route}
  → websocket fan-out to clients        → client `useLiveVehicles()` (2 s tick)
```

Client-side shape (`src/lib/gtfs.ts`):

```ts
interface Vehicle {
  id: string; routeId: string; lat: number; lng: number; bearing: number;
  crowding: 1 | 2 | 3 | 4; delaySec: number; vehicleType: string;
  occupancyStatus: string;   // GTFS-RT OccupancyStatus enum
  lastUpdate: number;
}
```

Freshness handling:

| Condition | Behaviour |
|---|---|
| `now - lastUpdate > 120 s` | arrivals fall back to static headways, `realtime:false` badge |
| `offlineMode = true` | realtime paused; timetable + cached tiles only |
| route missing RT feed | schedule-only arrivals (SCHED badge) |

## 6.5 Coordinates reference (used in this build)

| Place | lat | lng |
|---|---|---|
| Siam BTS (CEN) | 13.7446 | 100.5347 |
| Victory Monument BTS | 13.7647 | 100.5378 |
| Asok / Sukhumvit MRT | 13.7372 | 100.5601 |
| Hua Lamphong MRT | 13.7431 | 100.5110 |
| Mo Chit BTS | 13.8019 | 100.5538 |
| Bang Wa (BTS + MRT) | 13.6899 | 100.4381 |
| Phaya Thai (BTS + ARL) | 13.7570 | 100.5350 |
| Makkasan ARL | 13.7368 | 100.5621 |
| Suvarnabhumi ARL | 13.6900 | 100.7501 |
| Don Mueang Airport | 13.9144 | 100.6057 |
| Sathorn Central Pier | 13.7185 | 100.5137 |

## 6.6 Validation checklist (CI)

- [ ] every `stop_times.stop_id` exists in `stops.txt`
- [ ] no orphan trips; `shapes.txt` ids resolve
- [ ] all lat/lng inside Bangkok bbox `13.63–13.98 N, 100.33–100.78 E`
- [ ] transfer edges symmetric; interchange pairs have both directions
- [ ] fare rules produce ฿8 / ฿15 / ฿17–65 (BTS) / ฿15–45 (MRT, ARL)
- [ ] trilingual name coverage ≥ 98 % (rest falls back to `en`)
- [ ] stop count delta vs previous version < 15 % (alert on sudden change)

## 6.7 Offline tiles

Vector tiles (`.pbf`, z10–z16) are sliced from OSM extracts per district and packed into six downloadable groups (~1.8 GB total) managed on the Offline screen. The client keeps the GTFS static snapshot (routes, stops, schedules) on device so planning works with no connection.
