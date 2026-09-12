import { render, screen, waitFor } from '@testing-library/react-native';
import * as Network from 'expo-network';
import OfflineBanner from '../components/OfflineBanner';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('OfflineBanner', () => {
  it('renders nothing while online', async () => {
    Network.getNetworkStateAsync.mockResolvedValue({ isConnected: true, isInternetReachable: true });
    await render(<OfflineBanner />);
    await waitFor(() => expect(Network.getNetworkStateAsync).toHaveBeenCalled());
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows a reassuring message once offline is detected', async () => {
    Network.getNetworkStateAsync.mockResolvedValue({ isConnected: false, isInternetReachable: false });
    await render(<OfflineBanner />);
    await waitFor(() => expect(screen.getByRole('alert')).toBeOnTheScreen());
    expect(screen.getByText(/offline/i)).toBeOnTheScreen();
  });
});
