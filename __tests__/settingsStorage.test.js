import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSettings, saveSettings, DEFAULT_SETTINGS, SETTINGS_KEY } from '../services/settingsStorage';

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.restoreAllMocks();
});

describe('settingsStorage', () => {
  it('returns defaults when nothing is stored', async () => {
    expect(await getSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('saves and reads back a full settings object', async () => {
    const custom = { reminderEnabled: true, reminderHour: 9, reminderMinute: 30, currencySymbol: '£' };
    await saveSettings(custom);
    expect(await getSettings()).toEqual(custom);
  });

  it('fills in missing keys from defaults (forward-compatible with older saves)', async () => {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ currencySymbol: '€' }));
    expect(await getSettings()).toEqual({ ...DEFAULT_SETTINGS, currencySymbol: '€' });
  });

  it('survives corrupted stored JSON by falling back to defaults', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    await AsyncStorage.setItem(SETTINGS_KEY, 'not valid json {');
    expect(await getSettings()).toEqual(DEFAULT_SETTINGS);
  });
});
