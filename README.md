# 🚌🚇 Bangkok Transit Super App

**ဘန်ကောင် သွားလာရေး · กรุงเทพ ทรานซิท · Bangkok Transit**  
Multimodal journey companion for Bangkok — bus (5,199 stops), BTS / MRT / ARL rail (7 lines), Chao Phraya express boats and walking legs, with AI assistance in **Thai, Myanmar and English**.

> Created by **Moekyawaung** · [github.com/Dev-moe-kyawaung/](https://github.com/Dev-moe-kyawaung/)

---

## 1. What is inside this repository

| Layer | Contents |
|---|---|
| **Mobile app** | React Native + Expo SDK 52 + TypeScript. 11 screens, 5 tabs, custom vector map canvas (works on iOS, Android **and** web with zero native map deps). |
| **Routing engine** | Multimodal Dijkstra over `(node, incoming-line)` states → walk → bus/boat → rail → walk. Objectives: *fastest*, *cheapest*, *fewest transfers*. Real fare matrices. |
| **Realtime layer** | GTFS-Realtime ingestion client + on-device simulator (vehicle positions, TripUpdates, occupancy, delays) shaped exactly like the production protobuf feed. |
| **AI assistant** | Multilingual NLU (Unicode-range detection + intent parser), route reasoning, crowd inference, landmark-based navigation. |
| **Smart Stop** | Digital signage simulator for the 500 digital smart stops + walking-map view for the 600 renovated stops (30+ landmark indicators). |
| **Docs** | Full system documentation in [`docs/`](docs) — architecture, DB schema, API, wireframes, multilingual copy, GTFS guide, Smart Stop logic, AI flows, dev guide, testing checklist, deployment, roadmap. |

## 2. Real Bangkok data used

| Fact | Value |
|---|---|
| Bus stops in the GTFS static feed | **5,199** |
| Smart Stops (2026 programme) | **1,100** = 600 renovated (walking maps + 30+ landmark indicators) + 500 digital (GPS + live countdown) |
| Rail lines | **7** — BTS Sukhumvit, BTS Silom, BTS Gold, MRT Blue, MRT Purple, MRT Yellow, MRT Pink + Airport Rail Link |
| Payment | Rabbit Card, EMV contactless (daily cap), cash (bus) |
| Fare matrices (Nov-2025 snapshot) | BTS ฿17–65 · MRT ฿15–45 · ARL ฿15–45 (Suvarnabhumi = ฿45) · BMTA ฿8 / ฿15 flat · A1 airport express ฿50 |
| Smart city | 2,200 EV buses, 13,500 ITS sensors, 1,200 AI signalised junctions |
| Map data | OpenStreetMap raster tiles + Overpass API landmarks + OSRM walking profiles |

The app ships a **simplified but real** subset (10 bus routes / 62 stops / ~90 rail stations) so the routing engine stays fast and offline-capable; the schema and ETL pipeline are built for the full 5,199-stop feed.

## 3. Feature tour

**A · Bus system**  
GTFS static routes, stops and headways · GTFS-RT vehicle positions · stop detail with walking map, nearby landmarks and transfer options · “Near Me” GPS detection (with low-accuracy fallback) · live bus tracking on the vector map · route planner (fastest / cheapest / fewest transfers) · offline map tile packs.

**B · Train system**  
BTS / MRT / ARL journey planner · real fare matrix calculator · next-train countdown per direction · boarding direction (*toward Mo Chit*) · interchange guidance **platform → fare gate → exit**.

**C · Smart city integration**  
AI assistant in TH/MY/EN · “find nearest bus/train” · landmark-based navigation · AI crowd-level inference · Smart Stop digital board simulation with trilingual marquee.

**D · Map & routing**  
OSM + Overpass data model, OSRM-style walking speeds, GPS accuracy fallback, multi-modal walk → bus → train → walk plans with per-boarding fares.

**E · Multilingual**  
Myanmar (Unicode), Thai, English · Unicode-range language auto-detection · transit terminology glossary · every journey explained step-by-step in all three languages.

## 4. Quick start

```bash
npm install
npx expo start            # Expo Go: i (iOS) / a (Android) / w (web)
npm run web               # fast web preview
npx tsc --noEmit          # type-check
```

## 5. Repository layout

```
App.tsx                    navigation shell (native stack, 7 routes)
src/
  theme.ts                 dark/light palettes, spacing, shadows, contrast
  themeContext.tsx         theme + accessibility resolution provider
  i18n.ts                  trilingual dictionary, language detection, glossary
  store.tsx                settings, favourites, journey history (AsyncStorage)
  types.ts                 shared domain types
  data/
    rail.ts                8 rail lines + ~90 stations (coords, exits, codes)
    bus.ts                 10 bus/boat routes + 62 stops (smart-stop flags)
    landmarks.ts           38 landmarks, 10 categories, trilingual
    geo.ts                 projection, haversine, GPS fixtures, roads, river
    network.ts             2026 network statistics + smart-city programme
    blueprint.ts           architecture diagram, SQL schema, API samples
  lib/
    router.ts              multimodal Dijkstra + journey narration
    gtfs.ts                GTFS-RT vehicle simulator, arrivals, feed JSON
    fare.ts                fare matrices + payment notes
    nlu.ts                 multilingual intent parser
    format.ts, useNow.ts   countdown & formatting helpers
  components/              ui kit, MapCanvas (vector map), TabBar, JourneyCard
  screens/                Home, Map, Planner, Journey, Stop, Station, SmartBoard,
                           Assistant, Settings, Offline, Blueprint, Main shell
docs/                      full system documentation (see below)
```

## 6. Documentation

| Doc | Contents |
|---|---|
| [01 · Architecture](docs/01-architecture.md) | Text diagram, components, realtime pipeline, cloud topology |
| [02 · Database schema](docs/02-database-schema.md) | PostgreSQL + PostGIS DDL for GTFS, RT, users, multilingual content |
| [03 · API](docs/03-api.md) | REST + WebSocket endpoints with JSON examples |
| [04 · UI wireframes](docs/04-ui-wireframes.md) | ASCII wireframes for all 11 screens |
| [05 · Multilingual](docs/05-multilingual.md) | MM/TH/EN copy, detection rules, terminology dictionary |
| [06 · GTFS integration](docs/06-gtfs-integration.md) | Static + Realtime ingestion guide, validation, coordinates |
| [07 · Smart Stop](docs/07-smart-stop.md) | Board logic, signage spec, walking-map indicators |
| [08 · AI assistant](docs/08-ai-assistant.md) | Conversation flows, prompts, RAG design |
| [09 · Developer guide](docs/09-developer-guide.md) | Conventions, how to add a route/line/language |
| [10 · Testing checklist](docs/10-testing-checklist.md) | Functional, realtime, i18n, a11y, performance |
| [11 · Deployment](docs/11-deployment.md) | EAS builds, Vercel web, Supabase, Cloudflare |
| [12 · Roadmap](docs/12-roadmap.md) | 5-phase delivery plan (month 1 → month 5) |

## 7. Sample journey produced by the engine

`stop-victory` (Victory Monument bus hub) → `arl-suvarnabhumi` (Suvarnabhumi Airport)

```
Walk 3 min (120 m) → stop-victory
Bus 511 toward Sathorn · 6 stops · 18 min · ฿15
BTS Sukhumvit Line (Platform 2) toward Samrong · 4 stops · 11 min
ARL toward Suvarnabhumi · 6 stops · 24 min · ฿32
─────────────────────────────────────────────────────
Total 61 min · ฿47 · 1 transfer · 1.42 kg CO₂ saved
```

## 8. Licence & data attribution

App code MIT (see `LICENSE`). Transport data modelled on public GTFS feeds from BMTA / BTS / MRT / SRTET; map geometry © OpenStreetMap contributors (ODbL). Fare matrices are a November-2025 snapshot — always verify against the operators’ official calculators (bts.co.th, mrtbangkok.com, srtet.co.th).
