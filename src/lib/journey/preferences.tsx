import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
export type ThemeChoice = 'light' | 'dark' | 'device';
export interface Preferences {
  name: string; email: string; phone: string; role: string; language: 'English' | 'French';
  centre: string; city: string; region: string; channel: string;
  theme: ThemeChoice; textSize: 'default' | 'large';
  dailyBrief: boolean; replyReminders: boolean; followUpReminders: boolean; weeklyImpact: boolean; delivery: string;
}
export const PREFERENCES_KEY = 'journey-preferences-v1';
export const DEFAULT_PREFERENCES: Preferences = {
  name: 'Meera', email: '', phone: '', role: 'Coordinator', language: 'English',
  centre: '', city: '', region: '', channel: 'email', theme: 'light', textSize: 'default',
  dailyBrief: true, replyReminders: true, followUpReminders: true, weeklyImpact: false, delivery: 'app',
};
export function resolvedTheme(choice: ThemeChoice, deviceDark: boolean) { return choice === 'dark' || (choice === 'device' && deviceDark) ? 'dark' : 'light'; }
export function readPreferences(raw: string | null): Preferences {
  try {
    const value = JSON.parse(raw ?? '{}');
    const result = { ...DEFAULT_PREFERENCES };
    for (const key of Object.keys(result) as (keyof Preferences)[]) {
      if (typeof value?.[key] === typeof result[key]) Object.assign(result, { [key]: value[key] });
    }
    if (!['light', 'dark', 'device'].includes(result.theme)) result.theme = 'light';
    if (!['default', 'large'].includes(result.textSize)) result.textSize = 'default';
    if (!['English', 'French'].includes(result.language)) result.language = 'English';
    return result;
  } catch { return { ...DEFAULT_PREFERENCES }; }
}
const Context = createContext<{ preferences: Preferences; savePreferences: (value: Preferences) => boolean } | null>(null);
export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  useEffect(() => { try { setPreferences(readPreferences(localStorage.getItem(PREFERENCES_KEY))); } catch { /* keep defaults */ } }, []);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      document.documentElement.classList.toggle('dark', resolvedTheme(preferences.theme, media.matches) === 'dark');
      document.documentElement.classList.toggle('large-text', preferences.textSize === 'large');
    };
    apply(); media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [preferences.theme, preferences.textSize]);
  function savePreferences(value: Preferences) {
    setPreferences(value);
    try { localStorage.setItem(PREFERENCES_KEY, JSON.stringify(value)); return true; } catch { return false; }
  }
  return <Context.Provider value={{ preferences, savePreferences }}>{children}</Context.Provider>;
}
export function usePreferences() { const ctx = useContext(Context); if (!ctx) throw new Error('PreferencesProvider missing'); return ctx; }
