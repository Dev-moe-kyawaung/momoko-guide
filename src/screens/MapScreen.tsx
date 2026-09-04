import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { haversineM } from '../data/geo';
import { useThemed } from '../themeContext';
import { useApp } from '../store';
import { t, nameOf } from '../i18n';
import { Card, Chip, CrowdDots, EmptyState, IconBadge, SectionHeader, Tag, Txt } from '../components/ui';
import { MapCanvas } from '../components/MapCanvas';
import { spacing } from '../theme';
import { useLiveVehicles, crowdingLabel } from '../lib/gtfs';
import { useNow } from '../lib/useNow';
import { findPlace, nearestPlaces } from '../data/geo';
import { busStopById, routesServing } from '../data/bus';
import { STATIONS, RAIL_LINES } from '../data/rail';
import { NETWORK } from '../data/network';
import type { RootNav } from '../nav/types';
import { useMain } from '../nav/mainContext';
import { arrivalsForStop, trainsForStation } from '../lib/gtfs';
import { fmtEta, fmtWalkMinutes } from '../lib/format';

export default function MapScreen({ navigation }: { navigation: RootNav }) {
  const theme = useThemed();
  const { settings, gps } = useApp();
  const lang = settings.lang;
  const vehicles = useLiveVehicles();
  const now = useNow(2000);
  const sec = now / 1000;
  const { setTab, setDraft } = useMain();

  const [showBus, setShowBus] = useState(true);
  const [showRail, setShowRail] = useState(true);
  const [showSmart, setShowSmart] = useState(true);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = selectedId ? findPlace(selectedId) : null;
  const nearby = useMemo(() => nearestPlaces(gps.lat, gps.lng, 6), [gps]);
  const lowAccuracy = gps.accuracyM > 40;

  const nearbyArrivals = useMemo(() => {
    const bus = nearby.find((p) => p.kind === 'stop');
    const rail = nearby.find((p) => p.kind === 'station');
    return {
      bus: bus ? { place: bus, arrivals: arrivalsForStop(bus.id, vehicles, sec).slice(0, 3) } : null,
      rail: rail ? { place: rail, trains: trainsForStation(rail.id, sec).slice(0, 2) } : null,
    };
  }, [nearby, vehicles, Math.floor(sec)]);

  const selectedRoutes = selected?.kind === 'stop' ? routesServing(selected.id) : [];
  const selectedStation = selected?.kind === 'station' ? STATIONS.find((s) => s.id === selected.id) : undefined;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ flex: 1, position: 'relative' }}>
        <MapCanvas
          height={640}
          theme={theme}
          vehicles={vehicles}
          user={gps}
          selectedId={selectedId}
          onSelect={(id) => setSelectedId(id)}
          showBus={showBus}
          showRail={showRail}
          showSmart={showSmart}
          showLandmarks={showLandmarks}
        />

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ position: 'absolute', top: spacing.md, left: 0, right: 0, maxHeight: 44 }}
          contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.md }}
        >
          <Chip label={`${t('showBus', lang)} · ${vehicles.length}`} theme={theme} active={showBus} icon="bus" onPress={() => setShowBus((v) => !v)} />
          <Chip label={t('showRail', lang)} theme={theme} active={showRail} icon="train" color="#4AA8FF" onPress={() => setShowRail((v) => !v)} />
          <Chip label={t('showSmart', lang)} theme={theme} active={showSmart} icon="tv" color={theme.gold} onPress={() => setShowSmart((v) => !v)} />
          <Chip label={t('showLandmarks', lang)} theme={theme} active={showLandmarks} icon="business" color={theme.gold} onPress={() => setShowLandmarks((v) => !v)} />
        </ScrollView>

        {/* Recenter FAB */}
        <Pressable
          onPress={() => setSelectedId(null)}
          style={{
            position: 'absolute',
            right: spacing.lg,
            bottom: spacing.lg,
            backgroundColor: theme.card,
            borderColor: theme.border,
            borderWidth: 1,
            borderRadius: 999,
            width: 46,
            height: 46,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="locate" size={20} color={theme.primary} />
        </Pressable>
      </View>

      {/* Bottom panel */}
      <View style={{ backgroundColor: theme.bgElevated, borderTopWidth: 1, borderTopColor: theme.border, maxHeight: 320, paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
        {selected ? (
          <ScrollView contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <IconBadge
                name={selected.kind === 'station' ? 'train' : selected.kind === 'landmark' ? 'business' : 'bus'}
                color="#fff"
                bg={selected.kind === 'station' ? theme.mrt : selected.kind === 'landmark' ? theme.gold : theme.bus}
              />
              <View style={{ flex: 1 }}>
                <Txt theme={theme} size={16} weight="800" numberOfLines={1}>
                  {nameOf(selected, lang)}
                </Txt>
                <Txt theme={theme} size={11.5} dim>
                  {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}
                  {selectedStation ? ` · ${selectedStation.code}` : ''}
                </Txt>
              </View>
            </View>

            {selected.kind === 'stop' ? (
              <>
                <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                  <Tag
                    label={
                      busStopById(selected.id)?.smart === 'digital'
                        ? t('smartDigital', lang)
                        : busStopById(selected.id)?.smart === 'renovated'
                        ? t('smartRenovated', lang)
                        : t('smartClassic', lang)
                    }
                    theme={theme}
                    color={theme.gold}
                  />
                  {selectedRoutes.map((r) => (
                    <Tag key={r.id} label={r.code} theme={theme} color={r.color} />
                  ))}
                </View>
                {nearbyArrivals.bus && nearbyArrivals.bus.place.id === selected.id
                  ? nearbyArrivals.bus.arrivals.slice(0, 3).map((a, i) => (
                      <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <CrowdDots level={a.crowding} theme={theme} />
                        <Txt theme={theme} size={13} weight="700">
                          {selectedRoutes.find((r) => r.id === a.routeId)?.code}
                        </Txt>
                        <Txt theme={theme} size={12} dim style={{ flex: 1 }} numberOfLines={1}>
                          {nameOf(a.dest, lang)}
                        </Txt>
                        <Txt theme={theme} size={14} weight="800" color={theme.primary}>
                          {fmtEta(a.etaSec, lang)}
                        </Txt>
                      </View>
                    ))
                  : null}
              </>
            ) : null}

            {selectedStation ? (
              <View style={{ gap: 6 }}>
                {trainsForStation(selectedStation.id, sec).slice(0, 3).map((tr, i) => {
                  const line = RAIL_LINES.find((l) => l.id === tr.lineId);
                  return (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: line?.color }} />
                      <Txt theme={theme} size={12.5} weight="700" style={{ minWidth: 70 }} numberOfLines={1}>
                        {nameOf(line, lang)}
                      </Txt>
                      <Ionicons name="arrow-forward" size={11} color={theme.textFaint} />
                      <Txt theme={theme} size={12} dim style={{ flex: 1 }} numberOfLines={1}>
                        {nameOf(tr.toward, lang)}
                      </Txt>
                      <Txt theme={theme} size={13.5} weight="800" color={theme.primary}>
                        {fmtEta(tr.etaSec, lang)}
                      </Txt>
                    </View>
                  );
                })}
              </View>
            ) : null}

            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              {selected.kind === 'stop' ? (
                <Pressable style={{ flex: 1 }} onPress={() => navigation.navigate('StopDetail', { id: selected.id })}>
                  <Card theme={theme} style={{ alignItems: 'center', paddingVertical: 12 }}>
                    <Txt theme={theme} size={12.5} weight="800" color={theme.primary}>
                      {t('viewAll', lang)}
                    </Txt>
                  </Card>
                </Pressable>
              ) : selected.kind === 'station' ? (
                <Pressable style={{ flex: 1 }} onPress={() => navigation.navigate('StationDetail', { id: selected.id })}>
                  <Card theme={theme} style={{ alignItems: 'center', paddingVertical: 12 }}>
                    <Txt theme={theme} size={12.5} weight="800" color={theme.primary}>
                      {t('nextTrains', lang)}
                    </Txt>
                  </Card>
                </Pressable>
              ) : null}
              <Pressable
                style={{ flex: 1 }}
                onPress={() => {
                  setDraft({ fromId: selected.id });
                  setTab('plan');
                }}
              >
                <Card theme={theme} style={{ alignItems: 'center', paddingVertical: 12 }}>
                  <Txt theme={theme} size={12.5} weight="800" color={theme.primary}>
                    {t('setFrom', lang)}
                  </Txt>
                </Card>
              </Pressable>
            </View>
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.lg }}>
            <SectionHeader title={`${t('nearMe', lang)} · ${gps.label}`} theme={theme} icon="locate" />
            {lowAccuracy ? (
              <View style={{ backgroundColor: theme.dark ? 'rgba(245,196,81,0.12)' : 'rgba(245,196,81,0.18)', borderRadius: 12, padding: 10 }}>
                <Txt theme={theme} size={11.5} weight="700" color={theme.gold}>
                  {t('lowAccuracy', lang)}
                </Txt>
              </View>
            ) : null}
            {nearby.map((p) => (
              <Pressable key={p.id} onPress={() => setSelectedId(p.id)}>
                <Card theme={theme} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 }}>
                  <IconBadge
                    name={p.kind === 'station' ? 'train' : p.kind === 'landmark' ? 'business' : 'bus'}
                    size={15}
                    box={32}
                    color="#fff"
                    bg={p.kind === 'station' ? theme.mrt : p.kind === 'landmark' ? theme.gold : theme.bus}
                  />
                  <View style={{ flex: 1 }}>
                    <Txt theme={theme} size={13.5} weight="700" numberOfLines={1}>
                      {nameOf(p, lang)}
                    </Txt>
                    <Txt theme={theme} size={11} dim>
                      {Math.round(haversine(gps.lat, gps.lng, p.lat, p.lng))} m · {fmtWalkMinutes(Math.round(haversine(gps.lat, gps.lng, p.lat, p.lng)), lang)} {t('walk', lang).toLowerCase()}
                    </Txt>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={theme.textFaint} />
                </Card>
              </Pressable>
            ))}
            <Txt theme={theme} size={11} dim center style={{ marginTop: 4 }}>
              {t('tapStopHint', lang)}
            </Txt>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const haversine = haversineM;
