

module.exports = {
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ granted: false, canAskAgain: true }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: true, canAskAgain: true }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('mock-notification-id'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),

  SchedulableTriggerInputTypes: {
    CALENDAR: 'calendar',
    DAILY: 'daily',
    DATE: 'date',
    MONTHLY: 'monthly',
    TIME_INTERVAL: 'timeInterval',
    WEEKLY: 'weekly',
    YEARLY: 'yearly',
  },
};
