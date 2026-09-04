import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View, ViewStyle } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemed } from '../themeContext';
import { useApp } from '../store';
import { nameOf, t } from '../i18n';
import { Card, Chip, CrowdDots, EmptyState, IconBadge, SectionHeader, Tag, Txt } from '../components/ui';
import { radius, spacing } from '../theme';
import { journeySteps, planJourneys } from '../lib/router';
import { RAIL_LINES } from '../data/rail';
import { BUS_ROUTES } from '../data/bus';
import { arrivalsForStop, useLiveVehicles } from '../lib/gtfs';
import { useNow } from '../lib/useNow';
import { fmtEta, fmtMinutes } from '../lib/format';
import type { Lang } from '../types';
import type { RootStackParamList } from '../nav/types';
import { PAYMENT_NOTE } from '../lib/fare';

type Props = NativeStackScreenProps<RootStackParamList, 'Journey'>;

export default function JourneyScreen({ route, navigation }: Props) {
  const theme = useThemed();
  const { settings, pushHistory, favorites, toggleFavorite } = useApp();
  const lang = settings.lang;
  const { fromId, toId } = route.params;
  const vehicles = useLiveVehicles();
  const sec = useNow(1000) / 1000;

  const journeys = useMemo(() => planJourneys(fromId, toId), [fromId, toId]);
  const [idx, setIdx] = useState(0);
  const [allLangs, setAllLangs] = useState(false);
  const journey = journeys[Math.min(idx, journeys.length - 1)];
  const steps = journey ? journeySteps(journey) : [];
  const saved = journey ? favorites.includes(journey.id) : false;

  React.useEffect(() => {
    if (journey) pushHistory({ fromId, toId, durationMin: Math.round(journey.durationMin), fareThb: journey.fareThb });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromId, toId]);

  if (!journey) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg, padding: spacing.lg }}>
        <EmptyState theme={theme} icon="alert-circle-outline" title={t('noResults', lang)} />
      </View>
    );
  }

  const startName = journey.legs[0]?.from;
  const endName = journey.legs[journey.legs.length - 1]?.to;
  const depart = new Date();
  const arrive = new Date(Date.now() + journey.durationMin * 60000);

  return (
    <ScrollView style={{ backgroundColor: theme.bg }} contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
      {/* Summary */}
      <Card theme={theme} elevated style={{ gap: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name="navigate" size={16} color={theme.primary} />
          <Txt theme={theme} size={16} weight="800" style={{ flex: 1 }} numberOfLines={1}>
            {nameOf(startName, lang)} → {nameOf(endName, lang)}
          </Txt>
          <Pressable onPress={() => toggleFavorite(journey.id)} hitSlop={8}>
            <Ionicons name={saved ? 'star' : 'star-outline'} size={18} color={saved ? theme.gold : theme.textFaint} />
          </Pressable>
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
          {journeys.map((j, i) => (
            <Chip
              key={j.id}
              label={`${fmtMinutes(j.durationMin, lang)} · ฿${j.fareThb}`}
              theme={theme}
              active={i === idx}
              onPress={() => setIdx(i)}
            />
          ))}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <KV label={t('depart', lang)} value={`${fmtClockOf(depart)}`} theme={theme} />
          <KV label={t('arrive', lang)} value={`${fmtClockOf(arrive)}`} theme={theme} accent />
          <KV label={t('crowd', lang)} value="" theme={theme} dots={journey.crowdingMax} />
          <KV label={t('co2', lang)} value={`${journey.co2Kg.toFixed(2)} kg`} theme={theme} />
        </View>
        <Txt theme={theme} size={10.5} dim>
          {PAYMENT_NOTE[lang]}
        </Txt>
      </Card>

      {/* Timeline */}
      <View style={{ gap: spacing.sm }}>
        <SectionHeader title={t('stepByStep', lang)} theme={theme} icon="list" />
        {journey.legs.map((leg, i) => {
          const last = i === journey.legs.length - 1;
          const color =
            leg.mode === 'walk'
              ? theme.walk
              : leg.mode === 'rail'
              ? RAIL_LINES.find((l) => l.id === leg.lineId)?.color ?? theme.accent
              : BUS_ROUTES.find((r) => r.id === leg.lineId)?.color ?? theme.bus;
          const icon = leg.mode === 'walk' ? 'walk' : leg.mode === 'rail' ? 'train' : leg.mode === 'boat' ? 'boat' : 'bus';
          const line = leg.lineId ? RAIL_LINES.find((l) => l.id === leg.lineId) : undefined;
          const route = leg.lineId ? BUS_ROUTES.find((r) => r.id === leg.lineId) : undefined;
          const live = leg.mode === 'bus' || leg.mode === 'boat' ? liveEta(leg.from.id, leg.lineId ?? '', vehicles, sec, lang) : null;

          return (
            <View key={i} style={{ flexDirection: 'row', gap: spacing.md }}>
              <View style={{ width: 42, alignItems: 'center' }}>
                <IconBadge name={icon} color="#fff" bg={color} size={17} box={36} />
                {!last ? <View style={{ flex: 1, width: 2, backgroundColor: theme.border, marginVertical: 4, minHeight: 26 }} /> : null}
              </View>
              <Card theme={theme} style={{ flex: 1, gap: 8, marginBottom: last ? 0 : spacing.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Txt theme={theme} size={14.5} weight="800">
                    {nameOf(leg.from, lang)}
                  </Txt>
                  <Ionicons name="arrow-forward" size={12} color={theme.textFaint} />
                  <Txt theme={theme} size={14.5} weight="800">
                    {nameOf(leg.to, lang)}
                  </Txt>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Tag label={`${Math.max(1, Math.round(leg.minutes))} ${t('min', lang)}`} theme={theme} color={color} />
                  {leg.mode === 'walk' ? <Tag label={`${Math.round(leg.distanceM)} m`} theme={theme} color={theme.textDim} /> : null}
                  {route ? <Tag label={route.code} theme={theme} color={route.color} /> : null}
                  {line ? <Tag label={nameOf(line, lang)} theme={theme} color={line.color} /> : null}
                  {leg.fareThb > 0 ? <Tag label={`฿${Math.round(leg.fareThb)}`} theme={theme} color={theme.gold} /> : null}
                  {live ? <Tag label={live} theme={theme} color={theme.primary} /> : null}
                </View>

                {leg.mode === 'rail' ? (
                  <View style={{ gap: 4 }}>
                    <Row icon="arrow-up" text={`${t('toward', lang)} ${nameOf(leg.toward, lang)}`} theme={theme} />
                    <Row icon="layers" text={`${t('platform', lang)}: ${leg.platform ?? '-'}`} theme={theme} />
                    {leg.exit ? <Row icon="exit" text={`${t('exit', lang)}: ${leg.exit}`} theme={theme} /> : null}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Txt theme={theme} size={11} dim>
                        {t('crowd', lang)}:
                      </Txt>
                      <CrowdDots level={leg.crowding} theme={theme} />
                    </View>
                  </View>
                ) : null}

                {leg.mode === 'bus' || leg.mode === 'boat' ? (
                  <View style={{ gap: 4 }}>
                    <Txt theme={theme} size={11.5} dim numberOfLines={2}>
                      {nameOf(route, lang)}
                    </Txt>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Txt theme={theme} size={11} dim>
                        {t('crowd', lang)}:
                      </Txt>
                      <CrowdDots level={leg.crowding} theme={theme} />
                    </View>
                  </View>
                ) : null}
              </Card>
            </View>
          );
        })}
      </View>

      {/* Multilingual explanation */}
      <View style={{ gap: spacing.sm }}>
        <SectionHeader title={t('explainAll', lang)} theme={theme} icon="language" />
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Chip label="EN" theme={theme} active={!allLangs && lang === 'en'} onPress={() => setAllLangs(false)} />
          <Chip label="TH" theme={theme} active={!allLangs && lang === 'th'} onPress={() => setAllLangs(false)} />
          <Chip label="MY" theme={theme} active={!allLangs && lang === 'my'} onPress={() => setAllLangs(false)} />
          <Chip label="3 ภาษา" theme={theme} active={allLangs} onPress={() => setAllLangs(true)} icon="language" />
        </View>
        <Card theme={theme} style={{ gap: 10 }}>
          {steps.map((s, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 10 }}>
              <View style={[styles.stepNum, { backgroundColor: theme.primarySoft }]}>
                <Txt theme={theme} size={11} weight="800" color={theme.primary}>
                  {i + 1}
                </Txt>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Txt theme={theme} size={12.5} weight="600">
                  {s[lang]}
                </Txt>
                {allLangs ? (
                  <>
                    {(['th', 'my', 'en'] as Lang[])
                      .filter((l) => l !== lang)
                      .map((l) => (
                        <Txt key={l} theme={theme} size={11.5} dim>
                          {l.toUpperCase()}: {s[l]}
                        </Txt>
                      ))}
                  </>
                ) : null}
              </View>
            </View>
          ))}
        </Card>
      </View>
    </ScrollView>
  );
}

function liveEta(
  stopId: string,
  routeId: string,
  vehicles: ReturnType<typeof useLiveVehicles>,
  sec: number,
  lang: Lang
): string | null {
  if (!stopId.startsWith('stop-')) return null;
  const arrivals = arrivalsForStop(stopId, vehicles, sec).filter((a) => a.routeId === routeId && a.realtime);
  if (!arrivals.length) return null;
  return `${t('realtimeEta', lang)} ${fmtEta(arrivals[0].etaSec, lang)}`;
}

function KV({ label, value, theme, accent, dots }: { label: string; value: string; theme: ReturnType<typeof useThemed>; accent?: boolean; dots?: any }) {
  return (
    <View style={{ alignItems: 'center', gap: 3 }}>
      <Txt theme={theme} size={10} weight="700" dim>
        {label}
      </Txt>
      {dots ? <CrowdDots level={dots} theme={theme} /> : (
        <Txt theme={theme} size={13} weight="800" color={accent ? theme.primary : theme.text}>
          {value}
        </Txt>
      )}
    </View>
  );
}

function Row({ icon, text, theme }: { icon: any; text: string; theme: ReturnType<typeof useThemed> }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Ionicons name={icon} size={11} color={theme.textFaint} />
      <Txt theme={theme} size={11.5} dim>
        {text}
      </Txt>
    </View>
  );
}

function fmtClockOf(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

const styles: { stepNum: ViewStyle } = {
  stepNum: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
};
