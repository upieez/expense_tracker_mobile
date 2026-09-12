// Official in-memory mock for AsyncStorage so the storage service can be
// tested without a device.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Default global fetch stub — the Jest environment has no real network
// access, and services/exchangeRate.js is the only thing that calls fetch
// directly (everything else goes through an expo-* mock). Rejecting by
// default exercises the same graceful-fallback path a real offline device
// would hit; individual tests override this with jest.spyOn(global, 'fetch')
// when they need to assert on a successful response.
global.fetch = jest.fn().mockRejectedValue(new Error('network unavailable in tests'));

// jest-expo mocks `expo-file-system`, but Jest treats the `/legacy` subpath
// (which services/photoStorage.js requires on SDK 54+) as a separate module,
// so source and tests would otherwise hold two different mock objects.
// moduleNameMapper does not work here — jest-expo's built-in mocking takes
// precedence over it and the mapping is ignored.
jest.mock('expo-file-system/legacy', () => require('expo-file-system'));
