# 10 · Testing checklist

## 10.1 Functional

- [ ] Home shows greeting, LIVE badge, quick actions, network stats, near-me departures, next trains
- [ ] Pull-to-refresh on Home re-computes arrivals
- [ ] Map renders river, roads, rail lines, bus corridors, stops, stations, landmarks, moving vehicles, GPS dot
- [ ] Filter chips toggle bus / rail / smart stops / landmarks
- [ ] Tapping a marker opens the detail card; buttons navigate to Stop/Station detail or prefill the planner
- [ ] Low-accuracy GPS fix (> 40 m) shows the fallback banner
- [ ] Planner: autocomplete, swap, current location, clear, three objectives, empty state, recents
- [ ] Journey detail: timeline, live ETA badges, platform/toward/exit rows, 3-language narration toggle
- [ ] Stop detail: arrivals tick every second, landmarks sorted by distance, transfer stations, route cards, digital board CTA
- [ ] Station detail: next trains both directions, interchange guidance, line map scroller, fare calculator rows
- [ ] Smart board: full-screen, auto-rotates pages every 8 s (disabled with reduce-motion), clock updates
- [ ] Assistant: chips, intents (nearest/route/fare/crowd/help/unknown), journey cards open the journey screen, language auto-detection
- [ ] Settings: language, theme, font scale, high contrast, reduce motion, offline mode, clear history/favourites, glossary, GitHub link
- [ ] Offline screen: tile packs, cache size, GTFS version, refresh with spinner

## 10.2 Realtime

- [ ] Vehicle positions advance between ticks and wrap at termini
- [ ] ETAs decrease in real time; "Arriving" appears ≤ 25 s
- [ ] Delay injected via `delaySec` pushes ETAs later
- [ ] Schedule fallback (`SCHED` badge) appears when no vehicle can serve the stop
- [ ] Feed age > 120 s logic (backend) surfaces as schedule-only arrivals

## 10.3 Routing correctness

- [ ] Same-line trips never count a transfer
- [ ] BTS ↔ MRT interchanges (Sala Daeng↔Si Lom, Asok↔Sukhumvit, Mo Chit↔Pink) produce walk legs
- [ ] ARL trips to Suvarnabhumi cap at ฿45
- [ ] Cheapest option never costs more than fastest; fewest never has more transfers than fastest
- [ ] Impossible pairs return the trilingual "no route" empty state

## 10.4 Localization

- [ ] UI switches instantly between TH / MY / EN (no restart)
- [ ] Auto-detect: typing Thai/Myanmar/English in the assistant answers in that language
- [ ] Myanmar renders in Unicode (no Zawgyi mojibake)
- [ ] Thai tone marks are not clipped at large font scale
- [ ] Station/stop names show the correct script everywhere (cards, board, steps)

## 10.5 Accessibility

- [ ] Font scale 85 % → 160 % keeps layouts intact (no truncation of key values)
- [ ] High contrast keeps AA contrast on text/borders in both themes
- [ ] Reduce motion disables page rotation on the smart board
- [ ] Touch targets ≥ 44 × 44 pt for tabs, chips, markers (hitSlop verified)
- [ ] Screen reader labels on icon-only buttons

## 10.6 Platforms & performance

- [ ] iOS / Android / web (react-native-web) render the vector map identically
- [ ] Cold start < 2.5 s on a mid-range Android device
- [ ] Map with all layers on: ≥ 45 fps while vehicles move
- [ ] No memory growth after 10 min of polling
- [ ] Offline mode: app opens, plans routes, shows timetable without network

## 10.7 Regression suite (CI)

```bash
npx tsc --noEmit           # must be clean
npx expo export --platform all   # bundling must succeed
npx expo-doctor
```

Unit tests to add: `router.test.ts` (fares, transfers, determinism), `nlu.test.ts` (intent + detection per language), `gtfs.test.ts` (ETA monotonicity), `fare.test.ts` (matrix bounds).
