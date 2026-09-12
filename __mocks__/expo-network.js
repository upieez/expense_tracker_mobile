

module.exports = {
  getNetworkStateAsync: jest.fn().mockResolvedValue({
    type: 'WIFI',
    isConnected: true,
    isInternetReachable: true,
  }),
};
