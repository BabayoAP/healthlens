import { useSyncExternalStore } from 'react';

/**
 * Light / dark display theme. A display preference only (not health data), so it lives
 * here instead of `store.ts`. Default follows the device setting until the user picks one.
 */
export type Theme = 'light' | 'dark';

const KEY = 'healthlens.theme';
const listeners = new Set<() => void>();

function saved(): Theme | undefined {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : undefined;
  } catch {
    return undefined;
  }
}

function system(): Theme {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

let current: Theme = saved() ?? system();

/** Put the theme on <html> so CSS tokens switch. Call once before the first render. */
export function applyTheme() {
  document.documentElement.dataset.theme = current;
}

export function setTheme(t: Theme) {
  current = t;
  try { localStorage.setItem(KEY, t); } catch { /* storage blocked: theme just won't persist */ }
  applyTheme();
  listeners.forEach((l) => l());
}

export function useTheme(): Theme {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => current,
  );
}
