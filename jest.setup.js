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
