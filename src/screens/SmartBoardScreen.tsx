import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useThemed } from '../themeContext';
import { useApp } from '../store';
import { nameOf, t } from '../i18n';
import { CrowdDots, Txt } from '../components/ui';
import { busStopById, routesServing } from '../data/bus';
import { arrivalsForStop, crowdingLabel, useLiveVehicles } from '../lib/gtfs';
import { useNow } from '../lib/useNow';
import { fmtClock, fmtEta } from '../lib/format';
import { CROWDING_COLOR } from '../lib/gtfs';
import type { RootStackParamList } from '../nav/types';
import { spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'SmartBoard'>;

const NOTICES = [
  {
    en: 'Tap Rabbit Card or EMV contactless at the gate — daily cap applies.',
    th: 'แตะบัตรแรบบิท หรือ EMV ที่ประตู — มีเพดานรายวัน',
    my: 'တံခါးတွင် ရယ်ဘစ် သို့မဟုတ် EMV ကိုတို့ပါ — နေ့စဉ်ကန့်သတ်ချက်ရှိသည်။',
  },
  {
    en: 'EV zero-emission buses now serve this corridor every 8 minutes.',
    th: 'รถ EV ไร้มลพิษให้บริการทุก 8 นาทีบนเส้นทางนี้',
    my: 'ဤလမ်းကြောင်းတွင် မီးစက်ဘတ်စ် ၈ မိနစ်တစ်ကြိမ် ပြေးဆွဲသည်။',
  },
  {
    en: 'AI crowd prediction: low occupancy expected for the next 20 minutes.',
    th: 'AI คาดการณ์ความแออัด: คนน้อยในอีก 20 นาทีข้างหน้า',
    my: 'AI ခန့်မှန်းချက် — နောက် ၂၀ မိနစ် လူနည်းမည်။',
  },
];

export default function SmartBoardScreen({ route, navigation }: Props) {
  const theme = useThemed();
  const { settings: st } = useApp();
  const lang = st.lang;
  const insets = useSafeAreaInsets();
  const { id } = route.params;
  const stop = busStopById(id);
  const vehicles = useLiveVehicles();
  const sec = useNow(1000) / 1000;
  const [page, setPage] = useState(0);
  const [noticeIdx, setNoticeIdx] = useState(0);

  useEffect(() => {
    if (st.reduceMotion) return;
    const id1 = setInterval(() => setPage((p) => (p + 1) % 2), 8000);
    const id2 = setInterval(() => setNoticeIdx((n) => (n + 1) % NOTICES.length), 5000);
    return () => {
      clearInterval(id1);
      clearInterval(id2);
    };
  }, [st.reduceMotion]);

  const arrivals = useMemo(() => (stop ? arrivalsForStop(stop.id, vehicles, sec) : []), [stop, vehicles, Math.floor(sec)]);
  const routes = stop ? routesServing(stop.id) : [];

  if (!stop) return null;

  return (
    <View style={{ flex: 1, backgroundColor: '#05080F', paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + spacing.md, gap: spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Pressable onPress={() => navigation.goBack()} style={{ padding: 6 }}>
          <Ionicons name="close" size={22} color="#8FA3C0" />
        </Pressable>
        <Txt theme={theme} size={12} weight="800" color="#F5C451">
          {t('boardTitle', lang)}
        </Txt>
        <View style={{ flex: 1 }} />
        <Txt theme={theme} size={22} weight="800" color="#FFFFFF" mono>
          {fmtClock(new Date())}
        </Txt>
      </View>

      <View>
        <Txt theme={theme} size={26} weight="800" color="#FFFFFF">
          {nameOf(stop, lang)}
        </Txt>
        <Txt theme={theme} size={12} color="#8FA3C0">
          GTFS stop_id {stop.code} · {routes.map((r) => r.code).join(' · ')}
        </Txt>
      </View>

      {page === 0 ? (
        <ScrollView contentContainerStyle={{ gap: spacing.md }}>
          {arrivals.slice(0, 5).map((a, i) => {
            const route = routes.find((r) => r.id === a.routeId);
            return (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  backgroundColor: i === 0 ? '#0E1626' : '#0A111E',
                  borderWidth: 1,
                  borderColor: i === 0 ? '#2ED47A55' : '#FFFFFF12',
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <View style={{ width: 64, height: 52, borderRadius: 12, backgroundColor: route?.color ?? '#E8A33D', alignItems: 'center', justifyContent: 'center' }}>
                  <Txt theme={theme} size={19} weight="800" color="#fff">
                    {route?.code}
                  </Txt>
                </View>
                <View style={{ flex: 1 }}>
                  <Txt theme={theme} size={i === 0 ? 21 : 17} weight="800" color="#FFFFFF" numberOfLines={1}>
                    {nameOf(a.dest, lang)}
                  </Txt>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <CrowdDots level={a.crowding} theme={theme} size={8} />
                    <Txt theme={theme} size={11.5} color="#8FA3C0">
                      {t(crowdingLabel(a.crowding), lang)}
                    </Txt>
                    {!a.realtime ? (
                      <Txt theme={theme} size={10.5} color="#F5C451">
                        SCHEDULED
                      </Txt>
                    ) : null}
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Txt theme={theme} size={i === 0 ? 34 : 26} weight="800" color={i === 0 ? CROWDING_COLOR[1] : '#D8E2F0'} mono>
                    {fmtEta(a.etaSec, lang)}
                  </Txt>
                  <Txt theme={theme} size={10} color="#8FA3C0">
                    {Math.round((route?.headwayPeakMin ?? 8) / 2)}m headway
                  </Txt>
                </View>
              </View>
            );
          })}
          {arrivals.length === 0 ? (
            <Txt theme={theme} size={16} color="#8FA3C0" center>
              {t('noArrivals', lang)}
            </Txt>
          ) : null}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={{ gap: spacing.lg }}>
          <Txt theme={theme} size={15} weight="800" color="#F5C451">
            {t('boardAlt', lang)}
          </Txt>
          {routes.map((r) => (
            <View key={r.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#0A111E', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#FFFFFF12' }}>
              <View style={{ width: 10, height: 40, borderRadius: 5, backgroundColor: r.color }} />
              <View style={{ flex: 1 }}>
                <Txt theme={theme} size={15} weight="800" color="#FFFFFF">
                  {r.code} · {nameOf(r, lang)}
                </Txt>
                <Txt theme={theme} size={11.5} color="#8FA3C0">
                  ฿{r.fareThb} · {r.fuel === 'electric' ? 'EV zero-emission' : 'BMTA'} · {r.stops.length} {t('stopsWord', lang)}
                </Txt>
              </View>
            </View>
          ))}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="sparkles" size={14} color="#2ED47A" />
            <Txt theme={theme} size={12.5} color="#2ED47A" style={{ flex: 1 }}>
              AI · {NOTICES[noticeIdx][lang]}
            </Txt>
          </View>
        </ScrollView>
      )}

      <View style={{ backgroundColor: '#0E1626', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: '#FFFFFF12' }}>
        <Txt theme={theme} size={12.5} weight="700" color="#F5C451" center>
          {t('boardNotice', lang)}
        </Txt>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {NOTICES.map((_, i) => (
            <View key={i} style={{ width: i === page ? 18 : 6, height: 6, borderRadius: 3, backgroundColor: i === page ? '#2ED47A' : '#2A3B55' }} />
          ))}
        </View>
        <Txt theme={theme} size={10.5} color="#8FA3C0">
          {t('boardPowered', lang)}
        </Txt>
      </View>
    </View>
  );
}
