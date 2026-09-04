import React, { createContext, useContext } from 'react';
import { applyContrast, useTheme, THEME, Theme } from './theme';
import { useApp } from './store';

const ThemeCtx = createContext<Theme>(THEME.dark);

/** Resolves system/light/dark + high-contrast overrides once for the tree. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useApp();
  const base = useTheme(settings.themeMode);
  const theme = applyContrast(base, settings.highContrast);
  return <ThemeCtx.Provider value={theme}>{children}</ThemeCtx.Provider>;
}

export function useThemed(): Theme {
  return useContext(ThemeCtx);
}
