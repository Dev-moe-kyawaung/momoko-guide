# 05 · Multilingual support (မြန်မာ · ไทย · English)

## 5.1 Detection rules

Language is detected on-device with Unicode ranges (no network call) — `src/i18n.ts → detectLang()`:

| Script | Range | Language |
|---|---|---|
| Thai | `U+0E00–U+0E7F` | `th` |
| Myanmar | `U+1000–U+109F` | `my` |
| Latin | `A–Z a–z` | `en` |

Rule: count characters per script, highest wins; ties fall back to the user's chosen UI language. With *Settings → Language → Auto-detect* enabled, assistant replies follow the detected script while the UI keeps the chosen language.

```ts
export function detectLang(text: string): Lang | null {
  let thai = 0, myanmar = 0, latin = 0;
  for (const ch of text) {
    const c = ch.codePointAt(0) ?? 0;
    if (c >= 0x0e00 && c <= 0x0e7f) thai += 1;
    else if (c >= 0x1000 && c <= 0x109f) myanmar += 1;
    else if ((c >= 65 && c <= 90) || (c >= 97 && c <= 122)) latin += 1;
  }
  if (thai + myanmar + latin === 0) return null;
  if (thai >= myanmar && thai >= latin) return 'th';
  if (myanmar >= thai && myanmar >= latin) return 'my';
  return 'en';
}
```

## 5.2 Sample UI copy

| Key | 🇹🇭 Thai | 🇲🇲 Myanmar | 🇬🇧 English |
|---|---|---|---|
| appName | กรุงเทพ ทรานซิท | ဘန်ကောင် သွားလာရေး | Bangkok Transit |
| nextDepartures | รถออกถัดไป | နောက်ထွက်မည့် ယာဉ် | Next departures |
| fastest / cheapest / fewest | เร็วที่สุด / ถูกที่สุด / เปลี่ยนน้อยที่สุด | အမြန်ဆုံး / ဈေးအပေါဆုံး / အနည်းဆုံး ကူးပြောင်း | Fastest / Cheapest / Fewest transfers |
| smartDigital | ป้ายดิจิทัลอัจฉริยะ | ဒစ်ဂျစ်တယ် စမတ်ဂိတ် | Digital Smart Stop |
| crowdHigh | แออัดมาก | အလွန်များသည် | Very crowded |
| boardNotice | แตะบัตรแรบบิท หรือ EMV ที่ประตู | တံခါးတွင် ရယ်ဘစ် သို့မဟုတ် EMV ကို တို့ပါ | Tap Rabbit Card or EMV contactless at the gate |

## 5.3 Sample station names (feed + display)

| en | th | my |
|---|---|---|
| Siam | สยาม | ဆိုင်းယမ် |
| Victory Monument | อนุสาวรีย์ชัยสมรภูมิ | အောင်ခြိန်ရုပ်တု |
| Asok | อโศก | အိုက်ဆုကျော့ |
| Hua Lamphong | หัวลำโพง | ဟုံးလမ်ဖုန် |
| Suvarnabhumi Airport | สนามบินสุวรรณภูมิ | ဆူဝန်နဖူမီ လေဆိပ် |
| Mo Chit | หมอชิต | မိုးချစ် |
| Bang Wa | บางหว้า | ဘောင်ဝါ |

## 5.4 Sample journey narration (same trip, three languages)

```
TH  เดิน 3 นาที (120 ม.) ไปป้ายอนุสาวรีย์ชัย → นั่งรถ 511 สาทร 6 ป้าย (15 บาท)
    → ขึ้น BTS สายสุขุมวิท ชานชาลา 2 มุ่งหน้าสำโรง 4 สถานี
    → ต่อ ARL ลงสถานีสุวรรณภูมิ (32 บาท)

MY  ၃ မိနစ် လမ်းလျှောက်ပါ (၁၂၀ မီတာ) → 511 စီးပါ (၆ ဂိတ်၊ ၁၅ ကျပ်)
    → BTS ဆူချွမ်ဗစ် စီးပါ၊ ခုံ ၂ မှ ဆမ်ရုံဘက် (၄ ဘူတာ)
    → ARL စီးပြီး လေဆိပ်တွင် ဆင်းပါ (၃၂ ကျပ်)

EN  Walk 3 min (120 m) to Victory Monument stop → Take 511 to Sathorn, 6 stops (฿15)
    → Board BTS Sukhumvit Line, Platform 2 toward Samrong, 4 stops
    → Transfer to ARL, alight at Suvarnabhumi Airport (฿32)
```

## 5.5 Transit terminology dictionary

| English | ไทย | မြန်မာ | Note |
|---|---|---|---|
| Bus stop | ป้ายรถเมล์ | ဘတ်စ်ဂိတ် | 5,199 in the feed |
| Smart Stop | ป้ายอัจฉริยะ | စမတ်စတော့ | 600 renovated + 500 digital |
| Fare gate | ประตูบัตร | တံခါးဂိတ် | tap in / tap out |
| Interchange | สถานีเปลี่ยนสาย | ကူးပြောင်းဘူတာ | same complex |
| Headway | ความถี่รถ | ထွက်ချိန်ကြာချိန် | minutes between vehicles |
| Boarding direction | มุ่งหน้า | ဦးတည်ခရီး | e.g. toward Mo Chit |
| Walking map | แผนที่เดิน | လမ်းလျှောက်မြေပုံ | 30+ landmark indicators |
| GTFS-Realtime | GTFS เรียลไทม์ | GTFS-Realtime | vehicle + arrival feed |

## 5.6 Conventions

1. All display strings live in `src/i18n.ts` (typed dictionary) — never inline in components.
2. Domain objects (`Station`, `BusStop`, `Landmark`, `RailLine`) carry `{en, th, my}` name triplets.
3. Myanmar text is Unicode only (no Zawgyi conversion anywhere).
4. Thai text keeps tone marks intact — never uppercase or letter-space Thai labels.
5. Layouts use flexible width + `numberOfLines`; My/Thai strings are longest.
6. Numbers: Arabic numerals everywhere (standard in Thai and modern Myanmar signage).
