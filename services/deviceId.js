import * as SecureStore from 'expo-secure-store';

const DEVICE_ID_KEY = 'expense-tracker-device-id';

function generateId() {

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function getOrCreateDeviceId() {
  const existing = await SecureStore.getItemAsync(DEVICE_ID_KEY);
  if (existing) return existing;
  const id = generateId();
  await SecureStore.setItemAsync(DEVICE_ID_KEY, id);
  return id;
}
