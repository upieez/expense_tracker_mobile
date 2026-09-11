// Manual mock for expo-notifications (native module, unsafe under Jest).
// Defaults simulate "not yet asked, would grant if asked" so the happy path
// works without per-test setup; individual tests override via
// mockResolvedValueOnce for denied/edge cases.
module.exports = {
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ granted: false, canAskAgain: true }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: true, canAskAgain: true }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue('mock-notification-id'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
};
