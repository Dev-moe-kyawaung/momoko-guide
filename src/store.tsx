import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Lang, ThemeMode } from './types';
import { GPS_FIXES } from './data/geo';

export interface Settings {
  lang: Lang;
  autoDetect: boolean;
  themeMode: ThemeMode;
  fontScale: number;
  highContrast: boolean;
  reduceMotion: boolean;
  offlineMode: boolean;
}

export interface HistoryItem {
  id: string;
  fromId: string;
  toId: string;
  at: number;
  durationMin: number;
  fareThb: number;
}

export interface GpsFix {
  id: string;
  label: string;
  lat: number;
  lng: number;
  accuracyM: number;
}

interface AppValue {
  ready: boolean;
  settings: Settings;
  updateSettings: (patch: Partial<Settings>) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  history: HistoryItem[];
  pushHistory: (item: Omit<HistoryItem, 'id' | 'at'>) => void;
  clearHistory: () => void;
  clearFavorites: () => void;
  gps: GpsFix;
  cycleGps: () => void;
}

const DEFAULTS: Settings = {
  lang: 'th',
  autoDetect: true,
  themeMode: 'system',
  fontScale: 1,
  highContrast: false,
  reduceMotion: false,
  offlineMode: false,
};

const AppContext = createContext<AppValue | null>(null);
const KEY = '@bkk-transit/v1';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [gpsIndex, setGpsIndex] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<Settings> & { favorites?: string[]; history?: HistoryItem[]; gpsIndex?: number };
          setSettings({ ...DEFAULTS, ...parsed });
          setFavorites(parsed.favorites ?? []);
          setHistory(parsed.history ?? []);
          setGpsIndex(parsed.gpsIndex ?? 0);
        }
      } catch {
        // corrupt cache → fall back to defaults
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persist = useCallback(
    (next: { settings?: Settings; favorites?: string[]; history?: HistoryItem[]; gpsIndex?: number }) => {
      const payload = {
        ...settings,
        ...next,
        favorites: next.favorites ?? favorites,
        history: next.history ?? history,
        gpsIndex: next.gpsIndex ?? gpsIndex,
      };
      AsyncStorage.setItem(KEY, JSON.stringify(payload)).catch(() => undefined);
    },
    [settings, favorites, history, gpsIndex]
  );

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };
        persist({ settings: next });
        return next;
      });
    },
    [persist]
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      setFavorites((prev) => {
        const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
        persist({ favorites: next });
        return next;
      });
    },
    [persist]
  );

  const pushHistory = useCallback(
    (item: Omit<HistoryItem, 'id' | 'at'>) => {
      setHistory((prev) => {
        const entry: HistoryItem = { ...item, id: `${Date.now()}`, at: Date.now() };
        const next = [entry, ...prev.filter((x) => !(x.fromId === item.fromId && x.toId === item.toId))].slice(0, 12);
        persist({ history: next });
        return next;
      });
    },
    [persist]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    persist({ history: [] });
  }, [persist]);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    persist({ favorites: [] });
  }, [persist]);

  const cycleGps = useCallback(() => {
    setGpsIndex((prev) => {
      const next = (prev + 1) % GPS_FIXES.length;
      persist({ gpsIndex: next });
      return next;
    });
  }, [persist]);

  const value = useMemo<AppValue>(
    () => ({
      ready,
      settings,
      updateSettings,
      favorites,
      toggleFavorite,
      isFavorite: (id: string) => favorites.includes(id),
      history,
      pushHistory,
      clearHistory,
      clearFavorites,
      gps: GPS_FIXES[gpsIndex] ?? GPS_FIXES[0],
      cycleGps,
    }),
    [ready, settings, updateSettings, favorites, toggleFavorite, history, pushHistory, clearHistory, clearFavorites, gpsIndex, cycleGps]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
