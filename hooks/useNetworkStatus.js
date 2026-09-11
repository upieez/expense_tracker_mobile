import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { isOnline } from '../services/network';

const POLL_INTERVAL_MS = 15000;

// expo-network has no change-listener API (unlike @react-native-community/netinfo),
// so this polls rather than subscribes. It also re-checks whenever the app
// returns to the foreground, so the banner doesn't lag by up to a full poll
// interval right when it matters most — e.g. reopening the app after it was
// backgrounded somewhere with no signal.
export function useNetworkStatus() {
  const [connected, setConnected] = useState(true);

  const check = useCallback(() => {
    isOnline().then(setConnected);
  }, []);

  useEffect(() => {
    check();
    const interval = setInterval(check, POLL_INTERVAL_MS);
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') check();
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [check]);

  return connected;
}
