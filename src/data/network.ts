/**
 * Bangkok 2026 smart-city context constants.
 * Figures mirror the BMTA / MTI / BMA 2026 smart-stop programme announcements:
 * 5,199 total bus stops, 1,100 upgraded "Smart Stops" — 600 renovated physical
 * stops (walking maps + 30+ landmark indicators) and 500 digital smart stops
 * (GPS + real-time arrival countdown displays).
 */
export const NETWORK = {
  busStopsTotal: 5199,
  smartStopsTotal: 1100,
  smartStopsRenovated: 600,
  smartStopsDigital: 500,
  busRoutes: 370,
  electricBuses: 2200,
  railLines: 7,
  railStations: 128,
  itsSensors: 13500,
  aiTrafficJunctions: 1200,
  gtfStaticVersion: '2026.02.1',
  gtfsRtFeedCount: 14,
  mapTileCacheGb: 1.8,
  landmarkIndicators: 32,
};

export const SMART_CITY_PROJECTS = [
  {
    id: 'sc-ev',
    icon: 'flash',
    color: '#22B07D',
    en: { title: 'Electric bus expansion', body: '2,200 EV buses in service by end-2026, zero-emission corridors on Sukhumvit & Chaeng Watthana.' },
    th: { title: 'ขยายรถโดยสารไฟฟ้า', body: 'ปี 2569 มีรถ EV 2,200 คัน ลดการปล่อยมลพิษบนถนนสุขุมวิทและแจ้งวัฒนะ' },
    my: { title: 'မီးစက်ဘတ်စ်တပ် ချဲ့ထွင်မှု', body: '၂၀၂၆ ခုနှစ်တွင် မီးစက်ဘတ်စ် ၂,၂၀၀ စီး လည်ပတ်မည်။' },
  },
  {
    id: 'sc-ai',
    icon: 'sparkles',
    color: '#7E57C2',
    en: { title: 'AI traffic management', body: '1,200 adaptive signal junctions run predictive models on real-time sensor streams.' },
    th: { title: 'จัดการจราจรด้วย AI', body: 'สัญญาณไฟ 1,200 แยก ใช้โมเดลพยากรณ์จากข้อมูลเซ็นเซอร์เรียลไทม์' },
    my: { title: 'AI လမ်းပို့စနစ် စီမံခန့်ခွဲမှု', body: 'မီးပွိုင့် ၁,၂၀၀ ခုကို အချိန်နှင့်တပြေးညီ ဒေတာဖြင့် စီမံသည်။' },
  },
  {
    id: 'sc-its',
    icon: 'hardware-chip',
    color: '#4FA3F7',
    en: { title: 'ITS sensor grid', body: '13,500 roadside ITS sensors feed GTFS-RT predictions with sub-minute latency.' },
    th: { title: 'เครือข่ายเซ็นเซอร์ ITS', body: 'เซ็นเซอร์ 13,500 จุด ส่งข้อมูลให้ GTFS-RT ความหน่วงต่ำกว่า 1 นาที' },
    my: { title: 'ITS အာရုံခံကိရိယာ ကွန်ရက်', body: 'အာရုံခံကိရိယာ ၁၃,၅၀၀ ခုမှ GTFS-RT ခန့်မှန်းချက် ပံ့ပိုးသည်။' },
  },
  {
    id: 'sc-smartstop',
    icon: 'tv',
    color: '#F5A623',
    en: { title: '1,100 Smart Stops', body: '600 renovated stops with walking maps + 500 digital stops with GPS countdown boards.' },
    th: { title: 'ป้ายอัจฉริยะ 1,100 แห่ง', body: '600 ป้ายปรับปรุงใหม่ + 500 ป้ายดิจิทัลแสดงเวลานับถอยหลัง' },
    my: { title: 'စမတ်စတော့ ၁,၁၀၀ ခု', body: 'ပြုပြင်ပြီး ၆၀၀ ခုနှင့် ဒစ်ဂျစ်တယ် ၅၀၀ ခု တပ်ဆင်ပြီး။' },
  },
];

export const DEV_TIMELINE = [
  { phase: 'Phase 1', months: 'Month 1', en: 'GTFS static ingest + map foundation + core UI shell', th: 'นำเข้า GTFS + แผนที่ + UI หลัก', my: 'GTFS သွင်းခြင်း၊ မြေပုံနှင့် UI အခြေခံ' },
  { phase: 'Phase 2', months: 'Month 2', en: 'Multimodal bus + train routing engine, fare matrix', th: 'เครื่องมือวางแผนเส้นทางรถ+รถไฟ + ค่าโดยสาร', my: 'ဘတ်စ်+ရထား ခရီးစဉ်အင်ဂျင်၊ လက်ငင်းစာရင်း' },
  { phase: 'Phase 3', months: 'Month 3', en: 'AI assistant + trilingual NLU + landmark navigation', th: 'ผู้ช่วย AI + 3 ภาษา + นำทางด้วย landmark', my: 'AI လက်ထောက် + ၃ ဘာသာစကား' },
  { phase: 'Phase 4', months: 'Month 4', en: 'Smart Stop boards + GTFS-RT live GPS ingestion', th: 'ป้ายอัจฉริยะ + นำเข้า GPS เรียลไทม์', my: 'စမတ်စတော့ + တိုက်ရိုက် GPS သွင်းခြင်း' },
  { phase: 'Phase 5', months: 'Month 5', en: 'QA, accessibility pass, cloud deployment', th: 'ทดสอบ + การเข้าถึง + ปรับใช้บนคลาวด์', my: 'စမ်းသပ်မှု၊ ဝင်ရောက်နိုင်မှု၊ တိုက်ရိုက်တင်ခြင်း' },
];

export const PAYMENT_METHODS = [
  { id: 'rabbit', icon: 'card', en: 'Rabbit Card', th: 'บัตรแรบบิท', my: 'ရယ်ဘစ်ကတ်' },
  { id: 'emv', icon: 'phone-portrait', en: 'EMV contactless', th: 'EMV คอนแทคเลส', my: 'EMV ကွန်တက်လက်စ်' },
  { id: 'cash', icon: 'cash', en: 'Cash (bus only)', th: 'เงินสด (รถเมล์)', my: 'ငွေသား (ဘတ်စ်ပဲ)' },
];
