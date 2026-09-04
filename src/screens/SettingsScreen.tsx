import React from 'react';
import { Linking, Pressable, ScrollView, Switch, View, ViewStyle } from 'react-native';
import { useThemed } from '../themeContext';
import { useApp } from '../store';
import { GLOSSARY, LANGS, nameOf, t } from '../i18n';
import { Card, Chip, IconBadge, SectionHeader, Segmented, Txt } from '../components/ui';
import { radius, spacing } from '../theme';
import { NETWORK } from '../data/network';
import type { ThemeMode } from '../types';
import type { RootNav } from '../nav/types';

export default function SettingsScreen({ navigation }: { navigation: RootNav }) {
  const theme = useThemed();
  const { settings, updateSettings, history, favorites, clearHistory, clearFavorites } = useApp();
  const lang = settings.lang;
  const cacheGb = ((settings.offlineMode ? 1 : 0.4) * NETWORK.mapTileCacheGb).toFixed(1);

  return (
    <ScrollView style={{ backgroundColor: theme.bg }} contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xxl * 2 }}>
      <Txt theme={theme} size={22} weight="800">
        {t('tabSettings', lang)}
      </Txt>

      {/* Language */}
      <View style={{ gap: spacing.sm }}>
        <SectionHeader title={t('language', lang)} theme={theme} icon="language" />
        <Card theme={theme} style={{ gap: spacing.md }}>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {LANGS.map((l) => (
              <Chip key={l.id} label={`${l.flag} ${l.native}`} theme={theme} active={settings.lang === l.id} onPress={() => updateSettings({ lang: l.id })} />
            ))}
          </View>
          <Row
            theme={theme}
            label={t('autoDetectLabel', lang)}
            value={settings.autoDetect}
            onChange={(v) => updateSettings({ autoDetect: v })}
          />
        </Card>
      </View>

      {/* Appearance */}
      <View style={{ gap: spacing.sm }}>
        <SectionHeader title={t('appearance', lang)} theme={theme} icon="color-palette" />
        <Segmented<ThemeMode>
          theme={theme}
          value={settings.themeMode}
          onChange={(v) => updateSettings({ themeMode: v })}
          options={[
            { id: 'system', label: t('themeSystem', lang), icon: 'phone-portrait' },
            { id: 'light', label: t('themeLight', lang), icon: 'sunny' },
            { id: 'dark', label: t('themeDark', lang), icon: 'moon' },
          ]}
        />
      </View>

      {/* Accessibility */}
      <View style={{ gap: spacing.sm }}>
        <SectionHeader title={t('accessibility', lang)} theme={theme} icon="accessibility" />
        <Card theme={theme} style={{ gap: spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <Txt theme={theme} size={13} weight="700" style={{ flex: 1 }}>
              {t('fontScale', lang)}
            </Txt>
            <Pressable onPress={() => updateSettings({ fontScale: Math.max(0.85, Number((settings.fontScale - 0.1).toFixed(2))) })} style={[styles.stepper, { backgroundColor: theme.cardAlt, borderColor: theme.border }]}>
              <Txt theme={theme} size={18} weight="800">
                −
              </Txt>
            </Pressable>
            <Txt theme={theme} size={14} weight="800" style={{ minWidth: 44 }} center>
              {Math.round(settings.fontScale * 100)}%
            </Txt>
            <Pressable onPress={() => updateSettings({ fontScale: Math.min(1.6, Number((settings.fontScale + 0.1).toFixed(2))) })} style={[styles.stepper, { backgroundColor: theme.cardAlt, borderColor: theme.border }]}>
              <Txt theme={theme} size={18} weight="800">
                +
              </Txt>
            </Pressable>
          </View>
          <Txt theme={theme} size={12} dim>
            {t('boardNotice', lang)}
          </Txt>
          <Row theme={theme} label={t('highContrast', lang)} value={settings.highContrast} onChange={(v) => updateSettings({ highContrast: v })} />
          <Row theme={theme} label={t('reduceMotion', lang)} value={settings.reduceMotion} onChange={(v) => updateSettings({ reduceMotion: v })} />
        </Card>
      </View>

      {/* Data & offline */}
      <View style={{ gap: spacing.sm }}>
        <SectionHeader title={t('dataCache', lang)} theme={theme} icon="cloud-download" />
        <Card theme={theme} style={{ gap: spacing.md }}>
          <Row theme={theme} label={t('offlineMode', lang)} value={settings.offlineMode} onChange={(v) => updateSettings({ offlineMode: v })} />
          <Pressable onPress={() => navigation.navigate('Offline')}>
            <Card theme={theme} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, backgroundColor: theme.cardAlt }}>
              <IconBadge name="map" size={14} box={30} color={theme.primary} bg={theme.primarySoft} />
              <Txt theme={theme} size={13} weight="700" style={{ flex: 1 }}>
                {t('offlineTitle', lang)}
              </Txt>
              <Txt theme={theme} size={11.5} dim>
                {cacheGb} GB
              </Txt>
            </Card>
          </Pressable>
          <Pressable onPress={clearHistory}>
            <Txt theme={theme} size={13} weight="700" color={theme.danger}>
              {t('clearHistory', lang)} ({history.length})
            </Txt>
          </Pressable>
          <Pressable onPress={clearFavorites}>
            <Txt theme={theme} size={13} weight="700" color={theme.danger}>
              {t('clearFavorites', lang)} ({favorites.length})
            </Txt>
          </Pressable>
        </Card>
      </View>

      {/* Glossary */}
      <View style={{ gap: spacing.sm }}>
        <SectionHeader title={t('glossary', lang)} theme={theme} icon="book" />
        {GLOSSARY.map((g) => (
          <Card key={g.en} theme={theme} style={{ gap: 2, paddingVertical: 12 }}>
            <Txt theme={theme} size={13.5} weight="800">
              {nameOf(g, lang)}
            </Txt>
            <Txt theme={theme} size={11.5} dim>
              {g.note[lang]}
            </Txt>
          </Card>
        ))}
      </View>

      {/* Blueprint */}
      <View style={{ gap: spacing.sm }}>
        <SectionHeader title={t('systemDocs', lang)} theme={theme} icon="hardware-chip" />
        <Pressable onPress={() => navigation.navigate('Blueprint')}>
          <Card theme={theme} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14 }}>
            <IconBadge name="git-merge" size={15} box={32} color={theme.gold} bg={theme.dark ? 'rgba(245,196,81,0.14)' : 'rgba(245,196,81,0.2)'} />
            <View style={{ flex: 1 }}>
              <Txt theme={theme} size={13.5} weight="700">
                {t('blueprintTitle', lang)}
              </Txt>
              <Txt theme={theme} size={11} dim>
                {t('bpArchitecture', lang)} · {t('bpSchema', lang)} · {t('bpApi', lang)} · {t('bpTimeline', lang)}
              </Txt>
            </View>
          </Card>
        </Pressable>
      </View>

      {/* About */}
      <Card theme={theme} style={{ gap: 6 }}>
        <Txt theme={theme} size={14} weight="800">
          {t('appName', lang)} · v1.0.0
        </Txt>
        <Txt theme={theme} size={11.5} dim>
          GTFS static {NETWORK.gtfStaticVersion} · {NETWORK.gtfsRtFeedCount} realtime feeds · OSM tiles
        </Txt>
        <Txt theme={theme} size={12.5} weight="700" color={theme.primary}>
          {t('developer', lang)}
        </Txt>
        <Pressable onPress={() => Linking.openURL('https://github.com/Dev-moe-kyawaung/')} style={{ marginTop: 4 }}>
          <Txt theme={theme} size={12.5} weight="700" color={theme.accent}>
            github.com/Dev-moe-kyawaung
          </Txt>
        </Pressable>
      </Card>
    </ScrollView>
  );
}

function Row({ theme, label, value, onChange }: { theme: ReturnType<typeof useThemed>; label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      <Txt theme={theme} size={13} weight="700" style={{ flex: 1 }}>
        {label}
      </Txt>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: theme.primary, false: theme.dark ? '#243449' : '#C9D4E3'}}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

const styles: { stepper: ViewStyle } = {
  stepper: { width: 36, height: 36, borderRadius: radius.md, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
};
