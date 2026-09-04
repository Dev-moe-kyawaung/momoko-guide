import type { RailLine, Station, I18nName } from '../types';

/**
 * Bangkok rail network subset (GTFS static snapshot, Q1 2026).
 * Real interchanges, approximate coordinates. Sources: BTS/MRT/ARL public maps.
 * Fares per Nov-2025 fare matrices: BTS 17-65 THB, MRT 17-45 THB, ARL 15-45 THB.
 */

const n = (en: string, th: string, my: string): I18nName => ({ en, th, my });

export const RAIL_LINES: RailLine[] = [
  {
    id: 'bts-sukhumvit',
    operator: 'BTS',
    en: 'Sukhumvit Line',
    th: 'สายสุขุมวิท',
    my: 'ဆူချွမ်ဗစ် လိုင်း',
    color: '#1FA85C',
    headwayPeakMin: 2.3,
    serviceStart: '05:15',
    serviceEnd: '00:20',
    stations: [
      'bts-samrong',
      'bts-bearing',
      'bts-bangna',
      'bts-udomsuk',
      'bts-punnawithi',
      'bts-bangchak',
      'bts-onnut',
      'bts-phrakhanong',
      'bts-ekkamai',
      'bts-thonglo',
      'bts-phromphong',
      'bts-asok',
      'bts-nana',
      'bts-phloenchit',
      'bts-chitlom',
      'bts-siam',
      'bts-ratchaprarop',
      'bts-phayathai',
      'bts-victory',
      'bts-sanampao',
      'bts-ari',
      'bts-saphankhwai',
      'bts-mochit',
    ],
  },
  {
    id: 'bts-silom',
    operator: 'BTS',
    en: 'Silom Line',
    th: 'สายสีลม',
    my: 'စီလုံ လိုင်း',
    color: '#E2453C',
    headwayPeakMin: 2.5,
    serviceStart: '05:30',
    serviceEnd: '00:25',
    stations: [
      'bts-bangwa',
      'bts-talatphlu',
      'bts-phonimit',
      'bts-wongwianyai',
      'bts-krungthonburi',
      'bts-saphantaksin',
      'bts-surasak',
      'bts-saintlouis',
      'bts-chongnonsi',
      'bts-saladaeng',
      'bts-ratchadamri',
      'bts-siam',
      'bts-nationalstadium',
    ],
  },
  {
    id: 'bts-gold',
    operator: 'BTS',
    en: 'Gold Line',
    th: 'สายสีทอง',
    my: 'ရွှေရောင် လိုင်း',
    color: '#D9A520',
    headwayPeakMin: 6,
    serviceStart: '06:00',
    serviceEnd: '24:00',
    stations: ['bts-krungthonburi', 'bts-charoennakorn', 'bts-krungthapwaan', 'bts-charoenmin'],
  },
  {
    id: 'mrt-blue',
    operator: 'MRT',
    en: 'Blue Line',
    th: 'สายสีน้ำเงิน',
    my: 'အပြာရောင် လိုင်း',
    color: '#1663B0',
    headwayPeakMin: 3.5,
    serviceStart: '05:30',
    serviceEnd: '24:00',
    stations: [
      'mrt-bangwa',
      'mrt-thaphra',
      'mrt-itsaraphap',
      'mrt-sanamchai',
      'mrt-hualamphong',
      'mrt-samyan',
      'mrt-silom',
      'mrt-lumphini',
      'mrt-khlongtoei',
      'mrt-queensirikit',
      'mrt-sukhumvit',
      'mrt-phetchaburi',
      'mrt-phramam9',
      'mrt-culturalcentre',
      'mrt-huaikhwang',
      'mrt-ratchadaphisek',
      'mrt-latphrao',
      'mrt-chatuchakpark',
      'mrt-bangsue',
      'mrt-taopoon',
      'mrt-bangphlat',
      'mrt-bangyikhan',
      'mrt-sirindhorn',
      'mrt-bangphai',
    ],
  },
  {
    id: 'mrt-purple',
    operator: 'MRT',
    en: 'Purple Line',
    th: 'สายสีม่วง',
    my: 'ခရမ်းရောင် လိုင်း',
    color: '#8C5AC2',
    headwayPeakMin: 5,
    serviceStart: '05:30',
    serviceEnd: '23:30',
    stations: [
      'mrt-taopoon',
      'mrt-khlongbangsue',
      'mrt-bangson',
      'mrt-wongsawang',
      'mrt-yaifai',
      'mrt-bangphlu',
      'mrt-bangnon',
      'mrt-khlongbangphai',
      'mrt-phranangklao',
      'mrt-nonthaburicivic',
      'mrt-samkhok',
      'mrt-khlongkhuean',
    ],
  },
  {
    id: 'mrt-yellow',
    operator: 'MRT',
    en: 'Yellow Line',
    th: 'สายสีเหลือง',
    my: 'ဝါရောင် လိုင်း',
    color: '#F2C230',
    headwayPeakMin: 5,
    serviceStart: '06:00',
    serviceEnd: '24:00',
    stations: [
      'mrt-latphrao',
      'mrt-sikrithai',
      'mrt-bangkapi',
      'mrt-kalae',
      'mrt-huamak',
      'mrt-srinagarindra',
      'mrt-phatthanakan',
      'mrt-suanluang',
      'mrt-siudom',
      'mrt-latkrabang',
    ],
  },
  {
    id: 'mrt-pink',
    operator: 'MRT',
    en: 'Pink Line',
    th: 'สายสีชมพู',
    my: 'ပန်းရောင် လိုင်း',
    color: '#E85D9E',
    headwayPeakMin: 5,
    serviceStart: '06:00',
    serviceEnd: '24:00',
    stations: [
      'mrt-khaerai',
      'mrt-laksi',
      'mrt-watphrasri',
      'mrt-btsmochit',
      'mrt-ratchadaphisek',
      'mrt-minburi',
    ],
  },
  {
    id: 'arl',
    operator: 'ARL',
    en: 'Airport Rail Link',
    th: 'แอร์พอร์ต ลิงก์',
    my: 'လေဆိပ် မီးရထား',
    color: '#B03A2E',
    headwayPeakMin: 10,
    serviceStart: '05:30',
    serviceEnd: '24:00',
    stations: ['arl-suvarnabhumi', 'arl-sirat', 'arl-banthapchang', 'arl-latkrabang', 'arl-cityair', 'arl-makkasan', 'arl-phayathai'],
  },
];

