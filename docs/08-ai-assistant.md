# 08 · AI assistant — conversation flows & prompts

## 8.1 Architecture

```
user text (TH / MY / EN)
   |
   +- Unicode-range language detection (on-device, instant)
   +- intent parser (rule fallback, on-device)
   +- NLU service (embeddings + LLM router, when online)
         |
         +- retrieval: stops/landmarks/lines (pgvector, trilingual)
         +- reasoning: routing engine (/journey) + fare engine + crowd model
         +- reply templated in the detected language
```

## 8.2 Supported intents

| Intent | Trigger words (EN / TH / MY) | Action |
|---|---|---|
| `greeting` | hello, hi, sawasdee / สวัสดี / မင်္ဂလာပါ | welcome + capability summary |
| `help` | help, what can you do / ช่วย ทำอะไร / ဘာလုပ် | capability list |
| `nearest rail` | station, train, bts, mrt / สถานี รถไฟ / ဘူတာ ရထား | nearest 3 stations + next trains |
| `nearest bus` | bus, stop / ป้าย รถเมล์ / ဘတ်စ် ဂိတ် | nearest 3 stops + next arrivals |
| `route` | route, go to / ไปที่ เดินทางไป / သွားမည် ခရီးစဉ် | journey plan from current GPS |
| `fare` | fare, cost, how much / ค่าโดยสาร ราคา / လက်ငင်း ဈေးနှုန်း | cheapest plan + fare breakdown |
| `crowd` | crowd, busy / แออัด คนเยอะ / လူများ လူပြည့် | AI crowd inference at nearest hub |
| fallback | — | suggestions: nearest station, route to Ekkamai, fare to Suvarnabhumi |

## 8.3 Example conversations

### A · Myanmar — nearest station

```
User   : ဘူတာ ဘယ်မှာလဲ
Detect : my
Intent : nearest(rail)
AI     : သင့်အနီးရှိ ရထားဘူတာများ:
         1. ဆိုင်းယမ် · 40 m · ဆမ်ရုံဘက် 2min
         2. ရာ့ချဒမ်ရီ · 260 m · ဖလျုံချစ်ဘက် 4min
         3. စီလုံ · 340 m · ဘောင်ဝါဘက် 3min
```

### B · Thai — route to a landmark

```
User   : ไปพระบรมมหาราชวังจาก BTS อโศก
Detect : th
Intent : route(from=bts-asok, to=lm-grandpalace)
AI     : เส้นทางไป พระบรมมหาราชวัง: 27 นาที · 22 บาท · เปลี่ยน 1 ครั้ง
         - เดิน 4 นาที ถึง MRT สุขุมวิท
         - MRT สายสีน้ำเงิน มุ่งหน้าหัวลำโพง 3 สถานี (ลงสถานีสนามไชย)
         [ เปิดเส้นทาง ]
```

### C · English — fare query

```
User   : fare to Suvarnabhumi
Detect : en
Intent : fare(to=arl-suvarnabhumi)
AI     : Cheapest: BTS to Phaya Thai ฿17, then ARL ฿45 -> total ฿62 (EMV daily cap ฿65).
         Fastest: ARL from Phaya Thai, 31 min.
```

### D · Crowd prediction (Thai)

```
User   : แออัดไหม
Detect : th
Intent : crowd
AI     : ระดับความแออัด (AI inference)
         อนุสาวรีย์ชัย -> สำโรง: มีที่นั่ง
         511 · ปากเกร็ด: ยืนได้
```

## 8.4 Prompt templates (server side)

```
system:
You are the Bangkok Transit assistant. Answer ONLY from the provided context
(stops, lines, fares, live arrivals). Reply in the user's language
(th / my / en) using the exact names from context. Keep answers under 60 words.
If a journey is requested, call the routing tool and summarise legs:
mode, line/route code, direction (toward X), stops, minutes, fare, transfers.
Never invent stop names or fares.

tools:
  route()  -> GET /v1/journey?from={from}&to={to}&objective=fastest
  crowd()  -> GET /v1/stops/{id}/arrivals + occupancy model
  fare()   -> GET /v1/fare?from={from}&to={to}&payment=emv
```

## 8.5 Offline behaviour

On device, `src/lib/nlu.ts` reproduces the core intents with keyword sets, so the assistant keeps working offline: nearest stop/station, route planning, fare summary and crowd lookup all run against the cached GTFS snapshot.

## 8.6 Evaluation targets

| Metric | Target |
|---|---|
| Intent accuracy (TH/MY/EN test set of 300 utterances) | ≥ 90 % |
| Place-name extraction F1 | ≥ 0.95 |
| Reply latency (p95, online) | < 1.8 s |
| Fallback rate | < 8 % |
