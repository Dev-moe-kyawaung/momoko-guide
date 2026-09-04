import { useEffect, useRef, useState } from 'react';
import type { Arrival, Crowding, I18nName, Vehicle } from '../types';
import { BUS_ROUTES, busStopById, routesServing } from '../data/bus';
import { RAIL_LINES, STATIONS, directionInfo, headwayOf, stationsOfLine } from '../data/rail';
import { NETWORK } from '../data/network';
import { haversineM, bearingDeg } from '../data/geo';

/**
 * GTFS-Realtime ingestion simulator.
 * In production this module is a thin client over the WebSocket/protobuf feed
 * (`wss://api.bkktransit.dev/v1/vehicles`); the same Vehicle[] shape is used
 * here so screens never change when the live feed is switched on.
 */

interface RouteGeometry {
  routeId: string;
  points: { lat: number; lng: number }[];
  cum: number[];
  totalM: number;
  speedMs: number;
}

const geoms = new Map<string, RouteGeometry>();

function geomFor(routeId: string): RouteGeometry {
  const cached = geoms.get(routeId);
  if (cached) return cached;
  const route = BUS_ROUTES.find((r) => r.id === routeId)!;
  const points = route.stops.map((sid) => {
    const s = busStopById(sid)!;
    return { lat: s.lat, lng: s.lng };
  });
  const cum: number[] = [0];
  for (let i = 1; i < points.length; i += 1) {
    cum.push(cum[i - 1] + haversineM(points[i - 1].lat, points[i - 1].lng, points[i].lat, points[i].lng) * 1.35);
  }
  const speedMs = route.kind === 'boat' ? 3.3 : route.kind === 'express' ? 7.2 : 3.9; // Bangkok peak traffic
  const g: RouteGeometry = { routeId, points, cum, totalM: cum[cum.length - 1], speedMs };
  geoms.set(routeId, g);
  return g;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) % 100000;
  return h;
}

export function crowdingLabel(c: Crowding): 'crowdLow' | 'crowdMed' | 'crowdHigh' | 'crowdPacked' {
  return c === 1 ? 'crowdLow' : c === 2 ? 'crowdMed' : c === 3 ? 'crowdHigh' : 'crowdPacked';
}
export const CROWDING_COLOR: Record<Crowding, string> = { 1: '#2ED47A', 2: '#F5C451', 3: '#F08A3C', 4: '#FF5C5C' };

/** Every route runs 2–4 vehicles; positions advance in real time. */
function vehicleCount(routeId: string): number {
  const r = BUS_ROUTES.find((x) => x.id === routeId)!;
  return r.kind === 'express' ? 2 : 3;
}

export function vehiclesAt(epochSec: number): Vehicle[] {
  const out: Vehicle[] = [];
  BUS_ROUTES.forEach((route) => {
    const g = geomFor(route.id);
    if (g.totalM <= 0) return;
    const count = vehicleCount(route.id);
    for (let i = 0; i < count; i += 1) {
      const seed = hash(`${route.id}-${i}`);
      const offset = (g.totalM * (i + 0.35)) / count;
      const speedFactor = 0.85 + ((seed % 30) / 100);
      const travel = epochSec * g.speedMs * speedFactor + offset;
      const cycle = g.totalM * 2;
      const t = travel % cycle;
      const forward = t <= g.totalM;
      const dist = forward ? t : cycle - t;
      // locate segment
      let seg = 0;
      while (seg < g.cum.length - 1 && g.cum[seg + 1] < dist) seg += 1;
      const a = g.points[seg];
      const b = g.points[Math.min(seg + 1, g.points.length - 1)];
      const span = Math.max(1, g.cum[seg + 1] - g.cum[seg]);
      const f = Math.min(1, Math.max(0, (dist - g.cum[seg]) / span));
      const lat = (forward ? a.lat + (b.lat - a.lat) * f : b.lat + (a.lat - b.lat) * f);
      const lng = (forward ? a.lng + (b.lng - a.lng) * f : b.lng + (a.lng - b.lng) * f);
      const next = g.points[Math.min(seg + 1, g.points.length - 1)];
      const prev = g.points[seg];
      const brg = bearingDeg(lat, lng, forward ? next.lat : prev.lat, forward ? next.lng : prev.lng);
      const crowding = ((hash(`${route.id}-${i}-${Math.floor(epochSec / 600)}`) % 4) + 1) as Crowding;
      const delaySec = (hash(`${route.id}-d-${Math.floor(epochSec / 300)}`) % 300) - 60;
      out.push({
        id: `${route.id}-${i}`,
        routeId: route.id,
        lat,
        lng,
        bearing: (brg + 360) % 360,
        crowding,
        delaySec,
        vehicleType: route.fuel === 'electric' ? 'BYD K9 electric' : route.kind === 'boat' ? 'Chao Phraya Express' : 'BMTA air-con 12m',
        occupancyStatus: ['EMPTY', 'MANY_SEATS_AVAILABLE', 'FEW_SEATS_AVAILABLE', 'FULL'][crowding - 1],
        lastUpdate: epochSec * 1000,
      });
    }
  });
  return out;
}

