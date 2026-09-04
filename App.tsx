import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppProvider } from './src/store';
import { ThemeProvider, useThemed } from './src/themeContext';
import type { RootStackParamList } from './src/nav/types';

import MainScreen from './src/screens/MainScreen';
import StopDetailScreen from './src/screens/StopDetailScreen';
import StationDetailScreen from './src/screens/StationDetailScreen';
import SmartBoardScreen from './src/screens/SmartBoardScreen';
import JourneyScreen from './src/screens/JourneyScreen';
import BlueprintScreen from './src/screens/BlueprintScreen';
import OfflineScreen from './src/screens/OfflineScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

function Root() {
  const theme = useThemed();
  const base = theme.dark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    dark: theme.dark,
    colors: {
      ...base.colors,
      primary: theme.primary,
      background: theme.bg,
      card: theme.bgElevated,
      text: theme.text,
      border: theme.border,
      notification: theme.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.bg },
          headerTintColor: theme.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.bg },
        }}
      >
        <Stack.Screen name="Main" component={MainScreen} options={{ headerShown: false }} />
        <Stack.Screen name="StopDetail" component={StopDetailScreen} options={{ title: '' }} />
        <Stack.Screen name="StationDetail" component={StationDetailScreen} options={{ title: '' }} />
        <Stack.Screen name="Journey" component={JourneyScreen} options={{ title: '' }} />
        <Stack.Screen name="SmartBoard" component={SmartBoardScreen} options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="Blueprint" component={BlueprintScreen} options={{ title: '' }} />
        <Stack.Screen name="Offline" component={OfflineScreen} options={{ title: '' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({ ...Ionicons.font });
  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <AppProvider>
        <ThemeProvider>
          <Root />
        </ThemeProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}