export const headwayOf = (l: RailLine): number => l.headwayPeakMin;

interface S {
  id: string;
  code: string;
  lineId: string;
  lat: number;
  lng: number;
  en: string;
  th: string;
  my: string;
  exits?: string[];
}

const S = (o: S): Station => ({
  id: o.id,
  code: o.code,
  lineId: o.lineId,
  lat: o.lat,
  lng: o.lng,
  en: o.en,
  th: o.th,
  my: o.my,
  exits: o.exits ?? ['Exit 1', 'Exit 2'],
});

export const STATIONS: Station[] = [
  // --- BTS Sukhumvit Line ---
  S({ id: 'bts-samrong', code: 'E15', lineId: 'bts-sukhumvit', lat: 13.657, lng: 100.643, en: 'Samrong', th: 'สำโรง', my: 'ဆမ်ရုံ', exits: ['Exit 1 → Samrong Rd', 'Exit 2 → Market'] }),
  S({ id: 'bts-bearing', code: 'E14', lineId: 'bts-sukhumvit', lat: 13.6602, lng: 100.6318, en: 'Bearing', th: 'แบริ่ง', my: 'ဘီယင်း', exits: ['Exit 1 → Bearing 1', 'Exit 2 → Lat Krabang Rd'] }),
  S({ id: 'bts-bangna', code: 'E13', lineId: 'bts-sukhumvit', lat: 13.669, lng: 100.622, en: 'Bang Na', th: 'บางนา', my: 'ဘောင်နား', exits: ['Exit 1 → Bang Na Plaza', 'Exit 2 → Expressway'] }),
  S({ id: 'bts-udomsuk', code: 'E12', lineId: 'bts-sukhumvit', lat: 13.6587, lng: 100.6031, en: 'Udom Suk', th: 'อุดมสุข', my: 'အုဒ်မန်းဆုချ', exits: ['Exit 1 → Udom Suk 1', 'Exit 2 → Big C'] }),
  S({ id: 'bts-punnawithi', code: 'E11', lineId: 'bts-sukhumvit', lat: 13.6672, lng: 100.6018, en: 'Punnawithi', th: 'ปุณณวิถี', my: 'ပုန်နာဝစ်သီ', exits: ['Exit 1 → Soi 100', 'Exit 2 → Phoenix Park'] }),
  S({ id: 'bts-bangchak', code: 'E10', lineId: 'bts-sukhumvit', lat: 13.6806, lng: 100.603, en: 'Bang Chak', th: 'บางจาก', my: 'ဘောင်ချောက်', exits: ['Exit 1 → Bang Chak', 'Exit 2 → PTT Tower'] }),
  S({ id: 'bts-onnut', code: 'E9', lineId: 'bts-sukhumvit', lat: 13.6903, lng: 100.6016, en: 'On Nut', th: 'อ่อนนุช', my: 'အိုးနပ်ချ', exits: ['Exit 1 → Big C Extra', 'Exit 2 → Soi 77'] }),
  S({ id: 'bts-phrakhanong', code: 'E8', lineId: 'bts-sukhumvit', lat: 13.7025, lng: 100.602, en: 'Phra Khanong', th: 'พระโขนง', my: 'ပရာခနုံ', exits: ['Exit 1 → Khan Market', 'Exit 2 → Soi 43'] }),
  S({ id: 'bts-ekkamai', code: 'E7', lineId: 'bts-sukhumvit', lat: 13.7167, lng: 100.5933, en: 'Ekkamai', th: 'เอกมัย', my: 'အက်ကမိုင်', exits: ['Exit 1 → Gateway', 'Exit 2 → Ekkamai Bus Terminal', 'Exit 3 → Soi 42'] }),
  S({ id: 'bts-thonglo', code: 'E6', lineId: 'bts-sukhumvit', lat: 13.7248, lng: 100.5824, en: 'Thong Lo', th: 'ทองหล่อ', my: 'သုံးလော', exits: ['Exit 1 → Thong Lo Soi 13', 'Exit 2 → J Avenue'] }),
  S({ id: 'bts-phromphong', code: 'E5', lineId: 'bts-sukhumvit', lat: 13.7303, lng: 100.5737, en: 'Phrom Phong', th: 'พร้อมพงษ์', my: 'ပရုံဖုန်', exits: ['Exit 1 → EmQuartier', 'Exit 2 → Benjakitti Park', 'Exit 3 → Soi 39'] }),
  S({ id: 'bts-asok', code: 'E4', lineId: 'bts-sukhumvit', lat: 13.7372, lng: 100.5601, en: 'Asok', th: 'อโศก', my: 'အိုက်ဆုကျော့', exits: ['Exit 1 → Terminal 21', 'Exit 2 → MRT Sukhumvit', 'Exit 3 → Soi 21 (Nana Nuea)'] }),
  S({ id: 'bts-nana', code: 'E3', lineId: 'bts-sukhumvit', lat: 13.7397, lng: 100.559, en: 'Nana', th: 'นานา', my: 'နာနာ', exits: ['Exit 1 → Nana Plaza', 'Exit 2 → Soi 4', 'Exit 3 → Soi 3'] }),
  S({ id: 'bts-phloenchit', code: 'E2', lineId: 'bts-sukhumvit', lat: 13.7436, lng: 100.5501, en: 'Phloen Chit', th: 'เพลินจิต', my: 'ဖလျုံချစ်', exits: ['Exit 1 → Central Embassy', 'Exit 2 → Nai Lert House'] }),
  S({ id: 'bts-chitlom', code: 'E1', lineId: 'bts-sukhumvit', lat: 13.7442, lng: 100.5432, en: 'Chit Lom', th: 'ชิดลม', my: 'ချစ်လုမ်', exits: ['Exit 1 → CentralWorld', 'Exit 2 → Gaysorn Village', 'Exit 3 → Erawan Shrine'] }),
  S({ id: 'bts-siam', code: 'CEN', lineId: 'bts-sukhumvit', lat: 13.7446, lng: 100.5347, en: 'Siam', th: 'สยาม', my: 'ဆိုင်းယမ်', exits: ['Exit 1 → Siam Paragon', 'Exit 2 → MBK Center', 'Exit 3 → Siam Square', 'Exit 4 → Siam Discovery'] }),
  S({ id: 'bts-ratchaprarop', code: 'N5', lineId: 'bts-sukhumvit', lat: 13.7522, lng: 100.537, en: 'Ratchaprarop', th: 'ราชปรารภ', my: 'ရာ့ချဖရာဖျုံ', exits: ['Exit 1 → Pratunam', 'Exit 2 → Baiyoke Tower II'] }),
  S({ id: 'bts-phayathai', code: 'N6', lineId: 'bts-sukhumvit', lat: 13.757, lng: 100.535, en: 'Phaya Thai', th: 'พญาไท', my: 'ဖရယူသိုင်း', exits: ['Exit 1 → ARL Phaya Thai', 'Exit 2 → Ratchaprarop Rd'] }),
  S({ id: 'bts-victory', code: 'N7', lineId: 'bts-sukhumvit', lat: 13.7647, lng: 100.5378, en: 'Victory Monument', th: 'อนุสาวรีย์ชัยสมรภูมิ', my: 'အောင်ခြိန် ရုပ်တု', exits: ['Exit 2 → Victory Point', 'Exit 3 → Bus Hub', 'Exit 4 → Soi Rajasue'] }),
  S({ id: 'bts-sanampao', code: 'N8', lineId: 'bts-sukhumvit', lat: 13.773, lng: 100.54, en: 'Sanam Pao', th: 'สนามเป้า', my: 'ဆနမ်ပေါ', exits: ['Exit 1 → Sanam Pao Rd'] }),
  S({ id: 'bts-ari', code: 'N9', lineId: 'bts-sukhumvit', lat: 13.782, lng: 100.542, en: 'Ari', th: 'อารีย์', my: 'အာရီ', exits: ['Exit 1 → Ari Soi 1', 'Exit 2 → Ari Soi 4 (cafés)'] }),
  S({ id: 'bts-saphankhwai', code: 'N10', lineId: 'bts-sukhumvit', lat: 13.79, lng: 100.547, en: 'Saphan Khwai', th: 'สะพานควาย', my: 'ဆိန္ဒိုင်ခွေး', exits: ['Exit 1 → Weekend Market', 'Exit 2 → Saphan Khwai Market'] }),
  S({ id: 'bts-mochit', code: 'N11', lineId: 'bts-sukhumvit', lat: 13.8019, lng: 100.5538, en: 'Mo Chit', th: 'หมอชิต', my: 'မိုးချစ်', exits: ['Exit 1 → Mo Chit Bus Terminal', 'Exit 2 → Chatuchak Park', 'Exit 3 → Weekend Market (Gate 5)'] }),
  // --- BTS Silom Line ---
  S({ id: 'bts-nationalstadium', code: 'W1', lineId: 'bts-silom', lat: 13.744, lng: 100.532, en: 'National Stadium', th: 'สนามกีฬาแห่งชาติ', my: 'အမျိုးသားကွင်း', exits: ['Exit 1 → Bangkok Art & Culture Centre', 'Exit 2 → National Stadium'] }),
  S({ id: 'bts-ratchadamri', code: 'S1', lineId: 'bts-silom', lat: 13.7408, lng: 100.5415, en: 'Ratchadamri', th: 'ราชดำริ', my: 'ရာ့ချဒမ်ရီ', exits: ['Exit 1 → Ratchadamri Rd', 'Exit 2 → Nai Lert Park'] }),
  S({ id: 'bts-saladaeng', code: 'S2', lineId: 'bts-silom', lat: 13.7286, lng: 100.5352, en: 'Sala Daeng', th: 'ศาลาแดง', my: 'ဆလာဒင်', exits: ['Exit 1 → MRT Si Lom', 'Exit 2 → Silom Complex', 'Exit 3 → Patpong'] }),
  S({ id: 'bts-chongnonsi', code: 'S3', lineId: 'bts-silom', lat: 13.7252, lng: 100.539, en: 'Chong Nonsi', th: 'ช่องนนทรีย์', my: 'ချုံ့နွန်စီ', exits: ['Exit 1 → Sathorn Square', 'Exit 2 → King Power Mahanakhon', 'Exit 3 → BTS Skywalk'] }),
  S({ id: 'bts-saintlouis', code: 'S4', lineId: 'bts-silom', lat: 13.7208, lng: 100.5382, en: 'Saint Louis', th: 'เซนต์หลุยส์', my: 'ဆိန်းလူးဝစ်', exits: ['Exit 1 → St. Louis Hospital'] }),
  S({ id: 'bts-surasak', code: 'S5', lineId: 'bts-silom', lat: 13.7144, lng: 100.535, en: 'Surasak', th: 'สุรศักดิ์', my: 'ဆူရာဆက်', exits: ['Exit 1 → Surasak Rd', 'Exit 2 → Convent Rd'] }),
  S({ id: 'bts-saphantaksin', code: 'S6', lineId: 'bts-silom', lat: 13.718, lng: 100.514, en: 'Saphan Taksin', th: 'สะพานตากสิน', my: 'ဆိန္ဒိုင်တက်ဆင်', exits: ['Exit 1 → Central Pier (Sathorn)', 'Exit 2 → ICONSIAM shuttle pier', 'Exit 3 → Charoen Krung Rd'] }),
  S({ id: 'bts-krungthonburi', code: 'T1', lineId: 'bts-silom', lat: 13.7217, lng: 100.511, en: 'Krung Thonburi', th: 'กรุงธนบุรี', my: 'ကရင်သုံးနွယ်ပြည်', exits: ['Exit 1 → ICONSIAM (shuttle)', 'Exit 2 → River City'] }),
  S({ id: 'bts-wongwianyai', code: 'T2', lineId: 'bts-silom', lat: 13.7243, lng: 100.503, en: 'Wongwian Yai', th: 'วงเวียนใหญ่', my: 'ဝိုင်းကြီး', exits: ['Exit 1 → Wongwian Yai Market', 'Exit 2 → Taling Chan line'] }),
  S({ id: 'bts-phonimit', code: 'T3', lineId: 'bts-silom', lat: 13.7266, lng: 100.496, en: 'Pho Nimit', th: 'โพธิ์นิมิตร', my: 'ဖိုးနီမစ်', exits: ['Exit 1 → Talat Phlu Soi'] }),
  S({ id: 'bts-talatphlu', code: 'T4', lineId: 'bts-silom', lat: 13.7288, lng: 100.4915, en: 'Talat Phlu', th: 'ตลาดพลู', my: 'တလပလူ', exits: ['Exit 1 → Talat Phlu Market', 'Exit 2 → Rama III Rd'] }),
  S({ id: 'bts-bangwa', code: 'W8', lineId: 'bts-silom', lat: 13.6899, lng: 100.4381, en: 'Bang Wa', th: 'บางหว้า', my: 'ဘောင်ဝါ', exits: ['Exit 1 → MRT Bang Wa', 'Exit 2 → Tesco Lotus', 'Exit 3 → SRT Taling Chan line'] }),
  S({ id: 'bts-charoennakorn', code: 'G2', lineId: 'bts-gold', lat: 13.721, lng: 100.5, en: 'Charoennakorn', th: 'เจริญนคร', my: 'ချောရိန်နကြုန်', exits: ['Exit 1 → ICONSIAM'] }),
  S({ id: 'bts-krungthapwaan', code: 'G3', lineId: 'bts-gold', lat: 13.7222, lng: 100.483, en: 'Krung Thap Waan', th: 'กรุงธนบุรี 2', my: 'ကရင်သုံးနွယ် ၂', exits: ['Exit 1 → Thonburi Hospital'] }),
  S({ id: 'bts-charoenmin', code: 'G4', lineId: 'bts-gold', lat: 13.7228, lng: 100.473, en: 'Charoen Min', th: 'เจริญมินทร์', my: 'ချောရိန်မင်း', exits: ['Exit 1 → Soi Charoen Nakhon 9'] }),
  // --- MRT Blue Line ---
  S({ id: 'mrt-bangwa', code: 'BL02', lineId: 'mrt-blue', lat: 13.6899, lng: 100.4381, en: 'Bang Wa', th: 'บางหว้า', my: 'ဘောင်ဝါ', exits: ['Exit 3 → BTS Bang Wa', 'Exit 5 → Lotus'] }),
  S({ id: 'mrt-thaphra', code: 'BL03', lineId: 'mrt-blue', lat: 13.746, lng: 100.468, en: 'Tha Phra', th: 'ท่าพระ', my: 'သဖရ', exits: ['Exit 1 → Tha Phra intersection'] }),
  S({ id: 'mrt-itsaraphap', code: 'BL04', lineId: 'mrt-blue', lat: 13.742, lng: 100.479, en: 'Itsaraphap', th: 'อิสรภาพ', my: 'အိတ်ဆရဖတ်', exits: ['Exit 1 → Borom Rot Rd'] }),
  S({ id: 'mrt-sanamchai', code: 'BL05', lineId: 'mrt-blue', lat: 13.748, lng: 100.493, en: 'Sanam Chai', th: 'สนามไชย', my: 'ဆနမ်ချိုင့်', exits: ['Exit 1 → Wat Pho', 'Exit 2 → Grand Palace', 'Exit 3 → Tha Maharaj pier'] }),
  S({ id: 'mrt-hualamphong', code: 'BL06', lineId: 'mrt-blue', lat: 13.7431, lng: 100.511, en: 'Hua Lamphong', th: 'หัวลำโพง', my: 'ဟုံးလမ်ဖုန်', exits: ['Exit 1 → Hua Lamphong Railway Station', 'Exit 2 → Chinatown (Yaowarat)', 'Exit 3 → Khlong Medsi'] }),
  S({ id: 'mrt-samyan', code: 'BL07', lineId: 'mrt-blue', lat: 13.7379, lng: 100.529, en: 'Sam Yan', th: 'สามย่าน', my: 'ဆမ်ယန်', exits: ['Exit 1 → Chulalongkorn University', 'Exit 2 → Sam Yan Market'] }),
  S({ id: 'mrt-silom', code: 'BL08', lineId: 'mrt-blue', lat: 13.7286, lng: 100.5352, en: 'Si Lom', th: 'สีลม', my: 'စီလုံ', exits: ['Exit 2 → BTS Sala Daeng', 'Exit 4 → Silom Rd', 'Exit 5 → Patpong'] }),
  S({ id: 'mrt-lumphini', code: 'BL09', lineId: 'mrt-blue', lat: 13.7201, lng: 100.5401, en: 'Lumphini', th: 'ลุมพินี', my: 'လမ်ပီနီ', exits: ['Exit 1 → Lumpini Park', 'Exit 2 → Sathorn Tai'] }),
  S({ id: 'mrt-khlongtoei', code: 'BL10', lineId: 'mrt-blue', lat: 13.7157, lng: 100.5541, en: 'Khlong Toei', th: 'คลองเตย', my: 'ကလုံးတိုင်', exits: ['Exit 1 → Khlong Toei Market', 'Exit 2 → Wet Market'] }),
  S({ id: 'mrt-queensirikit', code: 'BL11', lineId: 'mrt-blue', lat: 13.723, lng: 100.5608, en: 'Queen Sirikit National Convention Center', th: 'ศูนย์การประชุมแห่งชาติสิริกิติ์', my: 'စီရီကစ္စတို့ နိုင်ငံတော်ညီလာခံဗိုလ်ချုပ်', exits: ['Exit 1 → QSNCC', 'Exit 2 → Benjakitti Park'] }),
  S({ id: 'mrt-sukhumvit', code: 'BL12', lineId: 'mrt-blue', lat: 13.7372, lng: 100.5601, en: 'Sukhumvit', th: 'สุขุมวิท', my: 'ဆူချွမ်ဗစ်', exits: ['Exit 2 → BTS Asok', 'Exit 3 → Terminal 21'] }),
  S({ id: 'mrt-phetchaburi', code: 'BL13', lineId: 'mrt-blue', lat: 13.738, lng: 100.565, en: 'Phetchaburi', th: 'เพชรบุรี', my: 'ဖကျာပြိုင်း', exits: ['Exit 1 → ARL Makkasan (500 m skywalk)', 'Exit 2 → Fortune Town'] }),
  S({ id: 'mrt-phramam9', code: 'BL14', lineId: 'mrt-blue', lat: 13.7573, lng: 100.5666, en: 'Phra Ram 9', th: 'พระราม 9', my: 'ပရာမ ၉', exits: ['Exit 1 → Fortune Town', 'Exit 2 → Rama 9 Rd'] }),
  S({ id: 'mrt-culturalcentre', code: 'BL15', lineId: 'mrt-blue', lat: 13.762, lng: 100.567, en: 'Thailand Cultural Centre', th: 'ศูนย์วัฒนธรรมแห่งประเทศไทย', my: 'ယူသေးလန်း ယဉ်ကျေးမှုဌာန', exits: ['Exit 1 → Cultural Centre', 'Exit 2 → Esplanade'] }),
  S({ id: 'mrt-huaikhwang', code: 'BL16', lineId: 'mrt-blue', lat: 13.7671, lng: 100.5688, en: 'Huai Khwang', th: 'ห้วยขวาง', my: 'ဟွိုင်းခွမ်', exits: ['Exit 1 → Huai Khwang Night Market', 'Exit 2 → Soi 8'] }),
  S({ id: 'mrt-ratchadaphisek', code: 'BL17', lineId: 'mrt-blue', lat: 13.7737, lng: 100.569, en: 'Ratchadaphisek', th: 'รัชดาภิเษก', my: 'ရာ့ချဒဖိဆောက်', exits: ['Exit 1 → MRT Pink Ratchadaphisek', 'Exit 2 → MRT Yellow'] }),
  S({ id: 'mrt-latphrao', code: 'BL18', lineId: 'mrt-blue', lat: 13.7936, lng: 100.563, en: 'Lat Phrao', th: 'ลาดพร้าว', my: 'လတ်ဖရော', exits: ['Exit 1 → MRT Yellow Lat Phrao', 'Exit 2 → Esplanade Cineplex', 'Exit 3 → Lat Phrao 80'] }),
  S({ id: 'mrt-chatuchakpark', code: 'BL19', lineId: 'mrt-blue', lat: 13.7982, lng: 100.5531, en: 'Chatuchak Park', th: 'สวนจตุจักร', my: 'ချာတုတ်ခတ် ပန်းခြံ', exits: ['Exit 1 → Chatuchak Weekend Market', 'Exit 2 → SRT Dark Red Line', 'Exit 3 → Park'] }),
  S({ id: 'mrt-bangsue', code: 'BL20', lineId: 'mrt-blue', lat: 13.798, lng: 100.513, en: 'Bang Sue', th: 'บางซื่อ', my: 'ဘောင်ဆွေ', exits: ['Exit 1 → Krung Thep Aphiwat Central Terminal', 'Exit 2 → SRT lines'] }),
  S({ id: 'mrt-taopoon', code: 'BL21', lineId: 'mrt-blue', lat: 13.821, lng: 100.527, en: 'Tao Poon', th: 'เตาปูน', my: 'တော့ပူန်', exits: ['Exit 1 → MRT Purple Tao Poon', 'Exit 2 → Bang Po'] }),
  S({ id: 'mrt-bangphlat', code: 'BL22', lineId: 'mrt-blue', lat: 13.801, lng: 100.501, en: 'Bang Phlat', th: 'บางพลัด', my: 'ဘောင်ဖလက်', exits: ['Exit 1 → Bang Phlat Market'] }),
  S({ id: 'mrt-bangyikhan', code: 'BL23', lineId: 'mrt-blue', lat: 13.7856, lng: 100.482, en: 'Bang Yi Khan', th: 'บางยี่ขัน', my: 'ဘောင်ရီခန်', exits: ['Exit 1 → Bang Yi Khan Pier'] }),
  S({ id: 'mrt-sirindhorn', code: 'BL24', lineId: 'mrt-blue', lat: 13.7755, lng: 100.474, en: 'Sirindhorn', th: 'ศิรินธร', my: 'စီရင်သုံန်', exits: ['Exit 1 → Sirindhorn Hospital'] }),
  S({ id: 'mrt-bangphai', code: 'BL25', lineId: 'mrt-blue', lat: 13.761, lng: 100.456, en: 'Bang Phai', th: 'บางไผ่', my: 'ဘောင်ဖိုင်', exits: ['Exit 1 → Bang Phai Rd'] }),
  // --- MRT Purple Line ---
  S({ id: 'mrt-khlongbangsue', code: 'PP02', lineId: 'mrt-purple', lat: 13.819, lng: 100.524, en: 'Khlong Bang Sue', th: 'คลองบางซื่อ', my: 'ကလုံးဘောင်ဆွေ', exits: ['Exit 1 → Bang Sue'] }),
  S({ id: 'mrt-bangson', code: 'PP03', lineId: 'mrt-purple', lat: 13.824, lng: 100.513, en: 'Bang Son', th: 'บางซ่อน', my: 'ဘောင်ဆုန်', exits: ['Exit 1 → Bang Son market'] }),
  S({ id: 'mrt-wongsawang', code: 'PP04', lineId: 'mrt-purple', lat: 13.826, lng: 100.5, en: 'Wong Sawang', th: 'วงสว่าง', my: 'ဝိုင်းဆွန်', exits: ['Exit 1 → Wong Sawang 1'] }),
  S({ id: 'mrt-yaifai', code: 'PP05', lineId: 'mrt-purple', lat: 13.837, lng: 100.48, en: 'Yaek Fai', th: 'แยกไฟฉาย', my: 'ရိုက်ဖိုင်းချောင်', exits: ['Exit 1 → Fai Chai junction'] }),
  S({ id: 'mrt-bangphlu', code: 'PP06', lineId: 'mrt-purple', lat: 13.847, lng: 100.47, en: 'Bang Phlu', th: 'บางบัว', my: 'ဘောင်ပလူ', exits: ['Exit 1 → Bang Phlu Rd'] }),
  S({ id: 'mrt-bangnon', code: 'PP07', lineId: 'mrt-purple', lat: 13.856, lng: 100.46, en: 'Bang Non', th: 'บางเหนียว', my: 'ဘောင်ညော', exits: ['Exit 1 → Bang Non'] }),
  S({ id: 'mrt-khlongbangphai', code: 'PP08', lineId: 'mrt-purple', lat: 13.864, lng: 100.449, en: 'Khlong Bang Phai', th: 'คลองบางไผ่', my: 'ကလုံးဘောင်ဖိုင်း', exits: ['Exit 1 → Pak Kret Soi'] }),
  S({ id: 'mrt-phranangklao', code: 'PP10', lineId: 'mrt-purple', lat: 13.878, lng: 100.415, en: 'Phra Nang Klao', th: 'พระนางเขลางค์', my: 'ပရာနမ်ခလင်', exits: ['Exit 1 → Nonthaburi Hospital'] }),
  S({ id: 'mrt-nonthaburicivic', code: 'PP12', lineId: 'mrt-purple', lat: 13.865, lng: 100.39, en: 'Nonthaburi Civic Center', th: 'ศูนย์ราชการนนทบุรี', my: 'နွန်းသဘူရီ အစိုးရဌာနချုပ်', exits: ['Exit 1 → Provincial Hall'] }),
  S({ id: 'mrt-samkhok', code: 'PP15', lineId: 'mrt-purple', lat: 13.89, lng: 100.352, en: 'Sam Khok', th: 'สามโคก', my: 'ဆမ်ခုက်', exits: ['Exit 1 → Sam Khok district'] }),
  S({ id: 'mrt-khlongkhuean', code: 'PP16', lineId: 'mrt-purple', lat: 13.902, lng: 100.338, en: 'Khlong Khuean Khun Phithak', th: 'คลองขื่อขุนพิทักษ์', my: 'ကလုံးခွဲကွန်ဖစ်ထက်', exits: ['Exit 1 → Pathum Thani edge'] }),
  // --- MRT Yellow Line ---
  S({ id: 'mrt-sikrithai', code: 'YL02', lineId: 'mrt-yellow', lat: 13.7885, lng: 100.602, en: 'Si Krithai', th: 'ศรีกริฐ', my: 'စီဂရိသိုင်း', exits: ['Exit 1 → Ladprao 107'] }),
  S({ id: 'mrt-bangkapi', code: 'YL03', lineId: 'mrt-yellow', lat: 13.765, lng: 100.643, en: 'Bang Kapi', th: 'บางกะปิ', my: 'ဘောင်ကပိ', exits: ['Exit 1 → The Mall Bangkapi', 'Exit 2 → Hua Mak market'] }),
  S({ id: 'mrt-kalae', code: 'YL04', lineId: 'mrt-yellow', lat: 13.756, lng: 100.653, en: 'Kalae', th: 'แคลาย', my: 'ကလေး', exits: ['Exit 1 → Kalae junction'] }),
  S({ id: 'mrt-huamak', code: 'YL05', lineId: 'mrt-yellow', lat: 13.749, lng: 100.662, en: 'Hua Mak', th: 'หัวหมาก', my: 'ဟွာမတ်', exits: ['Exit 1 → Ramkhamhaeng University', 'Exit 2 → The Mall Ramkhamhaeng'] }),
  S({ id: 'mrt-srinagarindra', code: 'YL06', lineId: 'mrt-yellow', lat: 13.74, lng: 100.668, en: 'Srinagarindra', th: 'ศรีนครินทรา', my: 'စီနကရင်ဒရာ', exits: ['Exit 1 → Seri Thai'] }),
  S({ id: 'mrt-phatthanakan', code: 'YL07', lineId: 'mrt-yellow', lat: 13.732, lng: 100.675, en: 'Phatthanakan', th: 'พัฒนาการ', my: 'ဖတ်သနာကန်', exits: ['Exit 1 → Phatthanakan Rd'] }),
  S({ id: 'mrt-suanluang', code: 'YL08', lineId: 'mrt-yellow', lat: 13.723, lng: 100.683, en: 'Suan Luang Rama IX', th: 'สวนหลวง ร.9', my: 'ဆွန်လွန်း ရာမ ၉', exits: ['Exit 1 → Rama IX Park'] }),
  S({ id: 'mrt-siudom', code: 'YL09', lineId: 'mrt-yellow', lat: 13.715, lng: 100.692, en: 'Si Udom', th: 'ศรีอุดม', my: 'စီးအုဒ်မန်', exits: ['Exit 1 → Si Udom Rd'] }),
  S({ id: 'mrt-latkrabang', code: 'YL10', lineId: 'mrt-yellow', lat: 13.707, lng: 100.702, en: 'Lat Krabang', th: 'ลาดกระบัง', my: 'လတ်ကရဘန်', exits: ['Exit 1 → Lat Krabang district', 'Exit 2 → Suvarnabhumi shuttle'] }),
  // --- MRT Pink Line ---
  S({ id: 'mrt-khaerai', code: 'PK01', lineId: 'mrt-pink', lat: 13.862, lng: 100.509, en: 'Khae Rai', th: 'แคราย', my: 'ခလေးရိုင်း', exits: ['Exit 1 → Ministry of Finance', 'Exit 2 → Khae Rai junction'] }),
  S({ id: 'mrt-laksi', code: 'PK03', lineId: 'mrt-pink', lat: 13.835, lng: 100.546, en: 'Lak Si', th: 'หลักสี่', my: 'လတ်စီ', exits: ['Exit 1 → Don Mueang bus link', 'Exit 2 → Soi Lak Si'] }),
  S({ id: 'mrt-watphrasri', code: 'PK04', lineId: 'mrt-pink', lat: 13.828, lng: 100.547, en: 'Wat Phra Sri Mahathat', th: 'วัดพระศรีมหาธาตุ', my: 'ဘုရားစီမဟာထားစဉ်', exits: ['Exit 1 → Phahonyothin Rd', 'Exit 2 → Wat'] }),
  S({ id: 'mrt-btsmochit', code: 'PK05', lineId: 'mrt-pink', lat: 13.8019, lng: 100.5538, en: 'Mo Chit', th: 'หมอชิต', my: 'မိုးချစ်', exits: ['Exit 1 → BTS Mo Chit', 'Exit 2 → Chatuchak Park'] }),
  S({ id: 'mrt-minburi', code: 'PK15', lineId: 'mrt-pink', lat: 13.87, lng: 100.619, en: 'Min Buri', th: 'มีนบุรี', my: 'မင်းပြည်', exits: ['Exit 1 → Min Buri Market', 'Exit 2 → Seri Thai Rd'] }),
  // --- Airport Rail Link ---
  S({ id: 'arl-suvarnabhumi', code: 'A08', lineId: 'arl', lat: 13.69, lng: 100.7501, en: 'Suvarnabhumi Airport', th: 'สนามบินสุวรรณภูมิ', my: 'ဆူဝန်နဖူမီ လေဆိပ်', exits: ['Exit 1 → Terminal 1', 'Exit 2 → Terminal 3', 'Exit 3 → City Bus'] }),
  S({ id: 'arl-sirat', code: 'A07', lineId: 'arl', lat: 13.7005, lng: 100.7145, en: 'Si Rat', th: 'ศรีรัช', my: 'စီရတ်', exits: ['Exit 1 → Motorway'] }),
  S({ id: 'arl-banthapchang', code: 'A06', lineId: 'arl', lat: 13.7144, lng: 100.6728, en: 'Ban Thap Chang', th: 'บ้านทับช้าง', my: 'ဘန်တပ်ချောင်', exits: ['Exit 1 → Thap Chang housing'] }),
  S({ id: 'arl-latkrabang', code: 'A05', lineId: 'arl', lat: 13.7276, lng: 100.624, en: 'Lat Krabang', th: 'ลาดกระบัง', my: 'လတ်ကရဘန်', exits: ['Exit 1 → Lat Krabang market'] }),
  S({ id: 'arl-cityair', code: 'A04', lineId: 'arl', lat: 13.729, lng: 100.5952, en: 'City Air Terminal', th: 'สถานีนครแอร์เทอร์มินัล', my: 'စီတီ လေဆိပ်တာမီနယ်', exits: ['Exit 1 → Asok / Phetchaburi'] }),
  S({ id: 'arl-makkasan', code: 'A03', lineId: 'arl', lat: 13.7368, lng: 100.5621, en: 'Makkasan', th: 'มักกะสัน', my: 'မက္ကဆန်', exits: ['Exit 1 → MRT Phetchaburi (500 m)', 'Exit 2 → AIA building'] }),
  S({ id: 'arl-phayathai', code: 'A01', lineId: 'arl', lat: 13.757, lng: 100.535, en: 'Phaya Thai', th: 'พญาไท', my: 'ဖရယူသိုင်း', exits: ['Exit 1 → BTS Phaya Thai', 'Exit 2 → Ratchaprarop Rd'] }),
];

