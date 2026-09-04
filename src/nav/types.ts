import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Main: undefined;
  StopDetail: { id: string };
  StationDetail: { id: string };
  SmartBoard: { id: string };
  Journey: { fromId: string; toId: string };
  Blueprint: undefined;
  Offline: undefined;
};

export type RootNav = NativeStackScreenProps<RootStackParamList>['navigation'];

export type TabKey = 'home' | 'map' | 'plan' | 'ask' | 'settings';
