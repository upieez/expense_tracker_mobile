import * as SecureStore from 'expo-secure-store';

// This app has nothing genuinely secret to store — no passwords, no
// financial credentials, no cloud auth token. To still demonstrate
// expo-secure-store (Topic 6) honestly rather than forcing it onto data
// that doesn't need it, we generate a private per-device install identifier
// on first launch and keep it in SecureStore rather than AsyncStorage —
// the same category of small, sensitive-ish value SecureStore is designed
// for (hardware-backed encryption at rest), reserved here for a future
// cloud-sync auth key rather than anything in use today.

const DEVICE_ID_KEY = 'expense-tracker-device-id';

function generateId() {
  // Lightweight RFC4122-ish v4 UUID — no extra dependency needed for this.
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
