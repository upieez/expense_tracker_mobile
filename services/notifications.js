import * as Notifications from 'expo-notifications';

// Local-only daily reminder. Push/remote notifications are explicitly out of
// scope (Expo SDK 53+ requires a custom dev build for Android push, per the
// module's own Week 17 reading) — a local scheduled notification needs none
// of that and works in Expo Go.

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const REMINDER_ID = 'daily-expense-reminder';

// Resolves true if the app can post local notifications, requesting
// permission if it hasn't been asked yet. Never throws — a permission
// failure just means the caller should keep the reminder off.
export async function requestNotificationPermission() {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

// (Re)schedules the daily reminder at the given local hour/minute (24h).
// Always cancels any previous schedule first so changing the time never
// leaves a stale duplicate notification behind.
export async function scheduleDailyReminder(hour, minute) {
  await cancelDailyReminder();
  await Notifications.scheduleNotificationAsync({
    identifier: REMINDER_ID,
    content: {
      title: 'Log your spending',
      body: "Don't forget to add today's expenses.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelDailyReminder() {
  await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => {});
}
