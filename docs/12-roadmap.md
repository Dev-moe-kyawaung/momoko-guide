# 12 · Roadmap (5 months)

| Phase | Month | Deliverables | Exit criteria |
|---|---|---|---|
| **1 · GTFS + Map + basic UI** | Month 1 | ETL for BMTA/BTS/MRT/ARL static feeds, PostGIS schema, vector map canvas, Home/Map shells, trilingual dictionary | 5,199 stops loaded, map renders offline, i18n switch works |
| **2 · Bus + train routing engine** | Month 2 | Multimodal Dijkstra, fare matrices (Rabbit/EMV/cash), route planner UI, journey detail with 3-language narration | p95 plan < 120 ms online, fares match operator calculators |
| **3 · AI assistant + multilingual NLU** | Month 3 | Intent parser (TH/MY/EN), RAG retrieval over stops/landmarks, crowd inference, landmark-based navigation | ≥ 90 % intent accuracy on 300-utterance set |
| **4 · Smart Stop + realtime GPS** | Month 4 | GTFS-RT ingestion, WebSocket streaming, digital board (500 stops), walking maps for 600 renovated stops, GPS accuracy fallback | countdown ±45 s p90, board uptime ≥ 99.5 % |
| **5 · QA + deployment** | Month 5 | Accessibility pass, offline tile packs, performance tuning, EAS/Vercel/Cloudflare deployment, store submission | crash-free ≥ 99.5 %, App Store + Play + web live |

## Post-launch backlog

1. Multi-day passes and tourist fare products (3-day Rabbit, ARL Express).
2. Push notifications: "leave now" alerts and service disruption alerts (multilingual).
3. Crowd heatmap layer + seat-availability prediction per car.
4. Accessibility mode: step-free routing (lifts, ramps) per station.
5. Community reporting: broken lifts, flooded walkways (moderated).
6. Open data portal: publish normalised GTFS + API key self-service.
