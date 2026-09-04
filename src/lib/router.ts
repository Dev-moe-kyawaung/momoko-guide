import type { Crowding, I18nName, Journey, JourneyLeg, Mode, Place, RailOperator } from '../types';
import { RAIL_LINES, STATIONS, INTERCHANGES, headwayOf } from '../data/rail';
import { BUS_ROUTES, BUS_STOPS } from '../data/bus';
import { LANDMARKS } from '../data/landmarks';
import { haversineM } from '../data/geo';
import { railFare } from './fare';

/**
 * Multimodal routing engine (walk → bus/boat → rail → walk).
 * Dijkstra over (node, incoming-line) states so that transfer counting and
 * per-boarding fares are exact. Costs are additive: minutes, plus fare for the
 * first segment of every ride, plus a transfer penalty when the line changes.
 */

const SPEED: Record<Mode, number> = { walk: 4.6, bus: 14, boat: 12, rail: 34 }; // km/h
const DETOUR: Record<Mode, number> = { walk: 1.18, bus: 1.35, boat: 1.15, rail: 1.12 };
const DWELL_MIN: Record<Mode, number> = { walk: 0, bus: 0.55, boat: 0.8, rail: 0.45 };
const ACCESS_MIN = 1.6; // fare gate / pavement overhead on every walk leg
const TRANSFER_PENALTY_MIN = 5;

interface GNode {
  id: string;
  lat: number;
  lng: number;
  kind: 'station' | 'stop' | 'landmark';
}

interface GEdge {
  to: string;
  mode: Mode;
  lineId?: string;
  minutes: number;
  distM: number;
  fareThb: number;
}

const nodes = new Map<string, GNode>();
const adj = new Map<string, GEdge[]>();

function addNode(n: GNode) {
  nodes.set(n.id, n);
  if (!adj.has(n.id)) adj.set(n.id, []);
}
function addEdge(e: GEdge & { from: string }) {
  const list = adj.get(e.from) ?? [];
  list.push({ to: e.to, mode: e.mode, lineId: e.lineId, minutes: e.minutes, distM: e.distM, fareThb: e.fareThb });
  adj.set(e.from, list);
}
function link(a: string, b: string, e: Omit<GEdge, 'to'>) {
  addEdge({ from: a, to: b, ...e });
  addEdge({ from: b, to: a, ...e });
}

function edgeMinutes(mode: Mode, distM: number): number {
  const km = (distM * DETOUR[mode]) / 1000;
  return (km / SPEED[mode]) * 60 + DWELL_MIN[mode];
}

let built = false;
function build() {
  if (built) return;
  built = true;
  STATIONS.forEach((s) => addNode({ id: s.id, lat: s.lat, lng: s.lng, kind: 'station' }));
  BUS_STOPS.forEach((s) => addNode({ id: s.id, lat: s.lat, lng: s.lng, kind: 'stop' }));
  LANDMARKS.forEach((l) => addNode({ id: l.id, lat: l.lat, lng: l.lng, kind: 'landmark' }));

  // Rail: consecutive stations per line, fare charged on the boarding segment.
  RAIL_LINES.forEach((line) => {
    const st = line.stations.map((id) => nodes.get(id)).filter((n): n is GNode => Boolean(n));
    for (let i = 0; i < st.length - 1; i += 1) {
      const a = st[i];
      const b = st[i + 1];
      const raw = haversineM(a.lat, a.lng, b.lat, b.lng);
      const legKm = (raw * DETOUR.rail) / 1000;
      const totalKm = (haversineM(st[0].lat, st[0].lng, st[st.length - 1].lat, st[st.length - 1].lng) * DETOUR.rail) / 1000;
      const share = totalKm > 0 ? legKm / totalKm : 0;
      const fare = railFare(line.operator as RailOperator, totalKm) * share;
      link(a.id, b.id, { mode: 'rail', lineId: line.id, minutes: edgeMinutes('rail', raw), distM: raw, fareThb: fare });
    }
  });

  // Bus / boat: consecutive stops per route, flat fare on the boarding segment.
  BUS_ROUTES.forEach((route) => {
    const st = route.stops.map((id) => nodes.get(id)).filter((n): n is GNode => Boolean(n));
    for (let i = 0; i < st.length - 1; i += 1) {
      const a = st[i];
      const b = st[i + 1];
      const raw = haversineM(a.lat, a.lng, b.lat, b.lng);
      const fare = i === 0 ? route.fareThb : 0; // flat fare applied on first segment
      link(a.id, b.id, { mode: route.kind === 'boat' ? 'boat' : 'bus', lineId: route.id, minutes: edgeMinutes(route.kind === 'boat' ? 'boat' : 'bus', raw), distM: raw, fareThb: fare });
    }
  });

  // Paid interchange corridors inside the same complex (platform → gate → exit).
  Object.entries(INTERCHANGES).forEach(([a, list]) => {
    const na = nodes.get(a);
    if (!na) return;
    list.forEach((b) => {
      const nb = nodes.get(b);
      if (!nb) return;
      const d = haversineM(na.lat, na.lng, nb.lat, nb.lng);
      link(a, b, { mode: 'walk', minutes: 3.5 + (d * DETOUR.walk) / 1000 / SPEED.walk * 60, distM: d, fareThb: 0 });
    });
  });

  // Walking edges between anything within 340 m (stops, stations, landmarks).
  const all = Array.from(nodes.values());
  for (let i = 0; i < all.length; i += 1) {
    for (let j = i + 1; j < all.length; j += 1) {
      const a = all[i];
      const b = all[j];
      const d = haversineM(a.lat, a.lng, b.lat, b.lng);
      if (d <= 340 && d > 1) {
        link(a.id, b.id, { mode: 'walk', minutes: ACCESS_MIN + (d * DETOUR.walk) / 1000 / SPEED.walk * 60, distM: d, fareThb: 0 });
      }
    }
  }
}