export function useLiveVehicles(intervalMs = 2000): Vehicle[] {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => vehiclesAt(Date.now() / 1000));
  const ref = useRef(vehicles);
  ref.current = vehicles;
  useEffect(() => {
    const id = setInterval(() => setVehicles(vehiclesAt(Date.now() / 1000)), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return vehicles;
}

/** Live arrivals at a bus stop: remaining path distance → ETA. */
export function arrivalsForStop(stopId: string, vehicles: Vehicle[], epochSec: number): Arrival[] {
  const stop = busStopById(stopId);
  if (!stop) return [];
  const out: Arrival[] = [];
  routesServing(stopId).forEach((route) => {
    const g = geomFor(route.id);
    const stopIdx = route.stops.indexOf(stopId);
    const destIdx = route.stops.length - 1;
    const destStationId = route.stops[destIdx];
    const destStop = busStopById(destStationId)!;
    vehicles
      .filter((v) => v.routeId === route.id)
      .forEach((v) => {
        const travel = epochSec * g.speedMs + hash(`${route.id}-${v.id.slice(-1)}`);
        const cycle = g.totalM * 2;
        const t = travel % cycle;
        const forward = t <= g.totalM;
        const dist = forward ? t : cycle - t;
        const stopDist = g.cum[stopIdx];
        let remaining: number | null = null;
        if (forward && stopDist >= dist) remaining = stopDist - dist;
        if (!forward && stopDist <= dist) remaining = dist - stopDist;
        if (remaining === null) return;
        const etaSec = Math.round(remaining / g.speedMs + Math.max(0, v.delaySec));
        if (etaSec > 60 * 45) return;
        out.push({
          routeId: route.id,
          dest: forward
            ? { en: destStop.en, th: destStop.th, my: destStop.my }
            : { en: g.points.length ? (busStopById(route.stops[0])?.en ?? '') : '', th: busStopById(route.stops[0])?.th ?? '', my: busStopById(route.stops[0])?.my ?? '' },
          etaSec,
          crowding: v.crowding,
          realtime: true,
          vehicleId: v.id,
        });
      });
  });

  // Schedule fallback so the board never looks empty (GTFS static headways).
  routesServing(stopId).forEach((route) => {
    const existing = out.filter((a) => a.routeId === route.id).length;
    for (let k = existing; k < 2; k += 1) {
      const seed = hash(`${route.id}-${stopId}-${Math.floor(epochSec / 600)}`);
      const etaSec = Math.round((route.headwayPeakMin * 60) / 2 + (seed % 600) + k * route.headwayPeakMin * 60);
      const destStop = busStopById(route.stops[route.stops.length - 1])!;
      out.push({
        routeId: route.id,
        dest: { en: destStop.en, th: destStop.th, my: destStop.my },
        etaSec,
        crowding: ((seed % 3) + 1) as Crowding,
        realtime: false,
      });
    }
  });
  return out.sort((a, b) => a.etaSec - b.etaSec).slice(0, 6);
}

/** Next train countdown at a rail station, both directions, per line. */
export function trainsForStation(stationId: string, epochSec: number): {
  lineId: string;
  toward: I18nName;
  etaSec: number;
  platform: string;
  crowding: Crowding;
  direction: 'A' | 'B';
}[] {
  const out: {
    lineId: string;
    toward: I18nName;
    etaSec: number;
    platform: string;
    crowding: Crowding;
    direction: 'A' | 'B';
  }[] = [];
  RAIL_LINES.forEach((line) => {
    if (!line.stations.includes(stationId)) return;
    const info = directionInfo(line.id, stationId);
    if (!info) return;
    const headway = headwayOf(line) * 60;
    const nowMin = epochSec / 60;
    (['A', 'B'] as const).forEach((dir, di) => {
      const phase = (nowMin + di * (headway / 60 / 2) + hash(line.id + dir) / 100) % (headway / 60);
      const etaMin = headway / 60 - phase;
      const stationIdx = line.stations.indexOf(stationId);
      const seed = hash(`${line.id}-${dir}-${Math.floor(nowMin / 30)}`);
      const crowdingRaw = (seed % 4) + 1;
      const peak = new Date().getHours();
      const rush = peak >= 7 && peak <= 9 ? 1 : peak >= 17 && peak <= 20 ? 1 : 0;
      const crowding = Math.min(4, crowdingRaw + rush) as Crowding;
      out.push({
        lineId: line.id,
        toward: dir === 'A' ? info.towardA : info.towardB,
        etaSec: Math.round(etaMin * 60),
        platform: dir === 'A' ? 'Platform 1' : 'Platform 2',
        crowding,
        direction: dir,
      });
      if (stationIdx < 0) return;
    });
  });
  return out.sort((a, b) => a.etaSec - b.etaSec);
}

/** Feed entity JSON exactly like the production GTFS-RT endpoint returns. */
export function sampleFeedEntity(vehicles: Vehicle[]): object {
  const v = vehicles[0];
  return {
    id: `veh-${v?.id ?? '0'}`,
    is_deleted: false,
    vehicle: {
      trip: { trip_id: 'BMTA-511-0730', route_id: '511', direction_id: 0 },
      position: { latitude: v?.lat ?? 13.7372, longitude: v?.lng ?? 100.5601, bearing: v?.bearing ?? 90 },
      current_stop_sequence: 12,
      stop_id: '2205',
      current_status: 'IN_TRANSIT_TO',
      timestamp: Math.floor((v?.lastUpdate ?? Date.now()) / 1000),
      vehicle: { id: 'BMTA-BYD-0421', label: '511', license_plate: '11-4589' },
      occupancy_status: v?.occupancyStatus ?? 'MANY_SEATS_AVAILABLE',
    },
  };
}

export const GTFS_META = {
  staticVersion: NETWORK.gtfStaticVersion,
  realtimeFeeds: NETWORK.gtfsRtFeedCount,
  routes: BUS_ROUTES.length + RAIL_LINES.length,
  stops: BUS_ROUTES.reduce((s, r) => s + r.stops.length, 0) + STATIONS.length,
  stationSample: stationsOfLine('bts-sukhumvit').length,
};
