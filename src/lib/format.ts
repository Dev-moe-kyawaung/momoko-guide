import type { Lang } from '../types';

export function fmtEta(sec: number, lang: Lang): string {
  if (sec <= 25) return lang === 'th' ? 'มาแล้ว' : lang === 'my' ? 'ရောက်ပြီ' : 'Arriving';
  const m = Math.round(sec / 60);
  if (m < 60) return `${m} ${lang === 'th' ? 'น.' : lang === 'my' ? 'မိ' : 'min'}`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

export function fmtDistance(m: number): string {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}

export function fmtWalkMinutes(m: number, lang: Lang): string {
  const min = Math.max(1, Math.round((m / 1000 / 4.6) * 60));
  return `${min} ${lang === 'th' ? 'นาที' : lang === 'my' ? 'မိနစ်' : 'min'}`;
}

export function fmtClock(date: Date): string {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function fmtMinutes(total: number, lang: Lang): string {
  const m = Math.max(1, Math.round(total));
  if (m < 60) return `${m} ${lang === 'th' ? 'นาที' : lang === 'my' ? 'မိနစ်' : 'min'}`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

export function fmtAgo(ms: number, lang: Lang): string {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return lang === 'th' ? `${s} วินาทีที่แล้ว` : lang === 'my' ? `${s} စက္ကန့် အကြာက` : `${s}s ago`;
  const m = Math.round(s / 60);
  return lang === 'th' ? `${m} นาทีที่แล้ว` : lang === 'my' ? `${m} မိနစ် အကြာက` : `${m}m ago`;
}