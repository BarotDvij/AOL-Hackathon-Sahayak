import { describe, expect, it } from 'vitest';
import { DEFAULT_PREFERENCES, readPreferences, resolvedTheme } from './preferences';
describe('appearance preferences', () => {
  it('matches device dark appearance only for device selection', () => {
    expect(resolvedTheme('device', true)).toBe('dark'); expect(resolvedTheme('device', false)).toBe('light');
    expect(resolvedTheme('light', true)).toBe('light'); expect(resolvedTheme('dark', false)).toBe('dark');
  });
  it('restores saved theme and large text after reload', () => {
    const saved = readPreferences(JSON.stringify({ ...DEFAULT_PREFERENCES, theme: 'dark', textSize: 'large' }));
    expect(saved.theme).toBe('dark'); expect(saved.textSize).toBe('large');
  });
  it('uses safe defaults for malformed saved choices', () => {
    expect(readPreferences('{').theme).toBe('light'); expect(readPreferences('{"theme":"invalid","textSize":42}').textSize).toBe('default');
  });
});
