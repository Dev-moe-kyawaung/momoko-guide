import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { BBOX, LNG_CORRECTION, RIVER, ROADS } from '../data/geo';
import { RAIL_LINES, STATIONS } from '../data/rail';
import { BUS_ROUTES, BUS_STOPS } from '../data/bus';
import { LANDMARKS } from '../data/landmarks';
import { Theme } from '../theme';
import type { LandmarkCategory, Place, Vehicle } from '../types';

/**
 * Vector map canvas rendered with plain Views (no native map module), so it
 * works identically on iOS, Android and web. Projects WGS84 → screen pixels
 * with a Mercator-lite correction for latitude 13.8°N.
 */

export interface MapCanvasProps {
  height: number;
  width?: number;
  theme: Theme;
  vehicles?: Vehicle[];
  places?: Place[];
  showRail?: boolean;
  showBus?: boolean;
  showSmart?: boolean;
  showLandmarks?: boolean;
  user?: { lat: number; lng: number; accuracyM: number } | null;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  dense?: boolean;
}

interface Pt {
  x: number;
  y: number;
}

const CATEGORY_ICON_MAP: Record<LandmarkCategory, any> = {
  temple: 'business',
  mall: 'cart',
  park: 'leaf',
  hospital: 'medkit',
  university: 'school',
  market: 'pricetag',
  monument: 'trophy',
  airport: 'airplane',
  pier: 'boat',
  government: 'business-center',
  transit: 'train',
};

const DISTRICTS = [
  { id: 'silom', lat: 13.728, lng: 100.535, r: 34 },
  { id: 'sukhumvit', lat: 13.736, lng: 100.585, r: 30 },
  { id: 'oldtown', lat: 13.752, lng: 100.5, r: 30 },
  { id: 'chatuchak', lat: 13.8, lng: 100.553, r: 28 },
  { id: 'bangna', lat: 13.67, lng: 100.63, r: 26 },
  { id: 'nonthaburi', lat: 13.865, lng: 100.44, r: 26 },
  { id: 'huai-khwang', lat: 13.77, lng: 100.568, r: 24 },
  { id: 'rangsit', lat: 13.93, lng: 100.6, r: 26 },
];

const STATION_BY_ID = new Map(STATIONS.map((s) => [s.id, s]));
const BUS_STOP_BY_ID = new Map(BUS_STOPS.map((s) => [s.id, s]));

