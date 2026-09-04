# 04 · UI wireframes (ASCII)

Design language: night-city dark palette by default with a light "paper" mode, generous spacing, pill controls, line-liveried colours (BTS green, MRT blue, ARL maroon, gold for smart stops).

## 4.1 Home dashboard

```
┌──────────────────────────────────────────────────┐
│ မင်္ဂလာနေ့လယ်ခင်း / สวัสดีตอนบ่าย / Good afternoon   🇹🇭🇲🇲🇬🇧 │
│ 📍 Siam Discovery · ±12 m                                  │
│                                                            │
│ (●) LIVE · 33 vehicles live · simulated GTFS-RT            │
│                                                            │
│ QUICK ACTIONS                                              │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                │
│ │   🧭   │ │   🌿   │ │   💬   │ │   📺   │                │
│ │Near me │ │Plan    │ │Ask AI  │ │Smart   │                │
│ │        │ │a trip  │ │        │ │board   │                │
│ └────────┘ └────────┘ └────────┘ └────────┘                │
│                                                            │
│ BANGKOK NETWORK                                            │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                        │
│ │ 5,199│ │ 1,100│ │   7  │ │ 2,200│                        │
│ │stops │ │smart │ │lines │ │EV    │                        │
│ └──────┘ └──────┘ └──────┘ └──────┘                        │
│                                                            │
│ NEAR YOU · NEXT DEPARTURES                          View all │
│ ┌──────────────────────────────────────────────────┐      │
│ │ 🚌 Asok Junction · GTFS 2205 · 230 m              │      │
│ └──────────────────────────────────────────────────┘      │
│ ┌───────┐ ┌───────────────────────┐ ┌────────┐             │
│ │ 511 EV│ │ Pak Kret              │ │ 3min   │ ○○○○        │
│ │ EV-12 │ │ Samrong               │ │ 8min   │ ○○○○        │
│ │ 77 SCH│ │ Min Buri              │ │ 11m    │ ○○○○        │
│ └───────┘ └───────────────────────┘ └────────┘             │
│                                                            │
│ NEXT TRAINS                                                │
│ ┌──────────────────────────────────────────────────┐      │
│ │ Siam · 40 m · CEN                                  │      │
│ │ ● Sukhumvit → สำโรง / Samrong              2min  │      │
│ │ ● Silom    → บางหว้า / Bang Wa              4min  │      │
│ └──────────────────────────────────────────────────┘      │
│                                                            │
│ SMART CITY PROGRAMME  (EV buses · AI traffic · ITS grid)   │
└────────────────────────────────────────────────────────────┘
```

## 4.2 Live map

```
┌────────────────────────────────────────────────────┐
│ (Bus·33) (Rail) (Smart Stops) (Landmarks)              │
│                                                        │
│   ·   ╲                                        │
│  🚊────●────●────●          river = water            │
│       ╱  ●      ╲  🚌                                │
│  ~~~/~     ◉ you  \~~~                                │
│      ●────●────●     ●                                 │
│                    station dots · stop squares ·       │
│                    moving bus pills                    │
│                                    ┌────┐              │
│                                    │ 📍 │              │
│                                    └────┘              │
├────────────────────────────────────────────────────┤
│ NEAR YOU · Siam Discovery                              │
│ Low GPS accuracy — showing candidates within 300 m     │
│ ┌──────────────────────────────────────────────────┐│
│ │ 🚇 Siam                                   40 m · 1min│
│ │ 🚌 Siam (2601)                        55 m · 2min│
│ │ 🏛 MBK Center                        120 m · 3min│
│ └──────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────┘
```

## 4.3 Route planner

```
┌────────────────────────────────────────────────────┐
│ Plan a trip / วางแผนเดินทาง / ခရီးစဉ်                    │
│ walk → bus → rail → walk                              │
│ ┌──────────────────────────────────────────────────┐│
│ │ ●  FROM   Victory Monument                          ││
│ │ │  TO     Suvarnabhumi Airport                 ⇅   ││
│ │ ○                                                   ││
│ │ ┌ Search station, stop or landmark… ┐           ││
│ └──────────────────────────────────────────────────┘│
│ (📍 My location)  (✕ Clear)                               │
│ ╭──────────┬──────────┬──────────────╮                   │
│ │ ⚡Fastest│ 💵Cheapest│ ⇄Fewest xfer │                   │
│ ╰──────────┴──────────┴──────────────╯                   │
│ ┌──────────────────────────────────────────────────┐│
│ │ 61 min  [Recommended] [Fastest]              ○○○○││
│ │ ฿47 · 1 transfer · 120 m · 1.42 kg CO₂            ││
│ │ (🚶)(🚌 511)(🚇 Sukhumvit)(🚆 ARL)                  ││
│ └──────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────┘
```

