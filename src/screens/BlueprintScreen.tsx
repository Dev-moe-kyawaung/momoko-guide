import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useThemed } from '../themeContext';
import { useApp } from '../store';
import { nameOf, t } from '../i18n';
import { Card, SectionHeader, Segmented, Txt } from '../components/ui';
import { spacing } from '../theme';
import { API_ENDPOINTS, ARCHITECTURE_DIAGRAM, DATAFLOW_DIAGRAM, DB_SCHEMA_SQL, GTFS_SAMPLE, SMART_STOP_LOGIC } from '../data/blueprint';
import { DEV_TIMELINE } from '../data/network';

type Tab = 'architecture' | 'db' | 'api' | 'roadmap';

export default function BlueprintScreen() {
  const theme = useThemed();
  const { settings } = useApp();
  const lang = settings.lang;
  const [tab, setTab] = useState<Tab>('architecture');

  return (
    <ScrollView style={{ backgroundColor: theme.bg }} contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
      <Txt theme={theme} size={21} weight="800">
        {t('blueprintTitle', lang)}
      </Txt>

      <Segmented<Tab>
        theme={theme}
        value={tab}
        onChange={setTab}
        options={[
          { id: 'architecture', label: t('bpArchitecture', lang), icon: 'git-network' },
          { id: 'db', label: t('bpSchema', lang), icon: 'server' },
          { id: 'api', label: t('bpApi', lang), icon: 'code-slash' },
          { id: 'roadmap', label: t('bpTimeline', lang), icon: 'calendar' },
        ]}
      />

      {tab === 'architecture' ? (
        <View style={{ gap: spacing.md }}>
          <Code text={ARCHITECTURE_DIAGRAM} theme={theme} />
          <SectionHeader title="Data flow" theme={theme} icon="swap-horizontal" />
          <Code text={DATAFLOW_DIAGRAM} theme={theme} />
          <SectionHeader title="Smart Stop logic" theme={theme} icon="tv" />
          <Code text={SMART_STOP_LOGIC} theme={theme} />
        </View>
      ) : null}

      {tab === 'db' ? (
        <View style={{ gap: spacing.md }}>
          <Txt theme={theme} size={12} dim>
            PostgreSQL 16 + PostGIS 3.4 — GTFS static, realtime snapshots, users and multilingual content.
          </Txt>
          <Code text={DB_SCHEMA_SQL} theme={theme} />
          <SectionHeader title="GTFS sample" theme={theme} icon="document-text" />
          <Code text={GTFS_SAMPLE} theme={theme} />
        </View>
      ) : null}

      {tab === 'api' ? (
        <View style={{ gap: spacing.md }}>
          {API_ENDPOINTS.map((e) => (
            <Card key={e.path} theme={theme} style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ backgroundColor: theme.primarySoft, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Txt theme={theme} size={11} weight="800" color={theme.primary}>
                    {e.method}
                  </Txt>
                </View>
                <Txt theme={theme} size={11.5} weight="700" mono style={{ flex: 1 }} numberOfLines={2}>
                  {e.path}
                </Txt>
              </View>
              <Txt theme={theme} size={12} dim>
                {e.desc[lang]}
              </Txt>
              <Code text={e.sample} theme={theme} />
            </Card>
          ))}
        </View>
      ) : null}

      {tab === 'roadmap' ? (
        <View style={{ gap: spacing.sm }}>
          {DEV_TIMELINE.map((p) => (
            <Card key={p.phase} theme={theme} style={{ gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Txt theme={theme} size={14} weight="800" color={theme.primary}>
                  {p.phase}
                </Txt>
                <Txt theme={theme} size={11.5} dim>
                  {p.months}
                </Txt>
              </View>
              <Txt theme={theme} size={13} weight="600">
                {p[lang]}
              </Txt>
            </Card>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

function Code({ text, theme }: { text: string; theme: ReturnType<typeof useThemed> }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ backgroundColor: theme.dark ? '#05080F' : '#0B1220', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: theme.border }}>
        <Txt theme={theme} size={10.5} mono color="#BFD2E8">
          {text}
        </Txt>
      </View>
    </ScrollView>
  );
}
