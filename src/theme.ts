import { useColorScheme } from 'react-native';
import type { ThemeMode } from './types';

export interface Theme {
  dark: boolean;
  bg: string;
  bgElevated: string;
  card: string;
  cardAlt: string;
  border: string;
  text: string;
  textDim: string;
  textFaint: string;
  primary: string;
  primarySoft: string;
  accent: string;
  gold: string;
  danger: string;
  success: string;
  water: string;
  land: string;
  road: string;
  overlay: string;
  bts: string;
  mrt: string;
  arl: string;
  bus: string;
  walk: string;
}

const dark: Theme = {
  dark: true,
  bg: '#070D19',
  bgElevated: '#0D1524',
  card: '#111B2E',
  cardAlt: '#16233A',
  border: 'rgba(255,255,255,0.08)',
  text: '#EAF0FA',
  textDim: '#9AAAC4',
  textFaint: '#61728D',
  primary: '#2ED47A',
  primarySoft: 'rgba(46,212,122,0.14)',
  accent: '#4AA8FF',
  gold: '#F5C451',
  danger: '#FF6B6B',
  success: '#2ED47A',
  water: '#12324A',
  land: '#0A1220',
  road: '#22314A',
  overlay: 'rgba(3,7,14,0.82)',
  bts: '#1FA85C',
  mrt: '#1663B0',
  arl: '#B03A2E',
  bus: '#E8A33D',
  walk: '#9AAAC4',
};

const light: Theme = {
  dark: false,
  bg: '#F4F7FB',
  bgElevated: '#FFFFFF',
  card: '#FFFFFF',
  cardAlt: '#EEF3FA',
  border: 'rgba(10,25,50,0.09)',
  text: '#0C1A2E',
  textDim: '#4C5F7A',
  textFaint: '#7E8FA6',
  primary: '#0F9E58',
  primarySoft: 'rgba(15,158,88,0.12)',
  accent: '#1567C4',
  gold: '#B98617',
  danger: '#D64545',
  success: '#0F9E58',
  water: '#BFE0F2',
  land: '#E8EEF6',
  road: '#CBD6E4',
  overlay: 'rgba(255,255,255,0.92)',
  bts: '#1FA85C',
  mrt: '#1663B0',
  arl: '#B03A2E',
  bus: '#C97F16',
  walk: '#4C5F7A',
};

/** High-contrast overrides for accessibility (WCAG AA+ targets). */
export function applyContrast(t: Theme, high: boolean): Theme {
  if (!high) return t;
  return {
    ...t,
    text: t.dark ? '#FFFFFF' : '#000000',
    textDim: t.dark ? '#D8E2F0' : '#243449',
    textFaint: t.dark ? '#B3C2D6' : '#3D4E63',
    border: t.dark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.28)',
    cardAlt: t.dark ? '#1D2B45' : '#E4EBF5',
  };
}

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 10, md: 14, lg: 20, pill: 999 };

export function shadow(elevation = 3) {
  return {
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: elevation * 2,
    shadowOffset: { width: 0, height: elevation },
    elevation,
  };
}

export function useTheme(mode: ThemeMode): Theme {
  const scheme = useColorScheme();
  const resolved = mode === 'system' ? (scheme === 'light' ? 'light' : 'dark') : mode;
  return resolved === 'light' ? light : dark;
}

export const THEME = { dark, light };
