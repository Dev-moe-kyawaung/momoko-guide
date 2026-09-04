import React, { useState } from 'react';
import { Pressable, ScrollView, Switch, View } from 'react-native';
import { useThemed } from '../themeContext';
import { useApp } from '../store';
import { t } from '../i18n';
import { Card, Chip, IconBadge, SectionHeader, Tag, Txt } from '../components/ui';
import { radius, spacing } from '../theme';
import { NETWORK } from '../data/network';
import { GTFS_META } from '../lib/gtfs';
import { fmtClock } from '../lib/format';

const TILE_PACKS = [
  { id: 'bangkok-core', en: 'Bangkok core (Silom–Sukhumvit–Old Town)', gb: 0.42 },
  { id: 'north', en: 'North: Mo Chit · Lak Si · Don Mueang · Pak Kret', gb: 0.28 },
  { id: 'east', en: 'East: Bang Na · Samrong · Lat Krabang', gb: 0.31 },
  { id: 'west', en: 'West bank: Thonburi · Bang Wa · Taling Chan', gb: 0.26 },
  { id: 'nonthaburi', en: 'Nonthaburi · Pathum Thani (Purple line)', gb: 0.33 },
  { id: 'river', en: 'Chao Phraya river corridor (piers)', gb: 0.12 },
];

export default function OfflineScreen() {
  const theme = useThemed();
  const { settings, updateSettings } = useApp();
  const lang = settings.lang;
  const [syncedAt, setSyncedAt] = useState(() => new Date(Date.now() - 3600_000 * 5));
  const [syncing, setSyncing] = useState(false);
  const totalGb = TILE_PACKS.reduce((s, p) => s + p.gb, 0);

  const refresh = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setSyncedAt(new Date());
    }, 1400);
  };

  return (
    <ScrollView style={{ backgroundColor: theme.bg }} contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
      <View style={{ gap: 6 }}>
        <Txt theme={theme} size={21} weight="800">
          {t('offlineTitle', lang)}
        </Txt>
        <Txt theme={theme} size={12.5} dim>
          {t('offlineDesc', lang)}
        </Txt>
      </View>

      <Card theme={theme} elevated style={{ gap: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <IconBadge name="cloud-offline" size={16} box={34} color={settings.offlineMode ? theme.gold : theme.textDim} bg={theme.cardAlt} />
          <View style={{ flex: 1 }}>
            <Txt theme={theme} size={14} weight="800">
              {t('offlineMode', lang)}
            </Txt>
            <Txt theme={theme} size={11} dim>
              {settings.offlineMode ? t('realtimeOff', lang) : `${t('liveNow', lang)} · GTFS-RT ${GTFS_META.realtimeFeeds} feeds`}
            </Txt>
          </View>
          <Switch
            value={settings.offlineMode}
            onValueChange={(v) => updateSettings({ offlineMode: v })}
            trackColor={{ true: theme.primary, false: theme.dark ? '#243449' : '#C9D4E3' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </Card>

      <View style={{ gap: spacing.sm }}>
        <SectionHeader title={t('districtTiles', lang)} theme={theme} icon="layers" actionLabel={t('downloadAll', lang)} onAction={refresh} />
        {TILE_PACKS.map((p) => (
          <Card key={p.id} theme={theme} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 }}>
            <IconBadge name="grid" size={14} box={30} color={theme.primary} bg={theme.primarySoft} />
            <View style={{ flex: 1 }}>
              <Txt theme={theme} size={13} weight="700" numberOfLines={2}>
                {p.en}
              </Txt>
              <Txt theme={theme} size={11} dim>
                {p.gb.toFixed(2)} GB · vector + raster
              </Txt>
            </View>
            <Tag label={syncing ? '…' : 'READY'} theme={theme} color={syncing ? theme.gold : theme.primary} />
          </Card>
        ))}
        <Card theme={theme} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Txt theme={theme} size={13} weight="700" style={{ flex: 1 }}>
            {t('cachedTiles', lang)}
          </Txt>
          <Txt theme={theme} size={14} weight="800" color={theme.primary}>
            {totalGb.toFixed(2)} GB
          </Txt>
        </Card>
      </View>

      <View style={{ gap: spacing.sm }}>
        <SectionHeader title="GTFS" theme={theme} icon="document-text" />
        <Card theme={theme} style={{ gap: 8 }}>
          <Line label={t('gtfsVersion', lang)} value={GTFS_META.staticVersion} theme={theme} />
          <Line label={t('routesHere', lang)} value={String(GTFS_META.routes)} theme={theme} />
          <Line label={t('stopsWord', lang)} value={GTFS_META.stops.toLocaleString()} theme={theme} />
          <Line label={t('lastSync', lang)} value={fmtClock(syncedAt)} theme={theme} />
        </Card>
        <Pressable onPress={refresh}>
          <Card theme={theme} style={{ alignItems: 'center', paddingVertical: 14 }}>
            <Txt theme={theme} size={13.5} weight="800" color={theme.primary}>
              {syncing ? t('loading', lang) : t('downloadAll', lang)}
            </Txt>
          </Card>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Line({ label, value, theme }: { label: string; value: string; theme: ReturnType<typeof useThemed> }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Txt theme={theme} size={12.5} dim style={{ flex: 1 }}>
        {label}
      </Txt>
      <Txt theme={theme} size={12.5} weight="800">
        {value}
      </Txt>
    </View>
  );
}
