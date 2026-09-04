import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainProvider, useMain } from '../nav/mainContext';
import { TabBar } from '../components/TabBar';
import { useThemed } from '../themeContext';
import { useApp } from '../store';
import HomeScreen from './HomeScreen';
import MapScreen from './MapScreen';
import PlannerScreen from './PlannerScreen';
import AssistantScreen from './AssistantScreen';
import SettingsScreen from './SettingsScreen';
import type { RootNav } from '../nav/types';

export default function MainScreen({ navigation }: { navigation: RootNav }) {
  return (
    <MainProvider>
      <Tabs navigation={navigation} />
    </MainProvider>
  );
}

function Tabs({ navigation }: { navigation: RootNav }) {
  const { tab, setTab } = useMain();
  const theme = useThemed();
  const { settings } = useApp();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, paddingTop: insets.top }}>
      <View style={{ flex: 1 }}>
        {tab === 'home' ? <HomeScreen navigation={navigation} /> : null}
        {tab === 'map' ? <MapScreen navigation={navigation} /> : null}
        {tab === 'plan' ? <PlannerScreen navigation={navigation} /> : null}
        {tab === 'ask' ? <AssistantScreen navigation={navigation} /> : null}
        {tab === 'settings' ? <SettingsScreen navigation={navigation} /> : null}
      </View>
      <TabBar active={tab} onChange={setTab} theme={theme} lang={settings.lang} />
    </View>
  );
}
