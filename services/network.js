import * as Network from "expo-network";

export async function isOnline() {
  try {
    const state = await Network.getNetworkStateAsync();

    return Boolean(state.isConnected) && state.isInternetReachable !== false;
  } catch (e) {
    return true;
  }
}
