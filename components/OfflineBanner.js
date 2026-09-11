import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { colors, spacing, typography } from '../theme';

// Rendered once, above the navigator, so it's visible no matter which tab
// is active. Self-contained (owns its own visibility) so mounting it is a
// one-line, no-decision addition to App.js. This app has no cloud backend —
// everything already works fully from local storage — so the message is
// reassurance, not a warning: nothing is blocked, nothing will be lost.
export default function OfflineBanner() {
  const connected = useNetworkStatus();
  if (connected) return null;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.banner} accessible accessibilityRole="alert">
        <Ionicons name="cloud-offline-outline" size={16} color={colors.warning} />
        <Text style={styles.text}>You're offline — everything still saves locally.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.warningLight },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  text: {
    marginLeft: spacing.xs,
    fontSize: typography.caption,
    color: colors.warning,
    fontWeight: typography.medium,
  },
});
