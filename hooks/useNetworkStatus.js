import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { isOnline } from '../services/network';

const POLL_INTERVAL_MS = 15000;

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
