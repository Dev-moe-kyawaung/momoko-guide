# 03 · API reference

Base URL: `https://api.bkktransit.dev/v1` · Auth: `Authorization: Bearer <supabase-jwt>` (anonymous sign-in allowed) · All responses `application/json; charset=utf-8`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/stops/near` | Nearest stops/stations (PostGIS KNN) |
| GET | `/stops/{stop_id}` | Stop detail + smart_type + landmarks |
| GET | `/stops/{stop_id}/arrivals` | Live arrivals (GTFS-RT merged w/ schedule fallback) |
| GET | `/stations/{station_id}/trains` | Next trains per line/direction + platform |
| GET | `/routes/{route_id}` | Route with ordered stops and headways |
| GET | `/journey` | Multimodal plan (objective = fastest\|cheapest\|fewest) |
| GET | `/fare` | Fare matrix lookup (rabbit\|emv\|cash, daily cap) |
| GET | `/vehicles` | Vehicle positions within a bounding box |
| WS | `/stream/vehicles` | Live vehicle stream (5 s cadence) |
| POST | `/assistant/message` | Multilingual NLU + RAG route reasoning |
| GET | `/tiles/{z}/{x}/{y}.pbf` | Vector tile (offline pack source) |
| GET/POST/DELETE | `/me/favorites` | User favourites |
| GET/POST | `/me/history` | Journey history |

---

## GET `/stops/near?lat=13.7446&lng=100.5347&radius=300&limit=10`

```json
{
  "results": [
    {
      "stop_id": "2112",
      "name": { "en": "Victory Monument", "th": "อนุสาวรีย์ชัยสมรภูมิ", "my": "အောင်ခြိန်ရုပ်တု" },
      "lat": 13.764700, "lng": 100.537800,
      "distance_m": 42, "smart_type": "digital", "shelter": true,
      "routes": ["8", "15", "20", "536", "65", "A1"]
    }
  ],
  "gps_accuracy_m": 12,
  "fallback": false
}
```

If the device reports `accuracy_m > 50`, the server widens the radius to 300 m and sets `fallback: true` (mirrors the "Low GPS accuracy" chip in the app).

## GET `/journey?from=stop-victory&to=arl-suvarnabhumi&objective=fastest`

```json
{
  "objective": "fastest",
  "duration_min": 61,
  "fare_thb": 47,
  "transfers": 1,
  "walk_m": 120,
  "co2_saved_kg": 1.42,
  "crowding_max": 2,
  "legs": [
    { "mode": "walk", "from": "stop-victory", "to": "stop-victory", "min": 3, "distance_m": 120 },
    { "mode": "bus", "route": "511", "stops": 6, "min": 18, "fare_thb": 15,
      "dest": { "en": "Sathorn", "th": "สาทร", "my": "ဆသွန်" } },
    { "mode": "rail", "line": "bts-sukhumvit", "toward": { "en": "Samrong", "th": "สำโรง", "my": "ဆမ်ရုံ" },
      "platform": "Platform 2", "stops": 4, "min": 11, "fare_thb": 0 },
    { "mode": "rail", "line": "arl", "toward": { "en": "Suvarnabhumi", "th": "สุวรรณภูมิ", "my": "ဆူဝန်နဖူမီ" },
      "stops": 6, "min": 24, "fare_thb": 32 }
  ],
  "steps": {
    "th": ["เดิน 3 นาที (120 ม.)", "นั่งรถ 511 สาทร — 6 ป้าย", "ขึ้น BTS สายสุขุมวิท มุ่งหน้าสำโรง", "ต่อ ARL ลงสุวรรณภูมิ"],
    "my": ["၃ မိနစ် လမ်းလျှောက်ပါ (၁၂၀ မီတာ)", "511 စီးပါ — ၆ ဂိတ်", "BTS စီးပါ — ဆမ်ရုံဘက်", "ARL စီးပြီး လေဆိပ်တွင်ဆင်းပါ"],
    "en": ["Walk 3 min (120 m)", "Take 511 to Sathorn — 6 stops", "Board BTS toward Samrong", "Transfer to ARL, alight at Suvarnabhumi"]
  }
}
```

## GET `/stops/2205/arrivals`

```json
{
  "arrivals": [
    { "route": "511", "dest": { "en": "Pak Kret", "th": "ปากเกร็ด", "my": "ပက်ကရက်" },
      "eta_s": 210, "occupancy": "FEW_SEATS_AVAILABLE", "realtime": true },
    { "route": "EV-12", "dest": { "en": "Samrong", "th": "สำโรง", "my": "ဆမ်ရုံ" },
      "eta_s": 480, "occupancy": "MANY_SEATS_AVAILABLE", "realtime": true },
    { "route": "77", "dest": { "en": "Min Buri", "th": "มีนบุรี", "my": "မင်းပြည်" },
      "eta_s": 640, "realtime": false, "source": "schedule" }
  ],
  "feed_age_s": 8
}
```

## GET `/fare?from=bts-siam&to=arl-suvarnabhumi&payment=emv`

```json
{
  "legs": [
    { "operator": "BTS", "from": "Siam", "to": "Phaya Thai", "thb": 17 },
    { "operator": "ARL", "from": "Phaya Thai", "to": "Suvarnabhumi", "thb": 45 }
  ],
  "total_thb": 62,
  "daily_cap_thb": 65,
  "payable_thb": 62,
  "payment": "emv",
  "currency": "THB",
  "source": "operator fare matrix 2025-11-01"
}
```

## POST `/assistant/message`

Request:

```json
{
  "text": "ไปพระบรมมหาราชวังจาก BTS อโศก",
  "device_lang": "th",
  "gps": { "lat": 13.7372, "lng": 100.5601 }
}
```

Response:

```json
{
  "detected_lang": "th",
  "intent": { "kind": "route", "from": "bts-asok", "to": "lm-grandpalace" },
  "reply": {
    "th": "เส้นทางไป พระบรมมหาราชวัง: 27 นาที · 22 บาท · เปลี่ยน 1 ครั้ง",
    "my": "မဟာရာဝီရပ်သို့ — ၂၇ မိနစ် · ၂၂ ကျပ်",
    "en": "Route to Grand Palace: 27 min · ฿22 · 1 transfer"
  },
  "journey_ref": "/v1/journey?from=bts-asok&to=lm-grandpalace",
  "confidence": 0.93
}
```

## WS `/stream/vehicles?routes=511,77,ev12`

```json
{
  "t": 1770000005,
  "vehicles": [
    { "id": "bus-511-0", "route": "511", "lat": 13.73721, "lng": 100.56013,
      "bearing": 271.4, "delay_s": 90, "occupancy": "FEW_SEATS_AVAILABLE",
      "type": "BYD K9 electric" }
  ]
}
```

### Error envelope

```json
{ "error": { "code": "ROUTE_NOT_FOUND", "message": "no path between given stops",
  "lang": { "th": "ไม่พบเส้นทาง", "my": "ခရီးစဉ်မတွေ့ပါ", "en": "No route found" } } }
```
