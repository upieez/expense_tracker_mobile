import * as Notifications from 'expo-notifications';
import {
  requestNotificationPermission,
  scheduleDailyReminder,
  cancelDailyReminder,
} from '../services/notifications';

beforeEach(() => {
  jest.clearAllMocks();
  Notifications.getPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: true });
  Notifications.requestPermissionsAsync.mockResolvedValue({ granted: true, canAskAgain: true });
});

describe('requestNotificationPermission', () => {
  it('returns true without prompting when permission is already granted', async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({ granted: true });
    const result = await requestNotificationPermission();
    expect(result).toBe(true);
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('requests permission when not yet granted and returns the outcome', async () => {
    Notifications.requestPermissionsAsync.mockResolvedValue({ granted: true });
    const result = await requestNotificationPermission();
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(result).toBe(true);
  });

  it('returns false when the user denies the request', async () => {
    Notifications.requestPermissionsAsync.mockResolvedValue({ granted: false });
    const result = await requestNotificationPermission();
    expect(result).toBe(false);
  });
});

describe('scheduleDailyReminder', () => {
  it('cancels any previous schedule before scheduling the new one', async () => {
    const calls = [];
    Notifications.cancelScheduledNotificationAsync.mockImplementation(() => {
      calls.push('cancel');
      return Promise.resolve();
    });
    Notifications.scheduleNotificationAsync.mockImplementation(() => {
      calls.push('schedule');
      return Promise.resolve('id');
    });
    await scheduleDailyReminder(20, 30);
    expect(calls).toEqual(['cancel', 'schedule']);
  });

  it('schedules a repeating notification at the given hour and minute', async () => {
    await scheduleDailyReminder(9, 15);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        identifier: 'daily-expense-reminder',
        trigger: { type: 'daily', hour: 9, minute: 15 },
      })
    );
  });

  // Regression guard: SDK 53+ treats the trigger as a discriminated union, so
  // a trigger without a valid `type` is rejected at runtime with "The trigger
  // object you provided is invalid."
  it('tags the trigger with a type from the SDK trigger enum', async () => {
    await scheduleDailyReminder(7, 45);
    const { trigger } = Notifications.scheduleNotificationAsync.mock.calls[0][0];
    expect(trigger).toHaveProperty('type');
    expect(Object.values(Notifications.SchedulableTriggerInputTypes)).toContain(trigger.type);
  });
});

describe('cancelDailyReminder', () => {
  it('cancels the reminder by its fixed identifier', async () => {
    await cancelDailyReminder();
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('daily-expense-reminder');
  });

  it('never throws even if there is nothing scheduled to cancel', async () => {
    Notifications.cancelScheduledNotificationAsync.mockRejectedValue(new Error('nothing scheduled'));
    await expect(cancelDailyReminder()).resolves.toBeUndefined();
  });
});
