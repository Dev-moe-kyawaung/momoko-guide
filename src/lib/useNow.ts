import { useEffect, useState } from 'react';

/** Ticking clock used by countdown screens (1 s resolution). */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function epochSec(): number {
  return Date.now() / 1000;
}