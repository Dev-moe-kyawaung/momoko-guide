import type { Lang, Place } from '../types';
import { detectLang } from '../i18n';
import { placeIndex } from '../data/geo';

/** Longest-first substring match of any known place inside free text. */
function matchPlaces(text: string): Place[] {
  const t = text.toLowerCase();
  const found: { p: Place; len: number; pos: number }[] = [];
  placeIndex().forEach((p) => {
    [p.en, p.th, p.my].forEach((name) => {
      const n = name.toLowerCase();
      if (n.length >= 3 && t.includes(n)) found.push({ p, len: n.length, pos: t.indexOf(n) });
    });
  });
  const best = new Map<string, { p: Place; len: number; pos: number }>();
  found.forEach((f) => {
    const cur = best.get(f.p.id);
    if (!cur || f.len > cur.len) best.set(f.p.id, f);
  });
  return Array.from(best.values())
    .sort((a, b) => b.len - a.len || a.pos - b.pos)
    .map((x) => x.p);
}

export type Intent =
  | { kind: 'greeting' }
  | { kind: 'help' }
  | { kind: 'nearest'; target: 'rail' | 'bus' }
  | { kind: 'route'; toId: string; fromId?: string }
  | { kind: 'crowd' }
  | { kind: 'fare'; toId: string; fromId?: string }
  | { kind: 'unknown' };

const RAIL_WORDS = ['station', 'train', 'bts', 'mrt', 'skytrain', 'rail', 'สถานี', 'รถไฟ', 'บีทีเอส', 'เอ็มอาร์ที', 'ဘူတာ', 'ရထား'];
const BUS_WORDS = ['bus', 'stop', 'ป้าย', 'รถเมล์', 'รถบัส', 'ဘတ်စ်', 'ဂိတ်'];
const CROWD_WORDS = ['crowd', 'busy', 'packed', 'busy now', 'แออัด', 'คนเยอะ', 'คนมาก', 'လူများ', 'လူပြည့်'];
const HELP_WORDS = ['help', 'what can you', 'how do', 'ช่วย', 'ทำอะไร', 'ဘာလုပ်', 'ဘယ်လို'];
const GREET_WORDS = ['sawasdee', 'hello', 'hi', 'สวัสดี', 'မင်္ဂလာပါ', 'ဟေလို'];
const FARE_WORDS = ['fare', 'cost', 'how much', 'price', 'ค่าโดยสาร', 'ราคา', 'လက်ငင်း', 'ဈေးနှုန်း'];
const ROUTE_WORDS = ['route', 'go to', 'to ', 'how do i get', 'way to', 'plan', 'เดินทางไป', 'ไปที่', 'သွားမည်', 'ခရီးစဉ်'];

function includesAny(text: string, words: string[]): boolean {
  return words.some((w) => text.includes(w));
}

/** Rule-based multilingual intent parser (on-device fallback for the RAG model). */
export function parseIntent(input: string): { intent: Intent; lang: Lang } {
  const lang = detectLang(input) ?? 'en';
  const text = input.toLowerCase().trim();

  if (includesAny(text, GREET_WORDS)) return { intent: { kind: 'greeting' }, lang };
  if (includesAny(text, HELP_WORDS)) return { intent: { kind: 'help' }, lang };
  if (includesAny(text, CROWD_WORDS)) return { intent: { kind: 'crowd' }, lang };

  // Route / fare requests embed a place name; extract the best match.
  const wantsFare = includesAny(text, FARE_WORDS);
  const wantsRoute = wantsFare || includesAny(text, ROUTE_WORDS);
  if (wantsRoute) {
    const matches = matchPlaces(text);
    if (matches.length) {
      const toId = matches[0].id;
      // "from X to Y" patterns
      const fromMatch = matches.length > 1 ? matches[1].id : undefined;
      return { intent: { kind: wantsFare ? 'fare' : 'route', toId, fromId: fromMatch }, lang };
    }
  }

  if (includesAny(text, RAIL_WORDS)) return { intent: { kind: 'nearest', target: 'rail' }, lang };
  if (includesAny(text, BUS_WORDS)) return { intent: { kind: 'nearest', target: 'bus' }, lang };
  return { intent: { kind: 'unknown' }, lang };
}
