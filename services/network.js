import * as Network from 'expo-network';

// This app has no cloud backend by design (see the module scope decision —
// Topic 7 is demonstrated via reachability + a raw HTTP call instead of a
// BaaS), so nothing here ever gates a feature on being online. It exists
// purely to (a) show a reassuring "you're offline" banner, since every
// screen already works fully from local storage, and (b) skip the
// exchange-rate HTTP call in services/exchangeRate.js when there's
// obviously no point attempting it.
export async function isOnline() {
  try {
    const state = await Network.getNetworkStateAsync();
    // isInternetReachable can be `null` on some platforms/simulators when it
    // genuinely can't tell — treat that as "assume reachable" rather than
    // flashing an incorrect offline banner. Only a definite `false`, or no
    // connection at all, counts as offline.
    return Boolean(state.isConnected) && state.isInternetReachable !== false;
  } catch (e) {
    // If the check itself fails, don't assume offline defensively — that
    // would show an incorrect banner more often than a failed real check.
    return true;
  }
}
