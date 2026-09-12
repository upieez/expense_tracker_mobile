import { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { persistReceiptPhoto } from '../services/photoStorage';
import { colors, spacing, typography, radii } from '../theme';

export default function CameraCapture({ visible, onClose, onCapture }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturing, setCapturing] = useState(false);
  const cameraRef = useRef(null);

  if (!visible) return null;

  async function handleCapture() {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.6 });
      const savedUri = await persistReceiptPhoto(photo.uri);
      onCapture(savedUri);
    } catch (e) {
      console.warn('CameraCapture: failed to capture/save photo', e);
    } finally {
      setCapturing(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {!permission ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.textInverse} />
          </View>
        ) : !permission.granted ? (
          <View style={styles.center}>
            <Ionicons name="camera-outline" size={48} color={colors.textInverse} />
            <Text style={styles.permissionTitle}>Camera access needed</Text>
            <Text style={styles.permissionBody}>
              Allow camera access to attach a photo of your receipt to this expense.
            </Text>
            <Pressable style={styles.primaryBtn} onPress={requestPermission} accessibilityRole="button">
              <Text style={styles.primaryBtnText}>Grant camera access</Text>
            </Pressable>
            <Pressable onPress={onClose} accessibilityRole="button">
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
            <Pressable style={styles.closeBtn} onPress={onClose} accessibilityLabel="Close camera" accessibilityRole="button">
              <Ionicons name="close" size={26} color={colors.textInverse} />
            </Pressable>
            <View style={styles.captureRow}>
              <Pressable
                style={styles.captureBtn}
                onPress={handleCapture}
                disabled={capturing}
                accessibilityLabel="Take photo"
                accessibilityRole="button"
              >
                {capturing ? <ActivityIndicator color={colors.textInverse} /> : <View style={styles.captureInner} />}
              </Pressable>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  permissionTitle: {
    fontSize: typography.title,
    fontWeight: typography.bold,
    color: colors.textInverse,
    marginTop: spacing.md,
  },
  permissionBody: {
    fontSize: typography.body,
    color: colors.textInverse,
    textAlign: 'center',
    opacity: 0.8,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  primaryBtnText: { color: colors.textInverse, fontWeight: typography.semibold, fontSize: typography.body },
  cancelText: { color: colors.textInverse, opacity: 0.7, fontSize: typography.body },
  closeBtn: { position: 'absolute', top: spacing.xl, left: spacing.lg },
  captureRow: {
    position: 'absolute',
    bottom: spacing.xl,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: radii.pill,
    borderWidth: 4,
    borderColor: colors.textInverse,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    backgroundColor: colors.textInverse,
  },
});
