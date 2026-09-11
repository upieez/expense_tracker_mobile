import { renderHook, waitFor } from '@testing-library/react-native';
import { AppState } from 'react-native';
import * as Network from 'expo-network';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useNetworkStatus', () => {
  it('reports connected on mount when the device is online', async () => {
    Network.getNetworkStateAsync.mockResolvedValue({ isConnected: true, isInternetReachable: true });
    const { result } = await renderHook(() => useNetworkStatus());
    await waitFor(() => expect(result.current).toBe(true));
  });

  it('reports disconnected once the network check resolves false', async () => {
    Network.getNetworkStateAsync.mockResolvedValue({ isConnected: false, isInternetReachable: false });
    const { result } = await renderHook(() => useNetworkStatus());
    await waitFor(() => expect(result.current).toBe(false));
  });

  it('subscribes to AppState foreground changes and unsubscribes on unmount', async () => {
    Network.getNetworkStateAsync.mockResolvedValue({ isConnected: true, isInternetReachable: true });
    const addSpy = jest.spyOn(AppState, 'addEventListener');
    const removeSpy = jest.fn();
    addSpy.mockReturnValue({ remove: removeSpy });

    const { unmount } = await renderHook(() => useNetworkStatus());
    await waitFor(() => expect(Network.getNetworkStateAsync).toHaveBeenCalled());

    expect(addSpy).toHaveBeenCalledWith('change', expect.any(Function));
    await unmount();
    expect(removeSpy).toHaveBeenCalledTimes(1);

    addSpy.mockRestore();
  });

  it('re-checks connectivity when the subscribed listener reports the app is active', async () => {
    Network.getNetworkStateAsync.mockResolvedValue({ isConnected: true, isInternetReachable: true });
    let handler;
    const addSpy = jest.spyOn(AppState, 'addEventListener').mockImplementation((event, cb) => {
      handler = cb;
      return { remove: jest.fn() };
    });

    await renderHook(() => useNetworkStatus());
    await waitFor(() => expect(Network.getNetworkStateAsync).toHaveBeenCalledTimes(1));

    handler('active');
    await waitFor(() => expect(Network.getNetworkStateAsync).toHaveBeenCalledTimes(2));

    addSpy.mockRestore();
  });
});