## 4.4 Bus stop detail / Smart Stop board

```
 STOP DETAIL                                     SMART STOP · LIVE BOARD
┌────────────────────────────────────┐  ┌────────────────────────────────┐
│ 🚌 Asok Junction                       │  │ ✕        ป้ายอัจฉริยะ      18:42 │
│ GTFS stop_id 2205 · 13.7372,100.5595 ★ │  │ ASOK JUNCTION                          │
│ [Digital Smart Stop] [Shelter]           │  │ GTFS stop_id 2205                       │
│                                          │  │                                          │
│ ARRIVALS                                 │  │ ┌──────┐ PAK KRET              3min │
│ ┌──────────────────────────────────┐   │  │ │ 511  │ ปากเกร็ด         ○○○○ │
│ │ 511 · Pak Kret              3min │ ○○○○│   │ └──────┘                            │
│ │ 77  · Min Buri             11m   │ ○○○○│   │ ┌──────┐ SAMRONG               8min │
│ └──────────────────────────────────┘   │  │ │EV-12 │ สำโรง               ○○○○ │
│ [📺 Open digital board]                    │  │ └──────┘                            │
│ WALKING MAP (mini canvas + GPS)             │  │ CB1  WANG LANG PIER           14m │
│ LANDMARKS NEARBY · 6                         │  │                                          │
│ 🏛 Terminal 21 · 130 m · 3 min                │  │ ⚠  แตะบัตรแรบบิท หรือ EMV ที่ประตู   │
│ 🌳 Benjakitti Park · 350 m                    │  │ GTFS-Realtime · BMTA 2026              │
│ TRANSFER · BTS Asok 60 m                        │  └────────────────────────────────┘
└────────────────────────────────────┘
```

## 4.5 Station detail · AI assistant · Settings

```
┌ STATION DETAIL ─────────────┐ ┌ ASK AI ─────────────────────┐
│ 🚇 Siam  CEN · BTS · BTS        │ │ [Nearest train][bus][Grand     │
│ [First 05:15] [Last 00:20]      │ │  Palace][Crowd][Help]          │
│                                  │ │                                │
│ NEXT TRAINS                     │ │ AI: Sawasdee! I can find stops │
│ ● Sukhumvit → Samrong     2min  │ │ and plan trips in 3 languages.│
│   Platform 2 · ○○○○             │ │ You: route to Grand Palace     │
│ ● Silom → Bang Wa         4min  │ │ AI: 27 min · ฿22 · 1 transfer │
│                                  │ │    [walk][BTS][MRT][walk]      │
│ INTERCHANGE                     │ │    🔎 Open journey             │
│ PLATFORM → GATE → EXIT          │ │                                │
│ 🚶 ARL Phaya Thai (skywalk)     │ │ ┌ Ask in Thai/Myanmar/English ┐│
│ 💳 Rabbit / EMV tap in-out       │ │ └───────────────────────(📤)──┘│
└────────────────────────────────┘ └────────────────────────────────┘

┌ SETTINGS ─────────────────────┐
│ LANGUAGE   [🇹🇭][🇲🇲][🇬🇧]            │
│   ☑ Auto-detect from typed text    │
│ APPEARANCE [System][Light][Dark]    │
│ ACCESSIBILITY                       │
│   Text size        − 100% +         │
│   ☐ High contrast                   │
│   ☑ Reduce motion                   │
│ DATA & OFFLINE                      │
│   ☐ Offline mode (cached tiles)     │
│   🗺 Offline & cached data    1.4 GB │
│   Clear journey history (4)         │
│ TRANSIT GLOSSARY (6 entries)        │
│ SYSTEM  Architecture · Schema · API │
│ v1.0.0 · Created by Moekyawaung     │
└────────────────────────────────────┘
```