export type Objective = 'fastest' | 'cheapest' | 'fewest';

interface State {
  key: string;
  nodeId: string;
  lineKey: string;
  cost: number;
  minutes: number;
  transfers: number;
  fare: number;
}

function waitMin(mode: Mode, lineId?: string): number {
  if (mode === 'walk') return 0;
  if (mode === 'rail') {
    const line = RAIL_LINES.find((l) => l.id === lineId);
    return line ? headwayOf(line) / 2 : 2;
  }
  const route = BUS_ROUTES.find((r) => r.id === lineId);
  return route ? route.headwayPeakMin / 2 : 4;
}

function objectiveCost(objective: Objective, minutes: number, fare: number, changed: boolean): number {
  const penalty = changed ? TRANSFER_PENALTY_MIN : 0;
  if (objective === 'cheapest') return fare * 1.7 + minutes * 0.12 + (changed ? 2 : 0);
  if (objective === 'fewest') return minutes + (changed ? 45 : 0);
  return minutes + penalty;
}

function dijkstra(fromId: string, toId: string, objective: Objective): { edges: GEdge[]; minutes: number; transfers: number; fare: number } | null {
  build();
  if (!nodes.has(fromId) || !nodes.has(toId)) return null;
  const startKey = `${fromId}|walk`;
  const best = new Map<string, State>();
  const prev = new Map<string, { stateKey: string; edge: GEdge }>();
  best.set(startKey, { key: startKey, nodeId: fromId, lineKey: 'walk', cost: 0, minutes: 0, transfers: 0, fare: 0 });
  const queue: State[] = [best.get(startKey)!];

  while (queue.length) {
    queue.sort((a, b) => a.cost - b.cost);
    const cur = queue.shift()!;
    if (cur.cost > (best.get(cur.key)?.cost ?? Infinity)) continue;
    if (cur.nodeId === toId) {
      const edges: GEdge[] = [];
      let k: string | undefined = cur.key;
      while (k) {
        const p = prev.get(k) as { stateKey: string; edge: GEdge } | undefined;
        if (!p) break;
        edges.push(p.edge);
        k = p.stateKey;
      }
      edges.reverse();
      return { edges, minutes: cur.minutes, transfers: cur.transfers, fare: cur.fare };
    }
    (adj.get(cur.nodeId) ?? []).forEach((edge) => {
      const lineKey = edge.mode === 'walk' ? 'walk' : `${edge.mode}:${edge.lineId}`;
      const changed = lineKey !== 'walk' && cur.lineKey !== lineKey;
      const rideMin = edge.minutes + (changed ? waitMin(edge.mode, edge.lineId) : 0);
      const addFare = changed ? edge.fareThb : 0;
      const transfers = cur.transfers + (changed && cur.lineKey !== 'walk' ? 1 : 0);
      const cost = cur.cost + objectiveCost(objective, rideMin, addFare, changed && cur.lineKey !== 'walk');
      const minutes = cur.minutes + rideMin;
      const fare = cur.fare + addFare;
      const key = `${edge.to}|${lineKey}`;
      const existing = best.get(key);
      if (!existing || cost < existing.cost) {
        const next: State = { key, nodeId: edge.to, lineKey, cost, minutes, transfers, fare };
        best.set(key, next);
        prev.set(key, { stateKey: cur.key, edge });
        queue.push(next);
      }
    });
  }
  return null;
}

