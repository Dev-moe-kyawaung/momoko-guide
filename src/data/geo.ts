import type { Place } from '../types';
import { STATIONS } from './rail';
import { BUS_STOPS } from './bus';
import { LANDMARKS } from './landmarks';

/** Bangkok viewport used by the vector map canvas (degrees). */
export const BBOX = { latMin: 13.63, latMax: 13.98, lngMin: 100.33, lngMax: 100.78 };

/** Cosine correction so 1 degree of longitude maps to true ground distance at 13.8 N. */
export const LNG_CORRECTION = Math.cos((13.8 * Math.PI) / 180);

export function haversineM(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371000;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const la1 = (aLat * Math.PI) / 180;
  const la2 = (bLat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function bearingDeg(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const la1 = (aLat * Math.PI) / 180;
  const la2 = (bLat * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(la2);
  const x = Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

export function allPlaces(): Place[] {
  const rail: Place[] = STATIONS.map((s) => ({
    id: s.id,
    kind: 'station' as const,
    lat: s.lat,
    lng: s.lng,
    en: s.en,
    th: s.th,
    my: s.my,
  }));
  const bus: Place[] = BUS_STOPS.map((s) => ({
    id: s.id,
    kind: 'stop' as const,
    lat: s.lat,
    lng: s.lng,
    en: s.en,
    th: s.th,
    my: s.my,
  }));
  const lm: Place[] = LANDMARKS.map((s) => ({
    id: s.id,
    kind: 'landmark' as const,
    lat: s.lat,
    lng: s.lng,
    en: s.en,
    th: s.th,
    my: s.my,
    category: s.category,
  }));
  return [...rail, ...bus, ...lm];
}

let cached: Place[] | null = null;
export function placeIndex(): Place[] {
  if (!cached) cached = allPlaces();
  return cached;
}

export function findPlace(id: string): Place | undefined {
  return placeIndex().find((p) => p.id === id);
}

export function nearestPlaces(lat: number, lng: number, limit = 5, kinds?: Place['kind'][]): Place[] {
  return placeIndex()
    .filter((p) => (kinds ? kinds.includes(p.kind) : true))
    .map((p) => ({ p, d: haversineM(lat, lng, p.lat, p.lng) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, limit)
    .map((x) => ({ ...x.p }));
}

export function searchPlaces(query: string, limit = 6): Place[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored = placeIndex()
    .map((p) => {
      const fields = [p.en, p.th, p.my].join(' ').toLowerCase();
      let score = -1;
      if (fields.includes(q)) score = 100;
      if (p.en.toLowerCase().startsWith(q)) score = Math.max(score, 140);
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((x) => x.p);
}

/** Simulated device GPS with realistic Bangkok urban-canyon drift. */
export const GPS_FIXES: { id: string; label: string; lat: number; lng: number; accuracyM: number }[] = [
  { id: 'gps-siam', label: 'Siam Discovery', lat: 13.7452, lng: 100.5318, accuracyM: 12 },
  { id: 'gps-asok', label: 'Asok Junction', lat: 13.7372, lng: 100.5592, accuracyM: 18 },
  { id: 'gps-mochit', label: 'Mo Chit Bus Terminal', lat: 13.8019, lng: 100.5548, accuracyM: 25 },
  { id: 'gps-saphan', label: 'Saphan Taksin Pier', lat: 13.7182, lng: 100.5132, accuracyM: 30 },
  { id: 'gps-oldtown', label: 'Yaowarat (Chinatown)', lat: 13.7394, lng: 100.5108, accuracyM: 46 },
  { id: 'gps-bangna', label: 'Bang Na Expressway', lat: 13.669, lng: 100.622, accuracyM: 68 },
];

/** Named road corridors drawn on the vector map (real geometry, simplified). */
export const ROADS: { id: string; name: string; width: number; points: [number, number][] }[] = [
  {
    id: 'sukhumvit',
    name: 'Sukhumvit Rd',
    width: 3,
    points: [
      [13.7446, 100.5347],
      [13.7442, 100.5432],
      [13.7436, 100.5501],
      [13.7397, 100.559],
      [13.7372, 100.5601],
      [13.7303, 100.5737],
      [13.7248, 100.5824],
      [13.7167, 100.5933],
      [13.7025, 100.602],
      [13.6903, 100.6016],
      [13.669, 100.622],
      [13.657, 100.643],
      [13.648, 100.672],
    ],
  },
  {
    id: 'phahonyothin',
    name: 'Phahonyothin Rd',
    width: 3,
    points: [
      [13.7647, 100.5378],
      [13.782, 100.542],
      [13.79, 100.547],
      [13.8019, 100.5538],
      [13.823, 100.56],
      [13.847, 100.568],
      [13.867, 100.59],
      [13.9144, 100.6057],
      [13.9616, 100.617],
    ],
  },
  {
    id: 'rama4',
    name: 'Rama IV Rd',
    width: 2.5,
    points: [
      [13.7431, 100.511],
      [13.7379, 100.529],
      [13.7286, 100.5352],
      [13.7201, 100.5401],
      [13.7157, 100.5541],
      [13.718, 100.567],
      [13.7372, 100.5601],
    ],
  },
  {
    id: 'chaengwattana',
    name: 'Chaeng Watthana Rd',
    width: 2.5,
    points: [
      [13.861, 100.4665],
      [13.842, 100.483],
      [13.803, 100.485],
      [13.783, 100.53],
      [13.7737, 100.569],
    ],
  },
  {
    id: 'ratchadaphisek',
    name: 'Ratchadaphisek Rd',
    width: 2.5,
    points: [
      [13.7573, 100.5666],
      [13.7671, 100.5688],
      [13.7737, 100.569],
      [13.7936, 100.563],
      [13.7982, 100.5531],
    ],
  },
  {
    id: 'charoenkrung',
    name: 'Charoen Krung Rd',
    width: 2,
    points: [
      [13.7185, 100.5137],
      [13.741, 100.497],
      [13.746, 100.493],
      [13.752, 100.489],
      [13.76, 100.486],
    ],
  },
  {
    id: 'sathorn',
    name: 'Sathorn Rd',
    width: 2.5,
    points: [
      [13.7286, 100.5352],
      [13.7252, 100.539],
      [13.7208, 100.5382],
      [13.7144, 100.535],
      [13.71, 100.523],
    ],
  },
];

/** Chao Phraya river centreline (Saphan Taksin → Pak Kret). */
export const RIVER: [number, number][] = [
  [13.635, 100.505],
  [13.652, 100.501],
  [13.672, 100.499],
  [13.69, 100.506],
  [13.7185, 100.5137],
  [13.733, 100.506],
  [13.741, 100.497],
  [13.746, 100.4895],
  [13.756, 100.4855],
  [13.765, 100.4775],
  [13.78, 100.472],
  [13.795, 100.462],
  [13.808, 100.452],
  [13.82, 100.443],
  [13.836, 100.4385],
  [13.861, 100.4395],
  [13.888, 100.4475],
  [13.918, 100.4495],
  [13.946, 100.4525],
  [13.976, 100.4475],
];
