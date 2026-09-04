import React, { useMemo, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemed } from '../themeContext';
import { useApp } from '../store';
import { detectLang, nameOf, t } from '../i18n';
import { Card, Chip, IconBadge, Txt } from '../components/ui';
import { JourneyCard } from '../components/JourneyCard';
import { radius, spacing } from '../theme';
import { findPlace } from '../data/geo';
import { parseIntent } from '../lib/nlu';
import { nearestStopIds, planJourneys } from '../lib/router';
import { arrivalsForStop, crowdingLabel, trainsForStation, useLiveVehicles } from '../lib/gtfs';
import { useNow } from '../lib/useNow';
import { fmtEta } from '../lib/format';
import { STATIONS } from '../data/rail';
import { busStopById } from '../data/bus';
import { NETWORK } from '../data/network';
import type { Journey, Lang } from '../types';
import type { RootNav } from '../nav/types';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
  journey?: { fromId: string; toId: string; data: Journey };
  meta?: string[];
}

export default function AssistantScreen({ navigation }: { navigation: RootNav }) {
  const theme = useThemed();
  const { settings, gps } = useApp();
  const lang = settings.lang;
  const insets = useSafeAreaInsets();
  const vehicles = useLiveVehicles();
  const sec = useNow(2000) / 1000;

  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  const seed = useMemo<Message[]>(
    () => [
      {
        id: 'hello',
        role: 'ai',
        text: t('assistantHello', lang),
        meta: [
          `Bangkok 2026 · ${NETWORK.busStopsTotal.toLocaleString()} stops · ${NETWORK.smartStopsTotal} smart stops`,
        ],
      },
    ],
    [lang]
  );
  const [messages, setMessages] = useState<Message[]>(seed);

  const chips = [
    { key: 'nearRail', label: t('chipNearestTrain', lang), icon: 'train' },
    { key: 'nearBus', label: t('chipNearestBus', lang), icon: 'bus' },
    { key: 'landmark', label: t('chipToLandmark', lang), icon: 'business' },
    { key: 'crowd', label: t('chipCrowd', lang), icon: 'people' },
    { key: 'help', label: t('chipHelp', lang), icon: 'help-circle' },
  ];

  const respond = (raw: string) => {
    const userMsg: Message = { id: `${Date.now()}-u`, role: 'user', text: raw };
    setMessages((m) => [userMsg, ...m]);
    setInput('');
    setTyping(true);

    const { intent, lang: detected } = parseIntent(raw);
    const outLang: Lang = settings.autoDetect && detected ? detected : lang;

    setTimeout(() => {
      const reply = buildReply(intent, outLang);
      setTyping(false);
      setMessages((m) => [{ id: `${Date.now()}-a`, role: 'ai', ...reply }, ...m]);
    }, 650);
  };

  const buildReply = (intent: ReturnType<typeof parseIntent>['intent'], outLang: Lang): Omit<Message, 'id' | 'role'> => {
    if (intent.kind === 'greeting') {
      return { text: t('assistantHello', outLang) };
    }
    if (intent.kind === 'help') {
      return { text: t('aiHelp', outLang) };
    }
    if (intent.kind === 'nearest') {
      const kinds = intent.target === 'rail' ? (['station'] as const) : (['stop'] as const);
      const nearest = nearestStopIds(gps.lat, gps.lng, kinds as any, 3);
      const lines = nearest.map((n) => {
        if (intent.target === 'rail') {
          const s = STATIONS.find((x) => x.id === n.id);
          const tr = trainsForStation(n.id, sec)[0];
          return `${nameOf(s, outLang)} · ${n.meters} m · ${tr ? `${nameOf(tr.toward, outLang)} ${fmtEta(tr.etaSec, outLang)}` : ''}`;
        }
        const b = busStopById(n.id);
        const a = arrivalsForStop(n.id, vehicles, sec)[0];
        return `${nameOf(b, outLang)} · ${n.meters} m · ${a ? `${a.routeId.replace('bus-', '')} ${fmtEta(a.etaSec, outLang)}` : ''}`;
      });
      const prefix =
        intent.target === 'rail'
          ? outLang === 'th'
            ? 'สถานีรถไฟฟ้าใกล้คุณ:'
            : outLang === 'my'
            ? 'သင့်အနီးရှိ ရထားဘူတာများ:'
            : 'Nearest rail stations:'
          : outLang === 'th'
          ? 'ป้ายรถเมล์ใกล้คุณ:'
          : outLang === 'my'
          ? 'သင့်အနီးရှိ ဘတ်စ်ဂိတ်များ:'
          : 'Nearest bus stops:';
      return { text: `${prefix}\n${lines.map((l, i) => `${i + 1}. ${l}`).join('\n')}` };
    }
    if (intent.kind === 'route' || intent.kind === 'fare') {
      const fromNear = nearestStopIds(gps.lat, gps.lng, ['station', 'stop'], 1)[0]?.id ?? 'bts-siam';
      const journeys = planJourneys(fromNear, intent.toId);
      const best = intent.kind === 'fare' ? [...journeys].sort((a, b) => a.fareThb - b.fareThb)[0] : journeys[0];
      if (!best) return { text: t('aiNoIdea', outLang) };
      const dest = findPlace(intent.toId);
      const text =
        outLang === 'th'
          ? `เส้นทางไป ${nameOf(dest, outLang)}: ${Math.round(best.durationMin)} นาที · ${best.fareThb} บาท · ${best.transfers} ครั้ง`
          : outLang === 'my'
          ? `${nameOf(dest, outLang)} သို့ ခရီးစဉ် — ${Math.round(best.durationMin)} မိနစ် · ${best.fareThb} ကျပ် · ကူးပြောင်း ${best.transfers} ကြိမ်`
          : `Route to ${nameOf(dest, outLang)}: ${Math.round(best.durationMin)} min · ฿${best.fareThb} · ${best.transfers} transfer(s)`;
      return {
        text,
        journey: { fromId: fromNear, toId: intent.toId, data: best },
        meta: best.legs.slice(0, 4).map((l) => `${l.mode.toUpperCase()} ${nameOf(l.to, outLang)} · ${Math.round(l.minutes)} min`),
      };
    }
    if (intent.kind === 'crowd') {
      const station = nearestStopIds(gps.lat, gps.lng, ['station'], 1)[0];
      const stop = nearestStopIds(gps.lat, gps.lng, ['stop'], 1)[0];
      const parts: string[] = [];
      if (station) {
        trainsForStation(station.id, sec).slice(0, 2).forEach((tr) => {
          parts.push(
            `${nameOf(STATIONS.find((s) => s.id === station.id), outLang)} → ${nameOf(tr.toward, outLang)}: ${t(crowdingLabel(tr.crowding), outLang)}`
          );
        });
      }
      if (stop) {
        arrivalsForStop(stop.id, vehicles, sec).slice(0, 2).forEach((a) => {
          parts.push(`${nameOf(busStopById(stop.id), outLang)} · ${a.routeId.replace('bus-', '')}: ${t(crowdingLabel(a.crowding), outLang)}`);
        });
      }
      const title = outLang === 'th' ? 'ระดับความแออัด (AI inference)' : outLang === 'my' ? 'လူဦးရေ ခန့်မှန်းချက် (AI)' : 'Crowd levels (AI inference)';
      return { text: `${title}\n${parts.join('\n')}` };
    }
    return { text: t('aiNoIdea', outLang) };
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <IconBadge name="sparkbubbles" color={theme.dark ? '#04140B' : '#fff'} bg={theme.primary} size={17} />
          <View style={{ flex: 1 }}>
            <Txt theme={theme} size={17} weight="800">
              {t('tabAsk', lang)}
            </Txt>
            <Txt theme={theme} size={11} dim>
              RAG + multilingual NLU · TH / MY / EN
            </Txt>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
          {chips.map((c) => (
            <Chip
              key={c.key}
              label={c.label}
              theme={theme}
              icon={c.icon as any}
              onPress={() =>
                respond(
                  c.key === 'nearRail'
                    ? 'nearest station'
                    : c.key === 'nearBus'
                    ? 'nearest bus stop'
                    : c.key === 'landmark'
                    ? 'route to Grand Palace'
                    : c.key === 'crowd'
                    ? 'crowd levels'
                    : 'what can you do?'
                )
              }
            />
          ))}
        </View>
      </View>

      <FlatList
        ref={listRef}
        inverted
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: insets.bottom + spacing.md }}
        ListHeaderComponent={typing ? (
          <Card theme={theme} style={{ alignSelf: 'flex-start', paddingVertical: 10 }}>
            <Txt theme={theme} size={12.5} dim>
              {t('thinking', lang)}
            </Txt>
          </Card>
        ) : null}
        renderItem={({ item }) => (
          <View style={{ alignItems: item.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <Card
              theme={theme}
              elevated={item.role === 'ai'}
              style={{
                maxWidth: '92%',
                backgroundColor: item.role === 'user' ? theme.primarySoft : theme.card,
              }}
            >
              <Txt theme={theme} size={13.5} weight="600">
                {item.text}
              </Txt>
              {item.meta?.map((m, i) => (
                <Txt key={i} theme={theme} size={11.5} dim>
                  • {m}
                </Txt>
              ))}
              {item.journey ? (
                <View style={{ marginTop: 6, width: 260 }}>
                  <JourneyCard
                    journey={item.journey.data}
                    theme={theme}
                    lang={lang}
                    onPress={() => navigation.navigate('Journey', { fromId: item.journey!.fromId, toId: item.journey!.toId })}
                  />
                </View>
              ) : null}
            </Card>
          </View>
        )}
      />

      <View
        style={{
          flexDirection: 'row',
          gap: spacing.sm,
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.sm,
          paddingBottom: Math.max(insets.bottom, spacing.md),
          borderTopWidth: 1,
          borderTopColor: theme.border,
          backgroundColor: theme.bgElevated,
          alignItems: 'center',
        }}
      >
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder={t('askPlaceholder', lang)}
          placeholderTextColor={theme.textFaint}
          style={{
            flex: 1,
            color: theme.text,
            backgroundColor: theme.cardAlt,
            borderRadius: radius.pill,
            paddingHorizontal: 16,
            paddingVertical: 11,
            fontSize: 14,
            borderWidth: 1,
            borderColor: theme.border,
          }}
          returnKeyType="send"
          onSubmitEditing={() => input.trim() && respond(input.trim())}
          multiline
        />
        <Pressable
          onPress={() => input.trim() && respond(input.trim())}
          style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="send" size={18} color={theme.dark ? '#04140B' : '#fff'} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
