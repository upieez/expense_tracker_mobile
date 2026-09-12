import { Platform } from "react-native";

let FileSystem = null;
if (Platform.OS !== "web") {
  try {
    FileSystem = require("expo-file-system/legacy");
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

export async function persistReceiptPhoto(tempUri) {
  if (!FileSystem) return tempUri;
  await ensureDir();
  const filename = `receipt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
  const destUri = `${photosDir()}${filename}`;
  await FileSystem.copyAsync({ from: tempUri, to: destUri });
  return destUri;
}

export async function deleteReceiptPhoto(uri) {
  if (!uri || !FileSystem) return;
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  } catch (e) {
    console.warn("photoStorage: failed to delete photo", e);
  }
}
