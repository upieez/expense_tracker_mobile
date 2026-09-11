// Manual mock — CameraView is a native view and useCameraPermissions wraps
// a native module; neither can run under Jest. The mock exposes jest.fn()s
// so individual tests can override permission state and capture behavior.
const React = require('react');
const { View } = require('react-native');

const takePictureAsync = jest.fn().mockResolvedValue({ uri: 'file:///mock-camera-capture.jpg' });

const CameraView = React.forwardRef((props, ref) => {
  React.useImperativeHandle(ref, () => ({ takePictureAsync }));
  return React.createElement(View, { testID: 'mock-camera-view', ...props });
});
CameraView.displayName = 'CameraView';

const requestPermission = jest.fn().mockResolvedValue({ granted: true, canAskAgain: true });
const useCameraPermissions = jest.fn(() => [{ granted: true, canAskAgain: true }, requestPermission]);

module.exports = {
  CameraView,
  useCameraPermissions,
  __takePictureAsync: takePictureAsync,
  __requestPermission: requestPermission,
};
