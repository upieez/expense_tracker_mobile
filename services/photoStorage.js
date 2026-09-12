import { Platform } from 'react-native';

// Receipt photos captured via expo-camera land in a temporary cache URI that
// does NOT survive an app restart — copying into the app's own document
// directory is what makes the photo durable. (This was the real gotcha we
// hit building this: a photo would show fine right after capture, then
// vanish on next launch, because we were storing the cache URI directly.)

// expo-file-system is a native-only module with no web implementation, so a
// top-level `import` of it crashes the whole app on web (Expo Snack's web
// preview, `expo start --web`) before a single screen renders. Receipt
// photos are a device-only feature anyway, so the module is loaded
// defensively here and every function below degrades to a harmless no-op
// when it isn't available.
let FileSystem = null;
if (Platform.OS !== 'web') {
  try {
    // eslint-disable-next-line global-require
    FileSystem = require('expo-file-system/legacy');
  } catch (e) {
    FileSystem = null;
  }
}

const photosDir = () => `${FileSystem.documentDirectory}receipts/`;

async function ensureDir() {
  const info = await FileSystem.getInfoAsync(photosDir());
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(photosDir(), { intermediates: true });
  }
}

// Copies a freshly-captured photo into permanent storage and returns its
// new, durable URI. Without a file system (web), the original URI is handed
// back unchanged — the photo simply isn't made durable.
export async function persistReceiptPhoto(tempUri) {
  if (!FileSystem) return tempUri;
  await ensureDir();
  const filename = `receipt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
  const destUri = `${photosDir()}${filename}`;
  await FileSystem.copyAsync({ from: tempUri, to: destUri });
  return destUri;
}

// Best-effort cleanup when an expense (or its photo) is removed — failures
// are logged, never thrown, since a missing file should never block the
// user's delete action.
export async function deleteReceiptPhoto(uri) {
  if (!uri || !FileSystem) return;
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  } catch (e) {
    console.warn('photoStorage: failed to delete photo', e);
  }
}
