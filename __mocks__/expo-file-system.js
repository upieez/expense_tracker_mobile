// Manual mock for expo-file-system (native module, unsafe under Jest).
const documentDirectory = 'file:///mock-documents/';
const getInfoAsync = jest.fn().mockResolvedValue({ exists: false });
const makeDirectoryAsync = jest.fn().mockResolvedValue(undefined);
const copyAsync = jest.fn().mockResolvedValue(undefined);
const deleteAsync = jest.fn().mockResolvedValue(undefined);

module.exports = {
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
  copyAsync,
  deleteAsync,
};
