# 07 · Smart Stop system

Bangkok's 2026 programme upgrades **1,100** of the 5,199 bus stops:

| Type | Count | Hardware | App behaviour |
|---|---|---|---|
| **Renovated Stop** | 600 | Physical panel, walking map print, QR code | Stop detail shows the same walking map + 30+ landmark indicators |
| **Digital Smart Stop** | 500 | LTE/5G unit, GPS module, e-ink/LCD countdown board | Realtime arrivals, digital board screen in app |
| Classic | rest | pole sign | App-only realtime (Near Me) |

## 7.1 Board decision tree (runs every 60 s per stop)

```
IF smart_type = 'digital':
   board = next 5 arrivals (GTFS-RT TripUpdate; fallback: static headway)
   IF feed_age > 120 s  -> show SCHEDULED badge + timetable fallback
   crowd = ML inference (vehicle occupancy + historical load profile)
   IF crowd >= 3        -> append "next service in N min" hint
   rotate pages every 8 s: [arrivals] -> [alternate services + AI notice]
   languages: th | my | en  (locale of last tap, default th)
ELSE IF smart_type = 'renovated':
   physical walking map (30+ landmark indicators)
   QR -> deep link /stops/{stop_id} in this app
ELSE:
   app-only realtime (GPS "Near Me" detection)
```

## 7.2 Board payload (JSON sent to signage)

```json
{
  "stop_id": "2205",
  "name": { "en": "Asok Junction", "th": "แยกอโศก", "my": "အိုက်ဆုကျော့ထောင့်" },
  "updated_at": "2026-09-03T18:42:11+07:00",
  "feed_age_s": 8,
  "arrivals": [
    { "route": "511", "color": "3FA9A0", "dest": { "en": "Pak Kret", "th": "ปากเกร็ด", "my": "ပက်ကရက်" },
      "eta_s": 210, "crowd": 2, "realtime": true },
    { "route": "EV-12", "color": "22B07D", "dest": { "en": "Samrong", "th": "สำโรง", "my": "ဆမ်ရုံ" },
      "eta_s": 480, "crowd": 1, "realtime": true }
  ],
  "notice": {
    "th": "แตะบัตรแรบบิท หรือ EMV ที่ประตู",
    "my": "တံခါးတွင် ရယ်ဘစ် သို့မဟုတ် EMV ကို တို့ပါ",
    "en": "Tap Rabbit Card or EMV contactless at the gate"
  }
}
```

## 7.3 Walking map & landmark indicators

The renovated-stop panel (and the in-app *Walking map* card) renders a 300 m radius map with **30+ landmark indicator categories**:

temple, mall, park, hospital, university, market, monument, airport, pier, government, transit.

Implementation (`src/data/landmarks.ts`): 38 real Bangkok landmarks with trilingual names, category icon and coordinates. Walking minutes use the OSRM-consistent 4.6 km/h profile:

```ts
walkMinutes = (distance_m * 1.18 / 1000) / 4.6 * 60   // + 1.6 min access overhead
```

## 7.4 GPS module spec (digital stops)

| Item | Value |
|---|---|
| Fix rate | 1 Hz, DGPS-assisted |
| Reported accuracy | attached to every ping (`±m`) |
| Drift handling | app shows "Low GPS accuracy — candidates within 300 m" above 50 m |
| Vehicle detection | BLE beacon on board + RT position fusion (2 m median error) |
| Uplink | LTE-M, batched every 5 s, edge-compressed |

## 7.5 Success metrics

* countdown accuracy: ±45 s p90 on bus routes
* board uptime: ≥ 99.5 %
* reduced "missed bus" survey complaints: target −35 %
* QR deep links opened per stop per day: target ≥ 20
