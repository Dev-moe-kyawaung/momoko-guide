import React, { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemed } from '../themeContext';
import { useApp } from '../store';
import { nameOf, t } from '../i18n';
import { Card, Chip, CrowdDots, EmptyState, IconBadge, SectionHeader, Tag, Txt } from '../components/ui';
import { MapCanvas } from '../components/MapCanvas';
import { radius, spacing } from '../theme';
import { RAIL_LINES, STATIONS, directionInfo, headwayOf } from '../data/rail';
import { crowdingLabel, trainsForStation, useLiveVehicles } from '../lib/gtfs';
import { useNow } from '../lib/useNow';
import { fmtEta } from '../lib/format';
import { haversineM } from '../data/geo';
import { BUS_STOPS } from '../data/bus';
import { planJourneys } from '../lib/router';
import type { RootStackParamList } from '../nav/types';

type Props = NativeStackScreenProps<RootStackParamList, 'StationDetail'>;

const POPULAR = ['bts-siam', 'mrt-hualamphong', 'bts-asok', 'arl-suvarnabhumi', 'mrt-chatuchakpark', 'bts-saphantaksin'];

export default function StationDetailScreen({ route, navigation }: Props) {
  const theme = useThemed();
  const { settings, gps, isFavorite, toggleFavorite } = useApp();
  const lang = settings.lang;
  const { id } = route.params;
  const station = STATIONS.find((s) => s.id === id);
  const sec = useNow(1000) / 1000;

  const trains = useMemo(() => (station ? trainsForStation(station.id, sec) : []), [station, Math.floor(sec)]);
  const line = station ? RAIL_LINES.find((l) => l.id === station.lineId) : undefined;
  const info = station && line ? directionInfo(line.id, station.id) : null;
  const nearbyStops = useMemo(
    () =>
      station
        ? BUS_STOPS.map((b) => ({ b, m: haversineM(station.lat, station.lng, b.lat, b.lng) }))
            .filter((x) => x.m <= 450)
            .sort((a, b) => a.m - b.m)
            .slice(0, 3)
        : [],
    [station]
  );
  const fares = useMemo(
    () =>
      station
        ? POPULAR.filter((p) => p !== station.id)
            .map((destId) => {
              const j = planJourneys(station.id, destId)[0];
              return j ? { destId, journey: j } : null;
            })
            .filter((x): x is { destId: string; journey: NonNullable<ReturnType<typeof planJourneys>[number]> } => Boolean(x))
            .slice(0, 4)
        : [],
    [station]
  );

  if (!station || !line) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        <EmptyState theme={theme} icon="alert-circle-outline" title={t('noResults', lang)} />
      </View>
    );
  }

  const saved = isFavorite(station.id);

  return (
    <ScrollView style={{ backgroundColor: theme.bg }} contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
      {/* Header */}
      <Card theme={theme} elevated style={{ gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: line.color, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="train" size={20} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Txt theme={theme} size={19} weight="800">
              {nameOf(station, lang)}
            </Txt>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Txt theme={theme} size={11.5} dim>
                {station.code} · {nameOf(line, lang)} · {t('operator', lang)} {line.operator}
              </Txt>
            </View>
          </View>
          <Pressable onPress={() => toggleFavorite(station.id)} hitSlop={8}>
            <Ionicons name={saved ? 'star' : 'star-outline'} size={20} color={saved ? theme.gold : theme.textFaint} />
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          <Tag label={`${t('firstTrain', lang)} ${line.serviceStart}`} theme={theme} color={theme.accent} />
          <Tag label={`${t('lastTrain', lang)} ${line.serviceEnd}`} theme={theme} color={theme.danger} />
          <Tag label={`${headwayOf(line)} ${t('min', lang)} headway`} theme={theme} color={theme.textDim} />
        </View>
      </Card>

      {/* Next trains */}
      <View style={{ gap: spacing.sm }}>
        <SectionHeader title={t('nextTrains', lang)} theme={theme} icon="time" />
        {trains.map((tr, i) => {
          const trLine = RAIL_LINES.find((l) => l.id === tr.lineId)!;
          return (
            <Card key={i} theme={theme} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 4, alignSelf: 'stretch', borderRadius: 4, backgroundColor: trLine.color }} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Txt theme={theme} size={13.5} weight="800">
                    {nameOf(trLine, lang)}
                  </Txt>
                  <Tag label={tr.platform} theme={theme} color={theme.textDim} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                  <Ionicons name="arrow-forward" size={11} color={theme.textFaint} />
                  <Txt theme={theme} size={12} dim style={{ flex: 1 }} numberOfLines={1}>
                    {t('toward', lang)} {nameOf(tr.toward, lang)}
                  </Txt>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <CrowdDots level={tr.crowding} theme={theme} />
                  <Txt theme={theme} size={10.5} dim>
                    {t(crowdingLabel(tr.crowding), lang)}
                  </Txt>
                </View>
              </View>
              <Txt theme={theme} size={20} weight="800" color={theme.primary}>
                {fmtEta(tr.etaSec, lang)}
              </Txt>
            </Card>
          );
        })}
      </View>

      {/* Interchange guidance */}
      <View style={{ gap: spacing.sm }}>
        <SectionHeader title={t('interchangeGuide', lang)} theme={theme} icon="git-compare" />
        <Card theme={theme} style={{ gap: 8 }}>
          {['layers', 'call', 'exit'].map((icon, i) => {
            const labels = [t('platform', lang), 'Gate / Rabbit', t('exit', lang)];
            const values = [
              info ? `${trains[0]?.platform ?? 'Platform 1'} → ${nameOf(trains[0]?.toward ?? info.towardA, lang)}` : '-',
              'Tap in / tap out · EMV contactless',
              station.exits[i === 2 ? 0 : i + 1] ?? station.exits[0],
            ];
            return (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: theme.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name={icon as any} size={13} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Txt theme={theme} size={10.5} weight="800" dim>
                    {labels[i].toUpperCase()}
                  </Txt>
                  <Txt theme={theme} size={12.5} weight="600" numberOfLines={2}>
                    {values[i]}
                  </Txt>
                </View>
                {i < 2 ? <Ionicons name="arrow-down" size={13} color={theme.textFaint} /> : null}
              </View>
            );
          })}
        </Card>
      </View>

      {/* Line map */}
      <View style={{ gap: spacing.sm }}>
        <SectionHeader title={nameOf(line, lang)} theme={theme} icon="git-branch" />
        <View style={{ borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: theme.border }}>
          <MapCanvas height={190} theme={theme} selectedId={station.id} user={gps} dense showBus={false} showLandmarks={false} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.lg }}>
          {line.stations.map((sid) => {
            const s = STATIONS.find((x) => x.id === sid)!;
            const active = sid === station.id;
            return (
              <Pressable key={sid} onPress={() => navigation.push('StationDetail', { id: sid })}>
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: active ? line.color : theme.border,
                    backgroundColor: active ? `${line.color}22` : theme.cardAlt,
                  }}
                >
                  <Txt theme={theme} size={12} weight={active ? '800' : '600'} color={active ? theme.text : theme.textDim}>
                    {nameOf(s, lang)}
                  </Txt>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Bus connections */}
      {nearbyStops.length ? (
        <View style={{ gap: spacing.sm }}>
          <SectionHeader title={t('routesHere', lang)} theme={theme} icon="bus" />
          {nearbyStops.map(({ b, m }) => (
            <Pressable key={b.id} onPress={() => navigation.navigate('StopDetail', { id: b.id })}>
              <Card theme={theme} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11 }}>
                <IconBadge name="bus" color="#fff" bg={theme.bus} size={14} box={30} />
                <View style={{ flex: 1 }}>
                  <Txt theme={theme} size={13} weight="700" numberOfLines={1}>
                    {nameOf(b, lang)}
                  </Txt>
                  <Txt theme={theme} size={10.5} dim>
                    {Math.round(m)} m
                  </Txt>
                </View>
                <Ionicons name="chevron-forward" size={15} color={theme.textFaint} />
              </Card>
            </Pressable>
          ))}
        </View>
      ) : null}

      {/* Fare calculator */}
      <View style={{ gap: spacing.sm }}>
        <SectionHeader title={`${t('from', lang)} ${nameOf(station, lang)}`} theme={theme} icon="cash" />
        {fares.map(({ destId, journey }) => {
          const dest = STATIONS.find((s) => s.id === destId);
          return (
            <Pressable key={destId} onPress={() => navigation.navigate('Journey', { fromId: station.id, toId: destId })}>
              <Card theme={theme} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 }}>
                <View style={{ flex: 1 }}>
                  <Txt theme={theme} size={13} weight="700" numberOfLines={1}>
                    {nameOf(dest, lang)}
                  </Txt>
                  <Txt theme={theme} size={11} dim>
                    {Math.round(journey.durationMin)} {t('min', lang)} · {journey.transfers} {t('transfers', lang)}
                  </Txt>
                </View>
                <Txt theme={theme} size={16} weight="800" color={theme.gold}>
                  ฿{journey.fareThb}
                </Txt>
                <Ionicons name="chevron-forward" size={15} color={theme.textFaint} />
              </Card>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
