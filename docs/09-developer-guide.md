# 09 · Developer guide

## 9.1 Local setup

```bash
npm install
npx expo start        # i = iOS simulator, a = Android, w = web
npx tsc --noEmit      # type-check (strict mode)
npx expo export --platform all   # production bundle check
```

Node 20+ · Expo SDK 52 · TypeScript strict.

## 9.2 Conventions

| Area | Rule |
|---|---|
| Language | TypeScript strict, no `any` in domain code (icons use `any` via `component prop`) |
| State | Global app state in `src/store.tsx` (settings/favourites/history); ephemeral UI state local |
| i18n | **Every** user-facing string goes through `t('key', lang)` in `src/i18n.ts` |
| Theming | Never hard-code colours — use `useThemed()` tokens |
| Data | Domain data lives in `src/data/*` and mirrors GTFS schema names |
| Screens | One file per screen in `src/screens`; navigation via typed `RootStackParamList` |
| Time | Countdowns use `useNow(interval)` + `epochSec` so boards tick in real time |

## 9.3 Adding a bus route

```ts
// src/data/bus.ts
export const BUS_ROUTES: BusRoute[] = [
  {
    id: 'bus-180', code: '180', kind: 'bus', fuel: 'electric',
    en: 'Min Buri – Bang Na', th: 'มีนบุรี – บางนา', my: 'မင်းပြည် – ဘောင်နား',
    fareThb: 15, fareNote: 'air-con / รถปรับอากาศ', color: '#22B07D',
    headwayPeakMin: 9,
    stops: ['stop-min-buri', 'stop-ramkhamhaeng', 'stop-bangna-bus'],
  },
];
```

Stop ids must already exist in `BUS_STOPS` (create stops with real coordinates first). The router picks the route up automatically (edges + fares + live vehicles).

## 9.4 Adding a rail station

```ts
// src/data/rail.ts
S({ id: 'bts-newstation', code: 'E16', lineId: 'bts-sukhumvit',
    lat: 13.6501, lng: 100.6510, en: 'New Extension', th: 'ส่วนต่อขยาย', my: 'တိုးချဲ့ရာဘူတာ',
    exits: ['Exit 1 → Road'] }),
```

Also append the id to the owning line's `stations` array (order = track order; used for direction "toward terminus" and platform assignment).

## 9.5 Adding a language

1. Extend `Lang` in `src/types.ts` (`'en' | 'th' | 'my' | 'km'`).
2. Add the entry to every key in `src/i18n.ts` (typed — TS will flag missing fields).
3. Add a `LANGS` row (native label + flag).
4. Extend `detectLang()` with the script range.
5. Add `name_km` columns to `multilingual_texts` and re-run the ETL.

## 9.6 Routing engine internals

* Graph build is lazy and happens once (`build()` in `src/lib/router.ts`).
* States are `(stopId, lineKey)` so transfer counting and per-boarding fares are exact.
* Objectives: `fastest` = minutes + 5 min transfer penalty · `cheapest` = ฿×1.7 + min×0.12 · `fewest` = minutes + 45 per transfer.
* Speeds: walk 4.6 km/h · bus 14 km/h · boat 12 km/h · rail 34 km/h; detour factors 1.18 / 1.35 / 1.15 / 1.12.
* Headway wait = headway / 2 added on the boarding segment.

## 9.7 Performance notes

* Map canvas draws ~400 absolutely positioned views; keep marker lists filtered (see `MapScreen` chips).
* Vehicle polling is a single 2 s interval per mounted screen (`useLiveVehicles`).
* `planJourneys` runs on the JS thread in < 10 ms for this network size; for the full 5,199-stop feed move it to the FastAPI worker (`/v1/journey`).

## 9.8 Debug helpers

```bash
npx expo start --clear     # reset Metro cache
npx expo-doctor            # dependency health
```

In-app: *Settings → System blueprint* renders the architecture, SQL schema, API samples and roadmap — useful during reviews and demos.
