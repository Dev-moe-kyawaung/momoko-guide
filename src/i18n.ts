import type { I18nName, Lang } from './types';

export const LANGS: { id: Lang; label: string; native: string; flag: string }[] = [
  { id: 'th', label: 'Thai', native: 'ไทย', flag: '🇹🇭' },
  { id: 'my', label: 'Myanmar', native: 'မြန်မာ', flag: '🇲🇲' },
  { id: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
];

/**
 * Unicode-range language detection — works on device without a network call.
 * Thai block U+0E00–U+0E7F, Myanmar block U+1000–U+109F.
 */
export function detectLang(text: string): Lang | null {
  let thai = 0;
  let myanmar = 0;
  let latin = 0;
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

/** Pick the name matching the UI language, with graceful fallback. */
export function nameOf(n: I18nName | undefined, lang: Lang): string {
  if (!n) return '';
  return n[lang] || n.en || n.th || n.my;
}

type Entry = Record<Lang, string>;

const S: Record<string, Entry> = {
  appName: { en: 'Bangkok Transit', th: 'กรุงเทพ ทรานซิท', my: 'ဘန်ကောင် သွားလာရေး' },
  appTagline: { en: 'Bus · Rail · Boat · Walking, in one app', th: 'รถเมล์ · รถไฟ · เรือ · เดิน ในแอปเดียว', my: 'ဘတ်စ် · ရထား · သင်္ဘော · လမ်းလျှောက် — တစ်နေရာတည်း' },
  tabHome: { en: 'Home', th: 'หน้าแรก', my: 'ပင်မ' },
  tabMap: { en: 'Map', th: 'แผนที่', my: 'မြေပုံ' },
  tabPlan: { en: 'Plan', th: 'วางแผน', my: 'ခရီးစဉ်' },
  tabAsk: { en: 'Ask AI', th: 'ถาม AI', my: 'AI မေး' },
  tabSettings: { en: 'Settings', th: 'ตั้งค่า', my: 'ဆက်တင်' },

  // Home
  greetingMorning: { en: 'Good morning', th: 'สวัสดีตอนเช้า', my: 'မင်္ဂလာနံနက်ခင်း' },
  greetingAfternoon: { en: 'Good afternoon', th: 'สวัสดีตอนบ่าย', my: 'မင်္ဂလာနေ့လယ်ခင်း' },
  greetingEvening: { en: 'Good evening', th: 'สวัสดีตอนเย็น', my: 'မင်္ဂလာညနေခင်း' },
  nearMe: { en: 'Near you', th: 'ใกล้คุณ', my: 'သင့်အနီး' },
  nextDepartures: { en: 'Next departures', th: 'รถออกถัดไป', my: 'နောက်ထွက်မည့် ယာဉ်' },
  railNext: { en: 'Next trains', th: 'รถไฟถัดไป', my: 'နောက်ရထား' },
  viewAll: { en: 'View all', th: 'ดูทั้งหมด', my: 'အားလုံးကြည့်' },
  quickActions: { en: 'Quick actions', th: 'ทางลัด', my: 'အမြန်လုပ်ဆောင်ချက်' },
  findNearMe: { en: 'Stops near me', th: 'ป้ายใกล้ฉัน', my: 'ကျွန်ုပ်အနီး ဂိတ်များ' },
  planTrip: { en: 'Plan a trip', th: 'วางแผนเดินทาง', my: 'ခရီးစဉ် စီစဉ်' },
  askAi: { en: 'Ask the AI', th: 'ถามผู้ช่วย AI', my: 'AI ကိုမေး' },
  smartBoard: { en: 'Smart Stop board', th: 'ป้ายอัจฉริยะ', my: 'စမတ်စတော့ ဘုတ်' },
  networkStats: { en: 'Bangkok network', th: 'เครือข่ายกรุงเทพ', my: 'ဘန်ကောင်ကွန်ရက်' },
  busStopsStat: { en: 'bus stops', th: 'ป้ายรถเมล์', my: 'ဘတ်စ်ဂိတ်' },
  smartStopStat: { en: 'smart stops', th: 'ป้ายอัจฉริยะ', my: 'စမတ်ဂိတ်' },
  railStat: { en: 'rail lines', th: 'สายรถไฟ', my: 'ရထားလိုင်း' },
  evStat: { en: 'electric buses', th: 'รถ EV', my: 'မီးစက်ဘတ်စ်' },
  smartCity: { en: 'Smart city programme', th: 'โครงการเมืองอัจฉริยะ', my: 'စမတ်မြို့တော် အစီအစဉ်' },
  liveNow: { en: 'LIVE', th: 'สด', my: 'တိုက်ရိုက်' },
  simulated: { en: 'simulated GTFS-RT feed', th: 'ฟีดจำลอง GTFS-RT', my: 'GTFS-RT နမူနာဒေတာ' },

  // Crowding / generic
  crowd: { en: 'Crowding', th: 'ความแออัด', my: 'လူဦးရေများမှု' },
  crowdLow: { en: 'Seats available', th: 'มีที่นั่ง', my: 'ထိုင်ခုံရနိုင်' },
  crowdMed: { en: 'Standing room', th: 'ยืนได้', my: 'ရပ်နေရမည်' },
  crowdHigh: { en: 'Very crowded', th: 'แออัดมาก', my: 'အလွန်များသည်' },
  crowdPacked: { en: 'Packed', th: 'แน่นมาก', my: 'ပြည့်နေသည်' },
  min: { en: 'min', th: 'นาที', my: 'မိနစ်' },
  minutesShort: { en: 'm', th: 'น.', my: 'မိ.' },
  walk: { en: 'Walk', th: 'เดิน', my: 'လမ်းလျှောက်' },
  transfer: { en: 'Transfer', th: 'เปลี่ยนสาย', my: 'ကူးပြောင်း' },
  transfers: { en: 'transfers', th: 'ครั้ง', my: 'ကြိမ်' },
  baht: { en: 'THB', th: 'บาท', my: 'ကျပ်' },
  depart: { en: 'Depart', th: 'ออกเดินทาง', my: 'ထွက်ခွာချိန်' },
  arrive: { en: 'Arrive', th: 'ถึง', my: 'ရောက်ချိန်' },
  stopsWord: { en: 'stops', th: 'ป้าย', my: 'ဂိတ်' },
  now: { en: 'now', th: 'ตอนนี้', my: 'ယခု' },
  loading: { en: 'Loading…', th: 'กำลังโหลด…', my: 'တင်နေသည်…' },

  // Map
  filters: { en: 'Filters', th: 'ตัวกรอง', my: 'စစ်ထုတ်မှု' },
  showBus: { en: 'Bus', th: 'รถเมล์', my: 'ဘတ်စ်' },
  showRail: { en: 'Rail', th: 'รถไฟ', my: 'ရထား' },
  showSmart: { en: 'Smart Stops', th: 'ป้ายอัจฉริยะ', my: 'စမတ်ဂိတ်' },
  showLandmarks: { en: 'Landmarks', th: 'แลนด์มาร์ก', my: 'နေရာမှတ်' },
  recenter: { en: 'Re-center', th: 'กลับตำแหน่งฉัน', my: 'ကျွန်ုပ်နေရာ' },
  gpsAccuracy: { en: 'GPS accuracy', th: 'ความแม่นยำ GPS', my: 'GPS တိကျမှု' },
  lowAccuracy: { en: 'Low GPS accuracy — showing all candidates within 300 m', th: 'GPS คลาดเคลื่อน — แสดงทุกจุดในรัศมี 300 ม.', my: 'GPS မတိကျ — ၃၀၀ မီတာအတွင်း အားလုံးပြ' },
  legend: { en: 'Legend', th: 'สัญลักษณ์', my: 'သင်္ကေတ' },
  liveVehicles: { en: 'vehicles live', th: 'คันกำลังวิ่ง', my: 'ယာဉ်များ လည်ပတ်နေ' },
  tapStopHint: { en: 'Tap any stop or station for live details', th: 'แตะป้ายหรือสถานีเพื่อดูข้อมูลสด', my: 'ဂိတ်/ဘူတာကို နှိပ်၍ အသေးစိတ်ကြည့်ပါ' },

  // Planner
  from: { en: 'From', th: 'จาก', my: 'မှ' },
  to: { en: 'To', th: 'ไป', my: 'သို့' },
  currentLocation: { en: 'My location', th: 'ตำแหน่งของฉัน', my: 'ကျွန်ုပ်၏ နေရာ' },
  searchPlaceholder: { en: 'Search station, stop or landmark…', th: 'ค้นหาสถานี ป้าย หรือ landmark…', my: 'ဘူတာ၊ ဂိတ် သို့မဟုတ် နေရာ ရှာရန်…' },
  fastest: { en: 'Fastest', th: 'เร็วที่สุด', my: 'အမြန်ဆုံး' },
  cheapest: { en: 'Cheapest', th: 'ถูกที่สุด', my: 'ဈေးအပေါဆုံး' },
  fewest: { en: 'Fewest transfers', th: 'เปลี่ยนน้อยที่สุด', my: 'အနည်းဆုံး ကူးပြောင်း' },
  swap: { en: 'Swap', th: 'สลับ', my: 'ပြောင်း' },
  noResults: { en: 'No route found. Try another landmark or station.', th: 'ไม่พบเส้นทาง ลองสถานีหรือ landmark อื่น', my: 'ခရီးစဉ် မတွေ့ပါ။ အခြားနေရာ စမ်းကြည့်ပါ။' },
  recentJourneys: { en: 'Recent journeys', th: 'การเดินทางล่าสุด', my: 'မကြာမီက ခရီးစဉ်များ' },
  clear: { en: 'Clear', th: 'ล้าง', my: 'ဖျက်' },
  setFrom: { en: 'Set as start', th: 'ตั้งเป็นจุดเริ่ม', my: 'စတင်နေရာ' },
  setTo: { en: 'Set as destination', th: 'ตั้งเป็นปลายทาง', my: 'ခရီးပန်း' },
  plannerHint: { en: 'Multimodal engine: walk → bus → rail → walk', th: 'หลายรูปแบบ: เดิน → รถเมล์ → รถไฟ → เดิน', my: 'ရောနှော ခရီးစဉ် — လမ်းလျှောက် → ဘတ်စ် → ရထား → လမ်းလျှောက်' },

  // Journey
  journeyTitle: { en: 'Journey options', th: 'ตัวเลือกเส้นทาง', my: 'ခရီးစဉ် ရွေးချယ်မှုများ' },
  best: { en: 'Recommended', th: 'แนะนำ', my: 'အကြံပြု' },
  co2: { en: 'CO₂ saved', th: 'ลดคาร์บอน', my: 'CO₂ သက်သာမှု' },
  stepByStep: { en: 'Step by step', th: 'ทีละขั้นตอน', my: 'အဆင့်ဆင့်' },
  explainAll: { en: 'Explain in 3 languages', th: 'อธิบาย 3 ภาษา', my: '၃ ဘာသာ ရှင်းလင်း' },
  realtimeEta: { en: 'Live ETA', th: 'เวลาถึงจริง', my: 'တိုက်ရိုက် ရောက်ချိန်' },
  platform: { en: 'Platform', th: 'ชานชาลา', my: 'ဘူတာရုံခုံ' },
  exit: { en: 'Exit', th: 'ทางออก', my: 'ထွက်ပေါက်' },
  toward: { en: 'toward', th: 'มุ่งหน้า', my: 'ဦးတည်' },

  // Stop detail
  arrivals: { en: 'Arrivals', th: 'รถมาถึง', my: 'ရောက်ရန်' },
  routesHere: { en: 'Routes serving this stop', th: 'สายรถที่ผ่าน', my: 'ဤဂိတ်မှ လိုင်းများ' },
  walkingMap: { en: 'Walking map', th: 'แผนที่เดิน', my: 'လမ်းလျှောက်မြေပုံ' },
  landmarksNearby: { en: 'Landmarks nearby', th: 'แลนด์มาร์กใกล้เคียง', my: 'အနီးအနား နေရာများ' },
  addFavorite: { en: 'Add to favorites', th: 'เพิ่มรายการโปรด', my: 'နှစ်သက်ရာထဲ ထည့်' },
  removeFavorite: { en: 'Remove favorite', th: 'ลบรายการโปรด', my: 'နှစ်သက်ရာမှ ဖယ်' },
  smartDigital: { en: 'Digital Smart Stop', th: 'ป้ายดิจิทัลอัจฉริยะ', my: 'ဒစ်ဂျစ်တယ် စမတ်ဂိတ်' },
  smartRenovated: { en: 'Renovated Stop', th: 'ป้ายปรับปรุงใหม่', my: 'ပြုပြင်ပြီး ဂိတ်' },
  smartClassic: { en: 'Classic Stop', th: 'ป้ายเดิม', my: 'မူလ ဂိတ်' },
  openBoard: { en: 'Open digital board', th: 'เปิดป้ายดิจิทัล', my: 'ဒစ်ဂျစ်တယ်ဘုတ် ဖွင့်' },
  noArrivals: { en: 'No live arrivals right now', th: 'ยังไม่มีรถมาถึง', my: 'တိုက်ရိုက်ရောက်ရှိမှု မရှိသေးပါ' },

  // Station detail
  nextTrains: { en: 'Next trains', th: 'รถไฟถัดไป', my: 'နောက်ရထားများ' },
  interchangeGuide: { en: 'Interchange guidance', th: 'เส้นทางเปลี่ยนสาย', my: 'ကူးပြောင်းလမ်းညွှန်' },
  firstTrain: { en: 'First train', th: 'รถแรก', my: 'ပထမရထား' },
  lastTrain: { en: 'Last train', th: 'รถสุดท้าย', my: 'နောက်ဆုံးရထား' },
  operator: { en: 'Operator', th: 'ผู้ให้บริการ', my: 'လည်ပတ်သူ' },
  tapForDirections: { en: 'Platform → fare gate → exit', th: 'ชานชาลา → ประตู → ทางออก', my: 'ခုံ → တံခါး → ထွက်ပေါက်' },

  // Smart board
  boardTitle: { en: 'SMART STOP · LIVE BOARD', th: 'ป้ายอัจฉริยะ · แสดงสด', my: 'စမတ်စတော့ · တိုက်ရိုက်' },
  boardNotice: { en: 'Tap Rabbit Card or EMV contactless at the gate', th: 'แตะบัตรแรบบิท หรือ EMV ที่ประตู', my: 'တံခါးတွင် ရယ်ဘစ် သို့မဟုတ် EMV ကို တို့ပါ' },
  boardAlt: { en: 'Alternate services', th: 'สายสำรอง', my: 'အခြားလိုင်းများ' },
  boardPowered: { en: 'Powered by GTFS-Realtime · BMTA 2026', th: 'ขับเคลื่อนด้วย GTFS-Realtime · BMTA 2569', my: 'GTFS-Realtime · BMTA ၂၀၂၆ ဖြင့် လည်ပတ်' },

  // Assistant
  assistantHello: { en: 'Sawasdee! I can find stops, plan trips and explain routes in Thai, Myanmar or English. What do you need?', th: 'สวัสดีครับ/คะ ผู้ช่วยหาป้าย วางแผนเส้นทาง และอธิบายเป็น ไทย/မียนมา/อังกฤษ ได้เลย', my: 'မင်္ဂလာပါ! ဂိတ်ရှာခြင်း၊ ခရီးစဉ်စီစဉ်ခြင်း၊ မြန်မာ/ထိုင်း/အင်္ဂလိပ်ဖြင့် ရှင်းလင်းပေးနိုင်ပါသည်။' },
  askPlaceholder: { en: 'Ask in Thai, Myanmar or English…', th: 'พิมพ์คำถาม (ไทย/မียนมา/อังกฤษ)…', my: 'မေးခွန်းရိုက်ပါ (မြန်မာ/ထိုင်း/အင်္ဂလိပ်)…' },
  send: { en: 'Send', th: 'ส่ง', my: 'ပို့' },
  thinking: { en: 'Thinking…', th: 'กำลังคิด…', my: 'စဉ်းစားနေသည်…' },
  chipNearestTrain: { en: 'Nearest train', th: 'รถไฟใกล้สุด', my: 'အနီးဆုံးရထား' },
  chipNearestBus: { en: 'Nearest bus stop', th: 'ป้ายรถเมล์ใกล้สุด', my: 'အနီးဆုံး ဘတ်စ်ဂိတ်' },
  chipToLandmark: { en: 'Route to Grand Palace', th: 'ไปพระบรมมหาราชวัง', my: 'မဟာရာဝီရပ်သို့' },
  chipCrowd: { en: 'Crowd levels', th: 'ความแออัด', my: 'လူဦးရေ' },
  chipExplain: { en: 'Explain in Myanmar', th: 'อธิบายเป็นภาษาไทย', my: 'မြန်မာဘာသာ ရှင်းလင်း' },
  chipHelp: { en: 'What can you do?', th: 'ทำอะไรได้บ้าง?', my: 'ဘာတွေလုပ်နိုင်လဲ?' },
  aiHelp: { en: 'I can: 1) find the nearest bus stop or station, 2) plan walk→bus→rail journeys, 3) calculate fares (Rabbit/EMV), 4) predict crowding, 5) explain every transfer step in Thai, Myanmar and English.', th: 'ทำได้: 1) หาป้าย/สถานีใกล้สุด 2) วางแผน เดิน→รถเมล์→รถไฟ 3) คำนวณค่าโดยสาร 4) คาดการณ์ความแออัด 5) อธิบายทุกขั้นตอน 3 ภาษา', my: 'လုပ်နိုင်သည် — ၁) အနီးဆုံးဂိတ်/ဘူတာရှာရန် ၂) ခရီးစဉ်စီစဉ်ရန် ၃) လက်ငင်းတွက်ရန် ၄) လူဦးရေခန့်မှန်းရန် ၅) ၃ ဘာသာ ရှင်းလင်းရန်။' },
  aiNoIdea: { en: 'Sorry, I did not understand. Try “nearest station”, “route to Ekkamai” or “fare to Suvarnabhumi”.', th: 'ขออภัย ไม่เข้าใจ ลอง “สถานีใกล้สุด” “ไปเอกมัย” หรือ “ค่าโดยสารไปสุวรรณภูมิ”', my: 'စိတ်မပူပါနှင့်၊ “အနီးဆုံးဘူတာ” သို့မဟုတ် “အက်ကမိုင်သို့” ဟု စမ်းရိုက်ကြည့်ပါ။' },

  // Settings
  language: { en: 'Language', th: 'ภาษา', my: 'ဘာသာစကား' },
  autoDetectLabel: { en: 'Auto-detect from typed text', th: 'ตรวจภาษาอัตโนมัติ', my: 'စာသားမှ ဘာသာအလိုက် ဖော်ထုတ်' },
  appearance: { en: 'Appearance', th: 'ธีม', my: 'အသွင်အပြင်' },
  themeSystem: { en: 'System', th: 'ตามระบบ', my: 'စနစ်အလိုက်' },
  themeLight: { en: 'Light', th: 'สว่าง', my: 'အလင်း' },
  themeDark: { en: 'Dark', th: 'มืด', my: 'အမှောင်' },
  accessibility: { en: 'Accessibility', th: 'การเข้าถึง', my: 'ဝင်ရောက်နိုင်မှု' },
  fontScale: { en: 'Text size', th: 'ขนาดตัวอักษร', my: 'စာလုံးအရွယ်' },
  highContrast: { en: 'High contrast', th: 'คอนทราสต์สูง', my: 'ခြားနားမှု မြင့်' },
  reduceMotion: { en: 'Reduce motion', th: 'ลดการเคลื่อนไหว', my: 'လှုပ်ရှားမှု လျှော့' },
  dataCache: { en: 'Data & offline', th: 'ข้อมูลและออฟไลน์', my: 'ဒေတာနှင့် အော့ဖ်လိုင်း' },
  offlineMode: { en: 'Offline mode (cached tiles)', th: 'โหมดออฟไลน์ (แผนที่เก็บไว้)', my: 'အော့ဖ်လိုင်း မုဒ်' },
  clearHistory: { en: 'Clear journey history', th: 'ล้างประวัติ', my: 'ခရီးစဉ်မှတ်တမ်း ဖျက်' },
  clearFavorites: { en: 'Clear favorites', th: 'ล้างรายการโปรด', my: 'နှစ်သက်ရာ ဖျက်' },
  about: { en: 'About', th: 'เกี่ยวกับ', my: 'အကြောင်း' },
  developer: { en: 'Created by Moekyawaung', th: 'สร้างโดย Moekyawaung', my: 'ပြုလုပ်သူ — Moekyawaung' },
  systemDocs: { en: 'System blueprint (architecture, schema, API)', th: 'สถาปัตยกรรมระบบ (schema, API)', my: 'စနစ် ပုံစံမြေပုံ (ဖွဲ့စည်းပုံ၊ API)' },
  glossary: { en: 'Transit glossary', th: 'ศัพท์ระบบขนส่ง', my: 'လမ်းပို့ ဝေါဟာရ' },
  reset: { en: 'Reset', th: 'คืนค่า', my: 'ပြန်သတ်မှတ်' },

  // Offline
  offlineTitle: { en: 'Offline & cached data', th: 'ออฟไลน์และข้อมูลเก็บไว้', my: 'အော့ဖ်လိုင်းနှင့် သိမ်းဆည်းဒေတာ' },
  offlineDesc: { en: 'Bangkok city grid tiles + GTFS static are stored on device. Live vehicle positions need a connection.', th: 'เก็บแผนที่กรุงเทพและ GTFS static ไว้ในเครื่อง ตำแหน่งรถสดต้องใช้อินเทอร์เน็ต', my: 'ဘန်ကောင်မြေပုံနှင့် GTFS static ကို စက်ထဲသိမ်းထားသည်။ တိုက်ရိုက်ဒေတာအတွက် အင်တာနက် လိုသည်။' },
  cachedTiles: { en: 'Cached map tiles', th: 'แผนที่เก็บไว้', my: 'သိမ်းထားသော မြေပုံများ' },
  gtfsVersion: { en: 'GTFS static version', th: 'เวอร์ชัน GTFS static', my: 'GTFS static ဗားရှင်း' },
  lastSync: { en: 'Last sync', th: 'ซิงก์ล่าสุด', my: 'နောက်ဆုံး ပေါင်းစပ်ချိန်' },
  realtimeOff: { en: 'Realtime feed paused — countdowns show schedule only', th: 'ปิดฟีดสด — เวลานับจากตาราง', my: 'တိုက်ရိုက်ဒေတာ ပိတ်ထား — အချိန်ဇယားအလိုက်သာ' },
  districtTiles: { en: 'District tile packs', th: 'แพ็กแผนที่เขต', my: 'ခရိုင် မြေပုံအထုပ်' },
  downloadAll: { en: 'Refresh tile cache', th: 'อัปเดตแผนที่', my: 'မြေပုံ ပြန်သိမ်း' },
  synced: { en: 'Cache refreshed', th: 'อัปเดตแล้ว', my: 'ပြန်သိမ်းပြီး' },

  // System blueprint
  blueprintTitle: { en: 'System blueprint', th: 'สถาปัตยกรรมระบบ', my: 'စနစ် ဖွဲ့စည်းပုံ' },
  bpArchitecture: { en: 'Architecture', th: 'สถาปัตยกรรม', my: 'ဖွဲ့စည်းပုံ' },
  bpSchema: { en: 'Database', th: 'ฐานข้อมูล', my: 'ဒေတာဘေး' },
  bpApi: { en: 'API', th: 'API', my: 'API' },
  bpTimeline: { en: 'Roadmap', th: 'แผนงาน', my: 'အစီအစဉ်' },
};

export function t(key: keyof typeof S | string, lang: Lang): string {
  const entry = S[key];
  if (!entry) return String(key);
  return entry[lang] || entry.en;
}

export const STRING_KEYS = Object.keys(S);

/** Common transit terminology dictionary shown in Settings → glossary. */
export const GLOSSARY: { en: string; th: string; my: string; note: Entry }[] = [
  { en: 'Bus stop', th: 'ป้ายรถเมล์', my: 'ဘတ်စ်ဂိတ်', note: { en: 'Street pole/shelter, 5,199 in Bangkok', th: 'เสา/หลังคาป้าย มี 5,199 จุด', my: '၅,၁၉၉ ခု ရှိသည်' } },
  { en: 'Smart Stop', th: 'ป้ายอัจฉริยะ', my: 'စမတ်စတော့', note: { en: 'Renovated (600) or digital GPS board (500)', th: 'ปรับปรุง 600 + ดิจิทัล 500', my: 'ပြုပြင် ၆၀၀ + ဒစ်ဂျစ်တယ် ၅၀၀' } },
  { en: 'Fare gate', th: 'ประตูบัตร', my: 'တံခါးဂိတ်', note: { en: 'Tap in / tap out gate', th: 'แตะเข้า-ออก', my: 'တို့ဝင်/တို့ထွက်' } },
  { en: 'Interchange', th: 'สถานีเปลี่ยนสาย', my: 'ကူးပြောင်းဘူတာ', note: { en: 'Same complex, follow signage', th: 'อาคารเดียวกัน ทำตามป้าย', my: 'တစ်ခုတည်း အဆောက်အအုံ' } },
  { en: 'Headway', th: 'ความถี่รถ', my: 'ထွက်ချိန်ကြာချိန်', note: { en: 'Minutes between vehicles', th: 'นาทีห่างกันของรถ', my: 'ယာဉ်ခြား မိနစ်' } },
  { en: 'GTFS-Realtime', th: 'GTFS เรียลไทม์', my: 'GTFS-Realtime', note: { en: 'Vehicle position + arrival feed', th: 'ตำแหน่งรถและเวลามาถึง', my: 'ယာဉ်အနေအထားနှင့် ရောက်ချိန်' } },
];
