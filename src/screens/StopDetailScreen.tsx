import React, { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemed } from '../themeContext';
import { useApp } from '../store';
import { nameOf, t } from '../i18n';
import { Card, CrowdDots, EmptyState, IconBadge, SectionHeader, Tag, Txt } from '../components/ui';
import { MapCanvas } from '../components/MapCanvas';
import { CATEGORY_COLOR, CATEGORY_ICON, LANDMARKS } from '../data/landmarks';
import { busStopById, routesServing } from '../data/bus';
import { STATIONS } from '../data/rail';
import { arrivalsForStop, crowdingLabel, useLiveVehicles } from '../lib/gtfs';
import { useNow } from '../lib/useNow';
import { fmtEta, fmtWalkMinutes } from '../lib/format';
import { haversineM } from '../data/geo';
import type { RootStackParamList } from '../nav/types';
import { radius, spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'StopDetail'>;

export default function StopDetailScreen({ route, navigation }: Props) {
  const theme = useThemed();
  const { settings, gps, isFavorite, toggleFavorite } = useApp();
  const lang = settings.lang;
  const { id } = route.params;
  const stop = busStopById(id);
  const vehicles = useLiveVehicles();
  const sec = useNow(1000) / 1000;

  const arrivals = useMemo(() => (stop ? arrivalsForStop(stop.id, vehicles, sec) : []), [stop, vehicles, Math.floor(sec)]);
  const landmarks = useMemo(
    () =>
      stop
        ? LANDMARKS.map((l) => ({ l, m: haversineM(stop.lat, stop.lng, l.lat, l.lng) }))
            .filter((x) => x.m <= 700)
            .sort((a, b) => a.m - b.m)
            .slice(0, 8)
        : [],
    [stop]
  );
  const transfers = useMemo(
    () =>
      stop
        ? STATIONS.map((s) => ({ s, m: haversineM(stop.lat, stop.lng, s.lat, s.lng) }))
            .filter((x) => x.m <= 600)
            .sort((a, b) => a.m - b.m)
            .slice(0, 3)
        : [],
    [stop]
  );

  if (!stop) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        <EmptyState theme={theme} icon="alert-circle-outline" title={t('noResults', lang)} />
      </View>
    );
  }

  const routes = routesServing(stop.id);
  const smartLabel =
    stop.smart === 'digital' ? t('smartDigital', lang) : stop.smart === 'renovated' ? t('smartRenovated', lang) : t('smartClassic', lang);
  const saved = isFavorite(stop.id);

  return (
    <ScrollView style={{ backgroundColor: theme.bg }} contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
      {/* Header */}
      <Card theme={theme} elevated style={{ gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <IconBadge name="bus" color="#fff" bg={theme.bus} />
          <View style={{ flex: 1 }}>
            <Txt theme={theme} size={19} weight="800">
              {nameOf(stop, lang)}
            </Txt>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Txt theme={theme} size={11.5} dim>
                GTFS stop_id {stop.code} · {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
              </Txt>
            </View>
          </View>
          <Pressable onPress={() => toggleFavorite(stop.id)} hitSlop={8}>
            <Ionicons name={saved ? 'star' : 'star-outline'} size={20} color={saved ? theme.gold : theme.textFaint} />
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          <Tag label={smartLabel} theme={theme} color={theme.gold} />
          {stop.shelter ? <Tag label=" Shelter" theme={theme} color={theme.accent} /> : null}
          {routes.map((r) => (
            <Tag key={r.id} label={r.code} theme={theme} color={r.color} />
          ))}
        </View>
      </Card>

      {/* Arrivals */}
      <View style={{ gap: spacing.sm }}>
        <SectionHeader title={t('arrivals', lang)} theme={theme} icon="time" />
        {arrivals.length === 0 ? (
          <EmptyState theme={theme} icon="time-outline" title={t('noArrivals', lang)} />
        ) : (
          arrivals.map((a, i) => {
            const route = routes.find((r) => r.id === a.routeId);
            return (
              <Card key={i} theme={theme} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 4, alignSelf: 'stretch', borderRadius: 4, backgroundColor: route?.color ?? theme.bus }} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Txt theme={theme} size={15} weight="800">
                      {route?.code}
                    </Txt>
                    {route?.fuel === 'electric' ? <Tag label="EV" theme={theme} color="#22B07D" /> : null}
                    {!a.realtime ? <Tag label="SCHED" theme={theme} color={theme.textFaint} /> : null}
                  </View>
                  <Txt theme={theme} size={12} dim numberOfLines={1}>
                    {nameOf(a.dest, lang)}
                  </Txt>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <CrowdDots level={a.crowding} theme={theme} />
                    <Txt theme={theme} size={10.5} dim>
                      {t(crowdingLabel(a.crowding), lang)}
                    </Txt>
                  </View>
                </View>
                <Txt theme={theme} size={18} weight="800" color={theme.primary}>
                  {fmtEta(a.etaSec, lang)}
                </Txt>
              </Card>
            );
          })
        )}
      </View>

      {/* Digital board CTA */}
      {stop.smart === 'digital' ? (
        <Pressable onPress={() => navigation.navigate('SmartBoard', { id: stop.id })}>
          <Card theme={theme} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.dark ? '#0A0F1A' : '#101828' }}>
            <IconBadge name="tv" color="#0A0F1A" bg={theme.gold} />
            <View style={{ flex: 1 }}>
              <Txt theme={theme} size={14} weight="800" color="#FFFFFF">
                {t('openBoard', lang)}
              </Txt>
              <Txt theme={theme} size={11} color="#B9C6DA">
                {t('boardPowered', lang)}
              </Txt>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.gold} />
          </Card>
        </Pressable>
      ) : null}

      {/* Walking map */}
      <View style={{ gap: spacing.sm }}>
        <SectionHeader title={t('walkingMap', lang)} theme={theme} icon="footsteps" />
        <View style={{ borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: theme.border }}>
          <MapCanvas height={200} theme={theme} user={gps} selectedId={stop.id} dense showBus={false} showLandmarks />
        </View>
      </View>

      {/* Landmarks */}
      <View style={{ gap: spacing.sm }}>
        <SectionHeader title={`${t('landmarksNearby', lang)} · ${landmarks.length}`} theme={theme} icon="business" />
        {landmarks.map(({ l, m }) => (
          <Card key={l.id} theme={theme} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11 }}>
            <IconBadge name={CATEGORY_ICON[l.category]} color="#fff" bg={CATEGORY_COLOR[l.category]} size={14} box={30} />
            <View style={{ flex: 1 }}>
              <Txt theme={theme} size={13} weight="700" numberOfLines={1}>
                {nameOf(l, lang)}
              </Txt>
              <Txt theme={theme} size={10.5} dim>
                {Math.round(m)} m · {fmtWalkMinutes(m, lang)}
              </Txt>
            </View>
            <Ionicons name="walk" size={14} color={theme.textFaint} />
          </Card>
        ))}
      </View>

      {/* Transfer options */}
      {transfers.length ? (
        <View style={{ gap: spacing.sm }}>
          <SectionHeader title={t('transfer', lang)} theme={theme} icon="git-compare" />
          {transfers.map(({ s, m }) => (
            <Pressable key={s.id} onPress={() => navigation.navigate('StationDetail', { id: s.id })}>
              <Card theme={theme} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11 }}>
                <IconBadge name="train" color="#fff" bg={theme.mrt} size={14} box={30} />
                <View style={{ flex: 1 }}>
                  <Txt theme={theme} size={13} weight="700" numberOfLines={1}>
                    {nameOf(s, lang)}
                  </Txt>
                  <Txt theme={theme} size={10.5} dim>
                    {Math.round(m)} m · {fmtWalkMinutes(m, lang)}
                  </Txt>
                </View>
                <Ionicons name="chevron-forward" size={15} color={theme.textFaint} />
              </Card>
            </Pressable>
          ))}
        </View>
      ) : null}

      {/* Routes detail */}
      <View style={{ gap: spacing.sm }}>
        <SectionHeader title={t('routesHere', lang)} theme={theme} icon="bus" />
        {routes.map((r) => (
          <Card key={r.id} theme={theme} style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: r.color, alignItems: 'center', justifyContent: 'center' }}>
                <Txt theme={theme} size={11} weight="800" color="#fff">
                  {r.code}
                </Txt>
              </View>
              <Txt theme={theme} size={12.5} weight="700" style={{ flex: 1 }} numberOfLines={2}>
                {nameOf(r, lang)}
              </Txt>
              <Tag label={`฿${r.fareThb}`} theme={theme} color={theme.gold} />
            </View>
            <Txt theme={theme} size={11} dim>
              {r.headwayPeakMin} {t('min', lang)} headway · {r.fuel === 'electric' ? 'EV zero-emission' : r.fuel === 'n/a' ? 'water route' : 'BMTA diesel'} · {r.fareNote}
            </Txt>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}