function crowdingFor(lineId: string, seed: number): Crowding {
  let h = 0;
  const s = `${lineId}-${seed}`;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) % 997;
  return ((h % 4) + 1) as Crowding;
}

function buildJourney(edges: GEdge[], fromId: string, toId: string, objective: Objective): Journey | null {
  if (!edges.length) return null;
  const legs: JourneyLeg[] = [];
  let idx = 0;
  let cursor = fromId;
  while (idx < edges.length) {
    const first = edges[idx];
    const key = `${first.mode}:${first.lineId ?? ''}`;
    let j = idx;
    let minutes = 0;
    let distM = 0;
    let fare = 0;
    let segments = 0;
    while (j < edges.length && `${edges[j].mode}:${edges[j].lineId ?? ''}` === key) {
      minutes += edges[j].minutes;
      distM += edges[j].distM;
      fare += edges[j].fareThb;
      segments += 1;
      j += 1;
    }
    const fromNode = nodes.get(cursor)!;
    const toNode = nodes.get(edges[j - 1].to)!;
    const base = {
      mode: first.mode,
      lineId: first.lineId,
      from: placeOf(fromNode),
      to: placeOf(toNode),
      minutes,
      distanceM: distM,
      stops: segments,
      fareThb: fare,
      crowding: crowdingFor(first.lineId ?? 'walk', segments + Math.floor(minutes)),
    };
    if (first.mode === 'rail' && first.lineId) {
      const line = RAIL_LINES.find((l) => l.id === first.lineId);
      const stations = line ? line.stations : [];
      const a = stations.indexOf(fromNode.id);
      const b = stations.indexOf(toNode.id);
      const forward = b > a;
      const target = line ? line.stations[forward ? line.stations.length - 1 : 0] : '';
      const targetStation = STATIONS.find((s) => s.id === target);
      legs.push({
        ...base,
        routeCode: line?.id,
        platform: forward ? 'Platform 2 (upper)' : 'Platform 1 (lower)',
        toward: targetStation ? { en: targetStation.en, th: targetStation.th, my: targetStation.my } : undefined,
        exit: exitFor(toNode.id),
      });
    } else if (first.mode === 'bus' || first.mode === 'boat') {
      const route = BUS_ROUTES.find((r) => r.id === first.lineId);
      legs.push({
        ...base,
        routeCode: route?.code ?? '',
        exit: undefined,
      });
    } else {
      legs.push(base);
    }
    cursor = toNode.id;
    idx = j;
  }

  const vehicleLegs = legs.filter((l) => l.mode !== 'walk');
  const walkLegs = legs.filter((l) => l.mode === 'walk');
  const durationMin = legs.reduce((s, l) => s + l.minutes, 0);
  const walkMin = walkLegs.reduce((s, l) => s + l.minutes, 0);
  const walkM = walkLegs.reduce((s, l) => s + l.distanceM, 0);
  const co2Kg = legs.reduce((s, l) => {
    const perKm = l.mode === 'walk' ? 0 : l.mode === 'rail' ? 0.021 : l.mode === 'boat' ? 0.05 : 0.089;
    return s + (l.distanceM / 1000) * perKm;
  }, 0);

  return {
    id: `${objective}-${fromId}-${toId}-${legs.length}-${Math.round(durationMin)}`,
    legs,
    departAt: 0,
    durationMin,
    transfers: Math.max(0, vehicleLegs.length - 1),
    fareThb: legs.reduce((s, l) => s + l.fareThb, 0),
    walkMin,
    walkM,
    co2Kg: Math.max(0, 0.17 * (legs.reduce((s, l) => s + l.distanceM, 0) / 1000) - co2Kg),
    crowdingMax: Math.max(...legs.map((l) => l.crowding), 1) as Crowding,
    objective,
    realtime: true,
  };
}

function exitFor(stationId: string): string | undefined {
  const s = STATIONS.find((x) => x.id === stationId);
  return s?.exits[0];
}

function placeOf(n: GNode) {
  const st = STATIONS.find((s) => s.id === n.id);
  if (st) return { id: st.id, kind: 'station' as const, lat: st.lat, lng: st.lng, en: st.en, th: st.th, my: st.my };
  const bs = BUS_STOPS.find((s) => s.id === n.id);
  if (bs) return { id: bs.id, kind: 'stop' as const, lat: bs.lat, lng: bs.lng, en: bs.en, th: bs.th, my: bs.my };
  const lm = LANDMARKS.find((l) => l.id === n.id)!;
  return { id: lm.id, kind: 'landmark' as const, lat: lm.lat, lng: lm.lng, en: lm.en, th: lm.th, my: lm.my };
}

