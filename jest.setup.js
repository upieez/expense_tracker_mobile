jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

global.fetch = jest
  .fn()
  .mockRejectedValue(new Error("network unavailable in tests"));

jest.mock("expo-file-system/legacy", () => require("expo-file-system"));
