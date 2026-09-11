// Manual mock for expo-network (native module, unsafe under Jest). Defaults
// to "connected" so tests don't have to opt into the common case.
module.exports = {
  getNetworkStateAsync: jest.fn().mockResolvedValue({
    type: 'WIFI',
    isConnected: true,
    isInternetReachable: true,
  }),
};