export function MapCanvas({
  height,
  width = 360,
  theme,
  vehicles = [],
  showRail = true,
  showBus = true,
  showSmart = true,
  showLandmarks = true,
  user = null,
  selectedId = null,
  onSelect,
  dense = false,
}: MapCanvasProps) {
  const project = useMemo(() => {
    const spanLng = (BBOX.lngMax - BBOX.lngMin) * LNG_CORRECTION;
    const spanLat = BBOX.latMax - BBOX.latMin;
    const k = Math.min(width / spanLng, height / spanLat);
    return (lat: number, lng: number): Pt => ({
      x: (lng - BBOX.lngMin) * LNG_CORRECTION * k + (width - spanLng * k) / 2,
      y: (BBOX.latMax - lat) * k + (height - spanLat * k) / 2,
    });
  }, [height, width]);

  const riverPoints = RIVER.map(([lat, lng]) => project(lat, lng));
  const userPt = user ? project(user.lat, user.lng) : null;

  return (
    <View style={{ height, backgroundColor: theme.land, overflow: 'hidden' }}>
      {DISTRICTS.map((d) => {
        const p = project(d.lat, d.lng);
        return (
          <View
            key={d.id}
            style={{
              position: 'absolute',
              left: p.x - d.r,
              top: p.y - d.r * 0.62,
              width: d.r * 2,
              height: d.r * 1.24,
              borderRadius: d.r * 0.3,
              backgroundColor: theme.dark ? 'rgba(255,255,255,0.035)' : 'rgba(20,50,90,0.05)',
            }}
          />
        );
      })}

      <Polyline points={riverPoints} color={theme.water} width={9} round />

      {ROADS.map((r) => (
        <Polyline key={r.id} points={r.points.map(([lat, lng]) => project(lat, lng))} color={theme.road} width={r.width} />
      ))}

      {showRail
        ? RAIL_LINES.map((line) => {
            const pts = line.stations
              .map((sid) => {
                const st = STATION_BY_ID.get(sid);
                return st ? project(st.lat, st.lng) : null;
              })
              .filter((p): p is Pt => Boolean(p));
            return <Polyline key={line.id} points={pts} color={line.color} width={dense ? 2.5 : 3.4} />;
          })
        : null}

      {showBus
        ? BUS_ROUTES.map((r) => (
            <Polyline
              key={r.id}
              points={r.stops
                .map((sid) => {
                  const s = BUS_STOP_BY_ID.get(sid);
                  return s ? project(s.lat, s.lng) : null;
                })
                .filter((p): p is Pt => Boolean(p))}
              color={r.kind === 'boat' ? theme.water : r.color}
              width={1.6}
              dashed
            />
          ))
        : null}

      {showLandmarks && !dense
        ? LANDMARKS.map((l) => {
            const p = project(l.lat, l.lng);
            return (
              <View key={l.id} style={{ position: 'absolute', left: p.x - 5, top: p.y - 5, opacity: 0.95 }}>
                <Ionicons name={CATEGORY_ICON_MAP[l.category]} size={10} color={theme.gold} />
              </View>
            );
          })
        : null}

      {showRail
        ? STATIONS.map((s) => {
            const p = project(s.lat, s.lng);
            const line = RAIL_LINES.find((l) => l.id === s.lineId);
            const isSel = selectedId === s.id;
            return (
              <Pressable
                key={s.id}
                onPress={() => onSelect?.(s.id)}
                style={{ position: 'absolute', left: p.x - 11, top: p.y - 11, width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}
                hitSlop={6}
              >
                {isSel ? <View style={{ position: 'absolute', width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: theme.primary }} /> : null}
                <View
                  style={{
                    width: isSel ? 13 : 8,
                    height: isSel ? 13 : 8,
                    borderRadius: 8,
                    backgroundColor: line?.color ?? theme.primary,
                    borderWidth: 1.6,
                    borderColor: theme.dark ? '#0A1220' : '#FFFFFF',
                  }}
                />
              </Pressable>
            );
          })
        : null}

      {showBus
        ? BUS_STOPS.filter((s) => (showSmart ? true : s.smart !== 'digital')).map((s) => {
            const p = project(s.lat, s.lng);
            const isSel = selectedId === s.id;
            const color = s.smart === 'digital' ? theme.gold : s.smart === 'renovated' ? theme.accent : theme.textFaint;
            return (
              <Pressable
                key={s.id}
                onPress={() => onSelect?.(s.id)}
                style={{ position: 'absolute', left: p.x - 9, top: p.y - 9, width: 18, height: 18, alignItems: 'center', justifyContent: 'center' }}
                hitSlop={6}
              >
                <View
                  style={{
                    width: isSel ? 11 : 6,
                    height: isSel ? 11 : 6,
                    borderRadius: 2,
                    backgroundColor: color,
                    borderWidth: 1,
                    borderColor: theme.dark ? '#0A1220' : '#FFFFFF',
                  }}
                />
              </Pressable>
            );
          })
        : null}

      {vehicles.map((v) => {
        const p = project(v.lat, v.lng);
        const route = BUS_ROUTES.find((r) => r.id === v.routeId);
        const isBoat = route?.kind === 'boat';
        return (
          <View
            key={v.id}
            style={{
              position: 'absolute',
              left: p.x - 9,
              top: p.y - 9,
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: route?.color ?? theme.bus,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1.5,
              borderColor: theme.dark ? '#04140B' : '#FFFFFF',
            }}
          >
            <Ionicons name={isBoat ? 'boat' : 'bus'} size={9} color="#fff" />
          </View>
        );
      })}

      {user && userPt ? (
        <>
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: userPt.x - user.accuracyM * 0.5,
              top: userPt.y - user.accuracyM * 0.5,
              width: user.accuracyM,
              height: user.accuracyM,
              borderRadius: user.accuracyM,
              backgroundColor: 'rgba(74,168,255,0.14)',
              borderWidth: 1,
              borderColor: 'rgba(74,168,255,0.45)',
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: userPt.x - 6,
              top: userPt.y - 6,
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: '#4AA8FF',
              borderWidth: 2.5,
              borderColor: '#FFFFFF',
            }}
          />
        </>
      ) : null}
    </View>
  );
}

function Polyline({ points, color, width, dashed, round }: { points: Pt[]; color: string; width: number; dashed?: boolean; round?: boolean }) {
  const segments: { key: string; left: number; top: number; len: number; angle: number }[] = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (!isFinite(len) || len < 0.1) continue;
    segments.push({
      key: `${i}`,
      left: (a.x + b.x) / 2 - len / 2,
      top: (a.y + b.y) / 2 - width / 2,
      len,
      angle: (Math.atan2(dy, dx) * 180) / Math.PI,
    });
  }
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' }}>
      {segments.map((s) => (
        <View
          key={s.key}
          style={{
            position: 'absolute',
            left: s.left,
            top: s.top,
            width: s.len,
            height: width,
            backgroundColor: color,
            opacity: dashed ? 0.6 : 1,
            borderRadius: round ? width / 2 : 0,
            transform: [{ rotate: `${s.angle}deg` }],
          }}
        />
      ))}
    </View>
  );
}
