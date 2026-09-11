import * as Network from 'expo-network';
import { isOnline } from '../services/network';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('isOnline', () => {
  it('returns true when connected and internet is reachable', async () => {
    Network.getNetworkStateAsync.mockResolvedValue({ isConnected: true, isInternetReachable: true });
    expect(await isOnline()).toBe(true);
  });

  it('returns false when there is no connection at all', async () => {
    Network.getNetworkStateAsync.mockResolvedValue({ isConnected: false, isInternetReachable: false });
    expect(await isOnline()).toBe(false);
  });

  it('returns false when connected but the internet is definitely not reachable', async () => {
    Network.getNetworkStateAsync.mockResolvedValue({ isConnected: true, isInternetReachable: false });
    expect(await isOnline()).toBe(false);
  });

  it('treats an unknown reachability (null) as online rather than flashing an incorrect banner', async () => {
    Network.getNetworkStateAsync.mockResolvedValue({ isConnected: true, isInternetReachable: null });
    expect(await isOnline()).toBe(true);
  });

  it('assumes online rather than offline when the check itself fails', async () => {
    Network.getNetworkStateAsync.mockRejectedValue(new Error('boom'));
    expect(await isOnline()).toBe(true);
  });
});
