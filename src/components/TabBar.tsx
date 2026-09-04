import React from 'react';
import { Pressable, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Theme } from '../theme';
import { Txt } from './ui';
import type { TabKey } from '../nav/types';
import { t } from '../i18n';
import type { Lang } from '../types';

const TABS: { key: TabKey; icon: any; activeIcon: any; labelKey: string }[] = [
  { key: 'home', icon: 'home-outline', activeIcon: 'home', labelKey: 'tabHome' },
  { key: 'map', icon: 'map-outline', activeIcon: 'map', labelKey: 'tabMap' },
  { key: 'plan', icon: 'git-branch-outline', activeIcon: 'git-branch', labelKey: 'tabPlan' },
  { key: 'ask', icon: 'sparkbubbles-outline', activeIcon: 'sparkbubbles', labelKey: 'tabAsk' },
  { key: 'settings', icon: 'settings-outline', activeIcon: 'settings', labelKey: 'tabSettings' },
];

export function TabBar({ active, onChange, theme, lang }: { active: TabKey; onChange: (k: TabKey) => void; theme: Theme; lang: Lang }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: theme.bgElevated,
        borderTopWidth: 1,
        borderTopColor: theme.border,
        paddingBottom: Math.max(insets.bottom, 8),
        paddingTop: 8,
      }}
    >
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable key={tab.key} onPress={() => onChange(tab.key)} style={{ flex: 1, alignItems: 'center', gap: 3, paddingVertical: 2 }}>
            <View
              style={{
                paddingHorizontal: 14,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: isActive ? theme.primarySoft : 'transparent',
              }}
            >
              <Ionicons name={isActive ? tab.activeIcon : tab.icon} size={20} color={isActive ? theme.primary : theme.textFaint} />
            </View>
            <Txt theme={theme} size={10.5} weight={isActive ? '800' : '600'} color={isActive ? theme.primary : theme.textFaint}>
              {t(tab.labelKey, lang)}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}
