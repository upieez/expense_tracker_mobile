// Manual mock for expo-secure-store (native module, unsafe under Jest).
// Backed by a plain in-memory object rather than AsyncStorage's own mock so
// this stays independent — call __reset() in beforeEach to isolate tests.
const store = {};

function reset() {
  for (const key of Object.keys(store)) delete store[key];
}

module.exports = {
  getItemAsync: jest.fn((key) => Promise.resolve(store[key] ?? null)),
  setItemAsync: jest.fn((key, value) => {
    store[key] = value;
    return Promise.resolve();
  }),
  deleteItemAsync: jest.fn((key) => {
    delete store[key];
    return Promise.resolve();
  }),
  __reset: reset,
};
