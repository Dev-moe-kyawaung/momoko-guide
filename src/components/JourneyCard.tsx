import React from 'react';
import { Pressable, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Card, CrowdDots, Tag, Txt } from './ui';
import { Theme } from '../theme';
import type { Journey, Lang } from '../types';
import { RAIL_LINES } from '../data/rail';
import { BUS_ROUTES } from '../data/bus';
import { t, nameOf } from '../i18n';
import { fmtMinutes } from '../lib/format';

export function JourneyCard({
  journey,
  theme,
  lang,
  onPress,
  recommend,
}: {
  journey: Journey;
  theme: Theme;
  lang: Lang;
  onPress?: () => void;
  recommend?: boolean;
}) {
  const objectiveKey = journey.objective === 'fastest' ? 'fastest' : journey.objective === 'cheapest' ? 'cheapest' : 'fewest';
  return (
    <Pressable onPress={onPress}>
      <Card theme={theme} elevated style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Txt theme={theme} size={20} weight="800">
              {fmtMinutes(journey.durationMin, lang)}
            </Txt>
            {recommend ? <Tag label={t('best', lang)} theme={theme} color={theme.primary} /> : null}
            <Tag label={t(objectiveKey, lang)} theme={theme} color={theme.accent} />
          </View>
          <CrowdDots level={journey.crowdingMax} theme={theme} />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Metric icon="cash" value={`฿${journey.fareThb}`} theme={theme} />
          <Metric icon="swap-horizontal" value={`${journey.transfers} ${t('transfers', lang)}`} theme={theme} />
          <Metric icon="walk" value={`${Math.round(journey.walkM)} m`} theme={theme} />
          <Metric icon="leaf" value={`${journey.co2Kg.toFixed(2)} kg`} theme={theme} />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          {journey.legs.map((leg, i) => {
            const color =
              leg.mode === 'walk'
                ? theme.walk
                : leg.mode === 'rail'
                ? RAIL_LINES.find((l) => l.id === leg.lineId)?.color ?? theme.accent
                : BUS_ROUTES.find((r) => r.id === leg.lineId)?.color ?? theme.bus;
            const icon = leg.mode === 'walk' ? 'walk' : leg.mode === 'rail' ? 'train' : leg.mode === 'boat' ? 'boat' : 'bus';
            const label =
              leg.mode === 'walk'
                ? `${Math.round(leg.minutes)}${t('minutesShort', lang)}`
                : leg.mode === 'rail'
                ? nameOf(RAIL_LINES.find((l) => l.id === leg.lineId), lang)
                : BUS_ROUTES.find((r) => r.id === leg.lineId)?.code ?? '';
            return (
              <React.Fragment key={`${leg.lineId ?? leg.mode}-${i}`}>
                {i > 0 ? <Ionicons name="chevron-forward" size={12} color={theme.textFaint} /> : null}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: `${color}22`, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 }}>
                  <Ionicons name={icon as any} size={11} color={color} />
                  <Txt theme={theme} size={11} weight="800" color={color} numberOfLines={1}>
                    {label}
                  </Txt>
                </View>
              </React.Fragment>
            );
          })}
        </View>
      </Card>
    </Pressable>
  );
}

function Metric({ icon, value, theme }: { icon: any; value: string; theme: Theme }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Ionicons name={icon} size={12} color={theme.textFaint} />
      <Txt theme={theme} size={12} weight="700" dim>
        {value}
      </Txt>
    </View>
  );
}
