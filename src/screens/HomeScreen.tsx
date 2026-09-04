import React, { useMemo } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemed } from '../themeContext';
import { useApp } from '../store';
import { t, LANGS } from '../i18n';
import { Card, Chip, CrowdDots, EmptyState, IconBadge, SectionHeader, Tag, Txt } from '../components/ui';
import { MapCanvas } from '../components/MapCanvas';
import { spacing } from '../theme';
import { nearestStopIds } from '../lib/router';
import { arrivalsForStop, crowdingLabel, trainsForStation, useLiveVehicles } from '../lib/gtfs';
import { useNow } from '../lib/useNow';
import { fmtEta } from '../lib/format';
import { NETWORK, SMART_CITY_PROJECTS } from '../data/network';
import { busStopById, routesServing } from '../data/bus';
import { RAIL_LINES, STATIONS } from '../data/rail';
import type { RootNav } from '../nav/types';
import { useMain } from '../nav/mainContext';
import { nameOf } from '../i18n';

export default function HomeScreen({ navigation }: { navigation: RootNav }) {
  const theme = useThemed();
  const { settings, updateSettings, gps, history } = useApp();
  const { setTab, setDraft } = useMain();
  const lang = settings.lang;
  const insets = useSafeAreaInsets();
  const now = useNow(1000);
  const sec = now / 1000;
  const vehicles = useLiveVehicles();
  const [refreshing, setRefreshing] = React.useState(false);

  const nearestBus = useMemo(() => nearestStopIds(gps.lat, gps.lng, ['stop'], 3), [gps]);
  const nearestRail = useMemo(() => nearestStopIds(gps.lat, gps.lng, ['station'], 3), [gps]);
  const busArrivals = useMemo(
    () => (nearestBus[0] ? arrivalsForStop(nearestBus[0].id, vehicles, sec) : []),
    [nearestBus, vehicles, Math.floor(sec)]
  );
  const railArrivals = useMemo(
    () => nearestRail.map((r) => ({ station: r, trains: trainsForStation(r.id, sec).slice(0, 2), meters: r.meters })),
    [nearestRail, Math.floor(sec)]
  );

  const hour = new Date().getHours();
  const greetingKey = hour < 12 ? 'greetingMorning' : hour < 17 ? 'greetingAfternoon' : 'greetingEvening';

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  };

  const rows = busArrivals.slice(0, 4);

  return (
    <FlatList
      style={{ backgroundColor: theme.bg }}
      contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2, gap: spacing.lg }}
      data={rows}
      keyExtractor={(a, i) => `${a.routeId}-${i}`}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
      ListHeaderComponent={
        <View style={{ gap: spacing.lg }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Txt theme={theme} size={22} weight="800">
                {t(greetingKey, lang)}
              </Txt>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <Ionicons name="location" size={12} color={theme.accent} />
                <Txt theme={theme} size={12.5} dim>
                  {gps.label} · ±{gps.accuracyM} m
                </Txt>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {LANGS.map((l) => (
                <Chip
                  key={l.id}
                  label={l.flag}
                  theme={theme}
                  active={settings.lang === l.id}
                  onPress={() => updateSettings({ lang: l.id })}
                />
              ))}
            </View>
          </View>

          {/* Live feed banner */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: theme.dark ? 'rgba(255,92,92,0.12)' : 'rgba(255,92,92,0.08)',
              borderColor: 'rgba(255,92,92,0.35)',
              borderWidth: 1,
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 7,
              alignSelf: 'flex-start',
            }}
          >
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: theme.danger }} />
            <Txt theme={theme} size={11.5} weight="800" color={theme.danger}>
              {t('liveNow', lang)}
            </Txt>
            <Txt theme={theme} size={11.5} dim>
              {vehicles.length} {t('liveVehicles', lang)} · {t('simulated', lang)}
            </Txt>
          </View>

          {/* Quick actions */}
          <View style={{ gap: spacing.sm }}>
            <SectionHeader title={t('quickActions', lang)} theme={theme} icon="flash" />
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <QuickAction icon="navigate" label={t('findNearMe', lang)} theme={theme} onPress={() => setTab('map')} />
              <QuickAction icon="git-branch" label={t('planTrip', lang)} theme={theme} onPress={() => setTab('plan')} />
              <QuickAction icon="sparkbubbles" label={t('askAi', lang)} theme={theme} onPress={() => setTab('ask')} />
              <QuickAction icon="tv" label={t('smartBoard', lang)} theme={theme} onPress={() => navigation.navigate('SmartBoard', { id: nearestBus[0]?.id ?? 'stop-victory' })} />
            </View>
          </View>

          {/* Network stats */}
          <View style={{ gap: spacing.sm }}>
            <SectionHeader title={t('networkStats', lang)} theme={theme} icon="grid" />
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Stat value={NETWORK.busStopsTotal.toLocaleString()} label={t('busStopsStat', lang)} theme={theme} />
              <Stat value={NETWORK.smartStopsTotal.toLocaleString()} label={t('smartStopStat', lang)} theme={theme} accent />
              <Stat value={String(NETWORK.railLines)} label={t('railStat', lang)} theme={theme} />
              <Stat value={NETWORK.electricBuses.toLocaleString()} label={t('evStat', lang)} theme={theme} />
            </View>
          </View>

          {/* Near me summary */}
          <View style={{ gap: spacing.sm }}>
            <SectionHeader title={`${t('nearMe', lang)} · ${t('nextDepartures', lang)}`} theme={theme} icon="time" actionLabel={t('viewAll', lang)} onAction={() => setTab('map')} />
            <Card theme={theme} style={{ gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <IconBadge name="bus" color={theme.dark ? '#04140B' : '#fff'} bg={theme.bus} size={16} box={30} />
                <View style={{ flex: 1 }}>
                  <Txt theme={theme} size={14} weight="800" numberOfLines={1}>
                    {nameOf(busStopById(nearestBus[0]?.id ?? '') ?? undefined, lang)}
                  </Txt>
                  <Txt theme={theme} size={11.5} dim>
                    {nearestBus[0]?.meters} m · {routesServing(nearestBus[0]?.id ?? '').map((r) => r.code).join(' · ')}
                  </Txt>
                </View>
              </View>
            </Card>
            {busArrivals.length === 0 ? (
              <EmptyState theme={theme} icon="time-outline" title={t('noArrivals', lang)} />
            ) : null}
          </View>
        </View>
      }
      renderItem={({ item }) => {
        const route = routesServing(nearestBus[0]?.id ?? '').find((r) => r.id === item.routeId);
        return (
          <Card theme={theme} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: spacing.sm }}>
            <View style={{ width: 4, alignSelf: 'stretch', borderRadius: 4, backgroundColor: route?.color ?? theme.bus }} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Txt theme={theme} size={15} weight="800">
                  {route?.code}
                </Txt>
                {route?.fuel === 'electric' ? <Tag label="EV" theme={theme} color="#22B07D" /> : null}
                {!item.realtime ? <Tag label="SCHED" theme={theme} color={theme.textFaint} /> : null}
              </View>
              <Txt theme={theme} size={12} dim numberOfLines={1}>
                {nameOf(item.dest, lang)}
              </Txt>
            </View>
            <CrowdDots level={item.crowding} theme={theme} />
            <Txt theme={theme} size={16} weight="800" color={theme.primary}>
              {fmtEta(item.etaSec, lang)}
            </Txt>
          </Card>
        );
      }}
      ListFooterComponent={
        <View style={{ gap: spacing.lg, marginTop: spacing.lg }}>
          {/* Rail next trains */}
          <View style={{ gap: spacing.sm }}>
            <SectionHeader title={t('railNext', lang)} theme={theme} icon="train" />
            {railArrivals.map(({ station, trains, meters }) => {
              const st = STATIONS.find((s) => s.id === station.id);
              return (
                <Card key={station.id} theme={theme} style={{ gap: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Pressable onPress={() => navigation.navigate('StationDetail', { id: station.id })} style={{ flex: 1 }}>
                      <Txt theme={theme} size={14.5} weight="800">
                        {nameOf(st, lang)}
                      </Txt>
                      <Txt theme={theme} size={11.5} dim>
                        {meters} m · {st?.code}
                      </Txt>
                    </Pressable>
                    <CrowdDots level={(trains[0]?.crowding ?? 1) as any} theme={theme} />
                  </View>
                  {trains.map((tr, i) => {
                    const line = RAIL_LINES.find((l) => l.id === tr.lineId);
                    return (
                      <View key={`${tr.lineId}-${i}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: line?.color }} />
                        <Txt theme={theme} size={12} weight="700" style={{ minWidth: 74 }} numberOfLines={1}>
                          {nameOf(line, lang)}
                        </Txt>
                        <Ionicons name="arrow-forward" size={11} color={theme.textFaint} />
                        <Txt theme={theme} size={12} dim style={{ flex: 1 }} numberOfLines={1}>
                          {nameOf(tr.toward, lang)}
                        </Txt>
                        <Txt theme={theme} size={13} weight="800" color={theme.primary}>
                          {fmtEta(tr.etaSec, lang)}
                        </Txt>
                      </View>
                    );
                  })}
                </Card>
              );
            })}
          </View>

          {/* Mini map */}
          <View style={{ gap: spacing.sm }}>
            <SectionHeader title={t('tabMap', lang)} theme={theme} icon="map" actionLabel={t('viewAll', lang)} onAction={() => setTab('map')} />
            <View style={{ borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: theme.border }}>
              <MapCanvas height={190} theme={theme} vehicles={vehicles} user={gps} />
            </View>
          </View>

          {/* Smart city programme */}
          <View style={{ gap: spacing.sm }}>
            <SectionHeader title={t('smartCity', lang)} theme={theme} icon="sparkles" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.lg }}>
              {SMART_CITY_PROJECTS.map((p) => (
                <Card key={p.id} theme={theme} style={{ width: 250, gap: 6 }} elevated>
                  <IconBadge name={p.icon as any} color="#fff" bg={p.color} />
                  <Txt theme={theme} size={14} weight="800">
                    {p[lang].title}
                  </Txt>
                  <Txt theme={theme} size={12} dim>
                    {p[lang].body}
                  </Txt>
                </Card>
              ))}
            </ScrollView>
          </View>

          {/* Recent journeys */}
          {history.length ? (
            <View style={{ gap: spacing.sm }}>
              <SectionHeader title={t('recentJourneys', lang)} theme={theme} icon="time-outline" />
              {history.slice(0, 3).map((h) => (
                <Pressable key={h.id} onPress={() => navigation.navigate('Journey', { fromId: h.fromId, toId: h.toId })}>
                  <Card theme={theme} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <IconBadge name="swap-horizontal" color={theme.primary} bg={theme.primarySoft} size={15} box={30} />
                    <View style={{ flex: 1 }}>
                      <Txt theme={theme} size={13} weight="700" numberOfLines={1}>
                        {h.fromId.replace(/^(stop|mrt|bts|arl|lm)-/, '')} → {h.toId.replace(/^(stop|mrt|bts|arl|lm)-/, '')}
                      </Txt>
                      <Txt theme={theme} size={11} dim>
                        {h.durationMin} {t('min', lang)} · ฿{h.fareThb}
                      </Txt>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={theme.textFaint} />
                  </Card>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      }
      ListFooterComponentStyle={{ paddingBottom: insets.bottom }}
    />
  );
}

function QuickAction({ icon, label, theme, onPress }: { icon: any; label: string; theme: ReturnType<typeof useThemed>; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ flex: 1 }} hitSlop={4}>
      <Card theme={theme} style={{ alignItems: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 6 }}>
        <IconBadge name={icon} color={theme.primary} bg={theme.primarySoft} />
        <Txt theme={theme} size={11} weight="700" center numberOfLines={2}>
          {label}
        </Txt>
      </Card>
    </Pressable>
  );
}

function Stat({ value, label, theme, accent }: { value: string; label: string; theme: ReturnType<typeof useThemed>; accent?: boolean }) {
  return (
    <Card theme={theme} style={{ flex: 1, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4, gap: 2 }}>
      <Txt theme={theme} size={16} weight="800" color={accent ? theme.gold : theme.text}>
        {value}
      </Txt>
      <Txt theme={theme} size={9.5} dim center numberOfLines={2}>
        {label}
      </Txt>
    </Card>
  );
}
