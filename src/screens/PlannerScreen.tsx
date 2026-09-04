import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, TextInput, View, ViewStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemed } from '../themeContext';
import { useApp } from '../store';
import { nameOf, t } from '../i18n';
import { Button, Card, Chip, EmptyState, IconBadge, SectionHeader, Segmented, Txt } from '../components/ui';
import { JourneyCard } from '../components/JourneyCard';
import { radius, spacing } from '../theme';
import { findPlace, searchPlaces } from '../data/geo';
import { nearestStopIds, planJourneys, Objective } from '../lib/router';
import { GPS_FIXES } from '../data/geo';
import type { RootNav } from '../nav/types';
import { useMain } from '../nav/mainContext';
import { fmtMinutes } from '../lib/format';

export default function PlannerScreen({ navigation }: { navigation: RootNav }) {
  const theme = useThemed();
  const { settings, gps, history, pushHistory } = useApp();
  const lang = settings.lang;
  const { draft, setDraft } = useMain();

  const [fromId, setFromId] = useState<string | undefined>(draft.fromId);
  const [toId, setToId] = useState<string | undefined>(draft.toId);
  const [objective, setObjective] = useState<Objective>('fastest');
  const [focus, setFocus] = useState<'from' | 'to'>('to');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (draft.fromId) setFromId(draft.fromId);
    if (draft.toId) setToId(draft.toId);
  }, [draft]);

  const results = useMemo(() => (fromId && toId ? planJourneys(fromId, toId) : []), [fromId, toId]);

  const sorted = useMemo(() => {
    const copy = [...results];
    if (objective === 'cheapest') copy.sort((a, b) => a.fareThb - b.fareThb || a.durationMin - b.durationMin);
    else if (objective === 'fewest') copy.sort((a, b) => a.transfers - b.transfers || a.durationMin - b.durationMin);
    else copy.sort((a, b) => a.durationMin - b.durationMin);
    return copy;
  }, [results, objective]);

  const suggestions = query.trim().length > 0 ? searchPlaces(query, 5) : [];
  const fromPlace = fromId ? findPlace(fromId) : undefined;
  const toPlace = toId ? findPlace(toId) : undefined;

  const pick = (id: string) => {
    if (focus === 'from') setFromId(id);
    else setToId(id);
    setQuery('');
    setFocus(focus === 'from' ? 'to' : 'from');
  };

  const openJourney = (from: string, to: string) => {
    pushHistory({ fromId: from, toId: to, durationMin: 0, fareThb: 0 });
    navigation.navigate('Journey', { fromId: from, toId: to });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl * 2 }}
        ListHeaderComponent={
          <View style={{ gap: spacing.md }}>
            <Txt theme={theme} size={22} weight="800">
              {t('planTrip', lang)}
            </Txt>
            <Txt theme={theme} size={12} dim>
              {t('plannerHint', lang)}
            </Txt>

            {/* From / To */}
            <Card theme={theme} elevated style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 10, alignItems: 'center' }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.primary }} />
                  <View style={{ width: 1.5, height: 22, backgroundColor: theme.border }} />
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.danger }} />
                </View>
                <View style={{ flex: 1, gap: 8 }}>
                  <Pressable
                    onPress={() => {
                      setFocus('from');
                      setQuery('');
                    }}
                    style={[styles.field, { backgroundColor: theme.cardAlt, borderColor: focus === 'from' ? theme.primary : theme.border }]}
                  >
                    <Txt theme={theme} size={10.5} weight="800" dim>
                      {t('from', lang).toUpperCase()}
                    </Txt>
                    <Txt theme={theme} size={14} weight="700" numberOfLines={1} color={fromPlace ? theme.text : theme.textFaint}>
                      {fromPlace ? nameOf(fromPlace, lang) : t('searchPlaceholder', lang)}
                    </Txt>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setFocus('to');
                      setQuery('');
                    }}
                    style={[styles.field, { backgroundColor: theme.cardAlt, borderColor: focus === 'to' ? theme.primary : theme.border }]}
                  >
                    <Txt theme={theme} size={10.5} weight="800" dim>
                      {t('to', lang).toUpperCase()}
                    </Txt>
                    <Txt theme={theme} size={14} weight="700" numberOfLines={1} color={toPlace ? theme.text : theme.textFaint}>
                      {toPlace ? nameOf(toPlace, lang) : t('searchPlaceholder', lang)}
                    </Txt>
                  </Pressable>
                </View>
                <Pressable
                  onPress={() => {
                    setFromId(toId);
                    setToId(fromId);
                  }}
                  style={[styles.swap, { backgroundColor: theme.cardAlt, borderColor: theme.border }]}
                >
                  <Ionicons name="swap-vertical" size={18} color={theme.primary} />
                </Pressable>
              </View>

              <TextInput
                value={query}
                onChangeText={setQuery}
                onFocus={() => undefined}
                placeholder={t('searchPlaceholder', lang)}
                placeholderTextColor={theme.textFaint}
                style={[styles.input, { color: theme.text, backgroundColor: theme.cardAlt, borderColor: theme.border, fontSize: 14 * settings.fontScale }]}
                returnKeyType="search"
                autoCorrect={false}
              />

              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <Chip
                  label={t('currentLocation', lang)}
                  theme={theme}
                  icon="locate"
                  onPress={() => {
                    const fix = GPS_FIXES[Math.floor(Math.random() * GPS_FIXES.length)];
                    const near = nearestStopIds(fix.lat, fix.lng, ['station', 'stop'], 1);
                    setFromId(near[0]?.id ?? 'bts-siam');
                  }}
                />
                <Chip
                  label={t('clear', lang)}
                  theme={theme}
                  icon="close"
                  onPress={() => {
                    setFromId(undefined);
                    setToId(undefined);
                  }}
                />
              </View>

              {suggestions.length ? (
                <View style={{ gap: 2 }}>
                  {suggestions.map((p) => (
                    <Pressable key={p.id} onPress={() => pick(p.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 9, paddingHorizontal: 6 }}>
                      <IconBadge
                        name={p.kind === 'station' ? 'train' : p.kind === 'landmark' ? 'business' : 'bus'}
                        size={13}
                        box={26}
                        color="#fff"
                        bg={p.kind === 'station' ? theme.mrt : p.kind === 'landmark' ? theme.gold : theme.bus}
                      />
                      <View style={{ flex: 1 }}>
                        <Txt theme={theme} size={13} weight="700" numberOfLines={1}>
                          {nameOf(p, lang)}
                        </Txt>
                        <Txt theme={theme} size={10.5} dim>
                          {p.lat.toFixed(4)}, {p.lng.toFixed(4)}
                        </Txt>
                      </View>
                      <Ionicons name="chevron-forward" size={15} color={theme.textFaint} />
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </Card>

            <Segmented<Objective>
              theme={theme}
              value={objective}
              onChange={setObjective}
              options={[
                { id: 'fastest', label: t('fastest', lang), icon: 'flash' },
                { id: 'cheapest', label: t('cheapest', lang), icon: 'cash' },
                { id: 'fewest', label: t('fewest', lang), icon: 'swap-horizontal' },
              ]}
            />

            {sorted.length ? (
              <SectionHeader title={t('journeyTitle', lang)} theme={theme} icon="git-branch" />
            ) : null}
          </View>
        }
        data={sorted}
        keyExtractor={(j) => j.id}
        ListEmptyComponent={
          history.length && !fromId && !toId ? (
            <View style={{ gap: spacing.sm }}>
              <SectionHeader title={t('recentJourneys', lang)} theme={theme} icon="time-outline" />
              {history.map((h) => {
                const a = findPlace(h.fromId);
                const b = findPlace(h.toId);
                return (
                  <Pressable key={h.id} onPress={() => openJourney(h.fromId, h.toId)}>
                    <Card theme={theme} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 }}>
                      <IconBadge name="time" size={14} box={28} color={theme.primary} bg={theme.primarySoft} />
                      <View style={{ flex: 1 }}>
                        <Txt theme={theme} size={13} weight="700" numberOfLines={1}>
                          {nameOf(a, lang)} → {nameOf(b, lang)}
                        </Txt>
                        <Txt theme={theme} size={11} dim>
                          {fmtMinutes(h.durationMin, lang)} · ฿{h.fareThb}
                        </Txt>
                      </View>
                      <Ionicons name="chevron-forward" size={15} color={theme.textFaint} />
                    </Card>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <EmptyState theme={theme} icon="git-branch-outline" title={t('noResults', lang)} body={t('plannerHint', lang)} />
          )
        }
        renderItem={({ item, index }) => (
          <View style={{ marginBottom: spacing.sm }}>
            <JourneyCard journey={item} theme={theme} lang={lang} recommend={index === 0} onPress={() => openJourney(fromId!, toId!)} />
          </View>
        )}
      />
    </KeyboardAvoidingView>
  );
}

const styles: Record<string, ViewStyle> = {
  field: { borderRadius: radius.md, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8, gap: 1 },
  input: { borderRadius: radius.md, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  swap: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
};