export function planJourneys(fromId: string, toId: string): Journey[] {
  build();
  const objectives: Objective[] = ['fastest', 'cheapest', 'fewest'];
  const seen = new Set<string>();
  const out: Journey[] = [];
  objectives.forEach((objective) => {
    const r = dijkstra(fromId, toId, objective);
    if (!r) return;
    const j = buildJourney(r.edges, fromId, toId, objective);
    if (!j) return;
    const sig = j.legs.map((l) => `${l.mode}-${l.lineId ?? ''}`).join('>');
    if (seen.has(sig)) return;
    seen.add(sig);
    out.push(j);
  });
  return out.sort((a, b) => a.durationMin - b.durationMin);
}

/** Step-by-step narration, produced in all three languages at once. */
export function journeySteps(journey: Journey): { legIndex: number; icon: string; en: string; th: string; my: string }[] {
  const steps: { legIndex: number; icon: string; en: string; th: string; my: string }[] = [];
  journey.legs.forEach((leg, legIndex) => {
    const mins = Math.max(1, Math.round(leg.minutes));
    if (leg.mode === 'walk') {
      const m = Math.round(leg.distanceM);
      steps.push({
        legIndex,
        icon: 'walk',
        en: `Walk ${mins} min (${m} m) to ${leg.to.en}`,
        th: `เดิน ${mins} นาที (${m} ม.) ไป ${leg.to.th}`,
        my: `${mins} မိနစ် လမ်းလျှောက်ပါ (${m} မီတာ) — ${leg.to.my}`,
      });
      return;
    }
    if (leg.mode === 'rail') {
      const line = RAIL_LINES.find((l) => l.id === leg.lineId);
      const name = line ? { en: line.en, th: line.th, my: line.my } : ({ en: 'Train', th: 'รถไฟ', my: 'ရထား' } as I18nName);
      steps.push({
        legIndex,
        icon: 'train',
        en: `Board ${name.en} ${leg.platform ? `(${leg.platform})` : ''} ${leg.toward ? `toward ${leg.toward.en}` : ''} — ride ${leg.stops} stops, ${mins} min`,
        th: `ขึ้น${name.th} ${leg.platform ?? ''} ${leg.toward ? `มุ่งหน้า ${leg.toward.th}` : ''} — ${leg.stops} สถานี ${mins} นาที`,
        my: `${name.my} စီးပါ (${leg.platform ?? ''}) ${leg.toward ? `${leg.toward.my} ဘက်သို့` : ''} — ဘူတာ ${leg.stops} ခု၊ ${mins} မိနစ်`,
      });
      if (leg.exit) {
        steps.push({
          legIndex,
          icon: 'exit',
          en: `Leave the station at ${leg.exit}`,
          th: `ออกจากสถานีทาง ${leg.exit}`,
          my: `ဘူတာ ${leg.exit} မှ ထွက်ပါ`,
        });
      }
      return;
    }
    const line = BUS_ROUTES.find((l) => l.id === leg.lineId);
    const label = line ? line.code : '';
    const dest = line ? { en: line.en, th: line.th, my: line.my } : ({ en: '', th: '', my: '' } as I18nName);
    steps.push({
      legIndex,
      icon: leg.mode === 'boat' ? 'boat' : 'bus',
      en: `Take ${label} ${dest.en} — ${leg.stops} stops, ${mins} min, ฿${leg.fareThb}`,
      th: `นั่ง${label} ${dest.th} — ${leg.stops} ป้าย ${mins} นาที ${leg.fareThb} บาท`,
      my: `${label} စီးပါ ${dest.my} — ${leg.stops} ဂိတ်၊ ${mins} မိနစ်၊ ${leg.fareThb} ကျပ်`,
    });
  });
  return steps;
}

export function nearestStopIds(lat: number, lng: number, kinds: Place['kind'][], limit = 4): { id: string; meters: number }[] {
  build();
  const pool = Array.from(nodes.values()).filter((n) => kinds.includes(n.kind));
  return pool
    .map((n) => ({ id: n.id, meters: Math.round(haversineM(lat, lng, n.lat, n.lng)) }))
    .sort((a, b) => a.meters - b.meters)
    .slice(0, limit);
}

export const ROUTER_STATS = { nodes: () => { build(); return nodes.size; }, edges: () => { build(); let c = 0; adj.forEach((l) => (c += l.length)); return c; } };
