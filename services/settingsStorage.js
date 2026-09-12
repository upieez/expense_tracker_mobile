import AsyncStorage from '@react-native-async-storage/async-storage';

export const SETTINGS_KEY = '@expense-tracker/settings:v1';

export const DEFAULT_SETTINGS = {
  reminderEnabled: false,
  reminderHour: 20,
  reminderMinute: 0,
  currencySymbol: '$',
};

export async function getSettings() {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (e) {
    console.warn('settingsStorage: failed to read, using defaults', e);
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings) {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
