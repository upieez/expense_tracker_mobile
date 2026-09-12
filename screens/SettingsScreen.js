import { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Switch,
  Pressable,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "../store/SettingsContext";
import { useExpenses } from "../store/ExpensesContext";
import {
  requestNotificationPermission,
  scheduleDailyReminder,
  cancelDailyReminder,
} from "../services/notifications";
import { getOrCreateDeviceId } from "../services/deviceId";
import {
  getExchangeRate,
  currencyCodeForSymbol,
} from "../services/exchangeRate";
import { colors, spacing, typography, radii } from "../theme";

const CURRENCY_PRESETS = ["$", "£", "€", "¥"];

function formatTime(hour, minute) {
  const period = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${String(minute).padStart(2, "0")} ${period}`;
}

export default function SettingsScreen() {
  const {
    reminderEnabled,
    reminderHour,
    reminderMinute,
    currencySymbol,
    updateSettings,
  } = useSettings();
  const { clearAll } = useExpenses();
  const [deviceId, setDeviceId] = useState(null);
  const [rateInfo, setRateInfo] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getOrCreateDeviceId()
      .then((id) => {
        if (!cancelled) setDeviceId(id);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getExchangeRate(currencyCodeForSymbol(currencySymbol))
      .then((info) => {
        if (!cancelled) setRateInfo(info);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [currencySymbol]);

  function cycleCurrency() {
    const currentIndex = CURRENCY_PRESETS.indexOf(currencySymbol);
    const next = CURRENCY_PRESETS[(currentIndex + 1) % CURRENCY_PRESETS.length];
    updateSettings({ currencySymbol: next });
  }

  async function handleReminderToggle(value) {
    if (!value) {
      updateSettings({ reminderEnabled: false });
      await cancelDailyReminder();
      return;
    }
    const granted = await requestNotificationPermission();
    if (!granted) {
      Alert.alert(
        "Notifications disabled",
        "Enable notifications for this app in your device settings to use daily reminders.",
      );
      return;
    }
    updateSettings({ reminderEnabled: true });
    await scheduleDailyReminder(reminderHour, reminderMinute);
  }

  function handleClearData() {
    Alert.alert(
      "Clear all data?",
      "This permanently deletes every logged expense from this device. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", style: "destructive", onPress: () => clearAll() },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>

        <Text style={styles.sectionLabel}>Preferences</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Daily reminder</Text>
              <Text style={styles.rowCaption}>
                {formatTime(reminderHour, reminderMinute)}
              </Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={handleReminderToggle}
              accessibilityLabel="Daily reminder"
              trackColor={{ true: colors.primary }}
            />
          </View>

          <Pressable
            style={[styles.row, styles.rowBorder]}
            onPress={cycleCurrency}
            accessibilityRole="button"
          >
            <Text style={styles.rowLabel}>Currency symbol</Text>
            <Text style={styles.rowValue}>{currencySymbol}</Text>
          </Pressable>
          {rateInfo && rateInfo.code !== "USD" ? (
            <Text style={styles.hint} accessibilityLabel="Exchange rate">
              1 USD ≈ {rateInfo.rate.toFixed(2)} {rateInfo.code}
              {rateInfo.stale ? " (last known, offline)" : ""} · {rateInfo.date}
            </Text>
          ) : null}
        </View>

        <Text style={styles.sectionLabel}>Data</Text>
        <View style={styles.card}>
          <Pressable
            style={styles.row}
            onPress={handleClearData}
            accessibilityRole="button"
          >
            <Text style={[styles.rowLabel, styles.danger]}>Clear all data</Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textSecondary}
            />
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.card}>
          <Text style={styles.aboutText}>Expense Tracker</Text>
          {deviceId ? (
            <Text style={styles.deviceIdText} accessibilityLabel="Device ID">
              Device ID: {deviceId}
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: {
    fontSize: typography.title,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: typography.caption,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  rowText: { flex: 1 },
  rowLabel: {
    fontSize: typography.body,
    color: colors.textPrimary,
    fontWeight: typography.medium,
  },
  rowCaption: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rowValue: { fontSize: typography.body, color: colors.textSecondary },
  hint: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  danger: { color: colors.danger },
  aboutText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    padding: spacing.md,
  },
  deviceIdText: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
});
