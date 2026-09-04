import React, { createContext, useContext, useMemo, useState } from 'react';
import type { TabKey } from './types';

interface Draft {
  fromId?: string;
  toId?: string;
}

interface MainValue {
  tab: TabKey;
  setTab: (t: TabKey) => void;
  draft: Draft;
  setDraft: (d: Draft) => void;
}

const Ctx = createContext<MainValue | null>(null);

/** Shared state for the tab shell: active tab + route-planner draft. */
export function MainProvider({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = useState<TabKey>('home');
  const [draft, setDraftState] = useState<Draft>({});
  const value = useMemo<MainValue>(
    () => ({
      tab,
      setTab,
      draft,
      setDraft: (d) => setDraftState((prev) => ({ ...prev, ...d })),
    }),
    [tab, draft]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMain(): MainValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useMain must be used inside MainProvider');
  return v;
}
