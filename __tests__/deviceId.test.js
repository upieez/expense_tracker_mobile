import * as SecureStore from 'expo-secure-store';
import { getOrCreateDeviceId } from '../services/deviceId';

beforeEach(() => {
  SecureStore.__reset();
  jest.clearAllMocks();
});

describe('getOrCreateDeviceId', () => {
  it('generates and persists a new id on first call', async () => {
    const id = await getOrCreateDeviceId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('expense-tracker-device-id', id);
  });

  it('returns the same id on subsequent calls instead of generating a new one', async () => {
    const first = await getOrCreateDeviceId();
    const second = await getOrCreateDeviceId();
    expect(second).toBe(first);
    expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(1);
  });

  it('reads an existing id from SecureStore rather than regenerating it', async () => {
    await SecureStore.setItemAsync('expense-tracker-device-id', 'existing-fixed-id');
    jest.clearAllMocks();
    const id = await getOrCreateDeviceId();
    expect(id).toBe('existing-fixed-id');
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
  });
});
