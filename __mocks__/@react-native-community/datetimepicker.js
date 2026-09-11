// Manual mock so Jest never touches the native picker view. Jest auto-applies
// this for any import of '@react-native-community/datetimepicker' because the
// file lives at __mocks__/<package-name>.js relative to the project root.
module.exports = function DateTimePicker() {
  return null;
};