const byId = new Map(STATIONS.map((s) => [s.id, s]));
export const stationById = (id: string): Station | undefined => byId.get(id);
export const stationsOfLine = (lineId: string): Station[] => {
  const line = RAIL_LINES.find((l) => l.id === lineId);
  if (!line) return [];
  return line.stations.map((sid) => byId.get(sid)).filter((s): s is Station => Boolean(s));
};

/** Index of a station inside its line, and the two direction termini. */
export function directionInfo(lineId: string, stationId: string): {
  index: number;
  total: number;
  towardA: I18nName;
  towardB: I18nName;
} | null {
  const stations = stationsOfLine(lineId);
  const index = stations.findIndex((s) => s.id === stationId);
  if (index < 0 || stations.length < 2) return null;
  return {
    index,
    total: stations.length,
    towardA: { en: stations[0].en, th: stations[0].th, my: stations[0].my },
    towardB: {
      en: stations[stations.length - 1].en,
      th: stations[stations.length - 1].th,
      my: stations[stations.length - 1].my,
    },
  };
}

/** Cross-operator interchange map (walk through fare gate / skywalk). */
export const INTERCHANGES: Record<string, string[]> = {
  'bts-siam': ['bts-silom', 'bts-sukhumvit'],
  'bts-saladaeng': ['mrt-silom'],
  'mrt-silom': ['bts-saladaeng'],
  'bts-asok': ['mrt-sukhumvit'],
  'mrt-sukhumvit': ['bts-asok'],
  'bts-mochit': ['mrt-btsmochit', 'mrt-chatuchakpark'],
  'mrt-btsmochit': ['bts-mochit'],
  'mrt-chatuchakpark': ['bts-mochit'],
  'bts-phayathai': ['arl-phayathai'],
  'arl-phayathai': ['bts-phayathai'],
  'bts-bangwa': ['mrt-bangwa'],
  'mrt-bangwa': ['bts-bangwa'],
  'mrt-taopoon': ['mrt-khlongbangsue'],
  'mrt-latphrao': ['mrt-sikrithai'],
  'mrt-ratchadaphisek': ['mrt-huaikhwang'],
};
