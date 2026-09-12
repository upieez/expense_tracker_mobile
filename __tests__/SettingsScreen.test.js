import { Alert, Text } from 'react-native';
import { render, screen, userEvent, waitFor, fireEvent } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import SettingsScreen from '../screens/SettingsScreen';
import { ExpensesProvider, useExpenses } from '../store/ExpensesContext';
import { SettingsProvider, useSettings } from '../store/SettingsContext';
import { STORAGE_KEY } from '../services/expenseStorage';

// Sibling component exposing store state, same pattern as the other screen
// test harnesses — lets us assert a setting/action actually reached storage.
function ExposedState() {
  const { expenses } = useExpenses();
  const { currencySymbol, reminderEnabled } = useSettings();
  return (
    <>
      <Text testID="expenseCount">{expenses.length}</Text>
      <Text testID="currency">{currencySymbol}</Text>
      <Text testID="reminder">{String(reminderEnabled)}</Text>
    </>
  );
}

async function renderSettings() {
  await render(
    <SettingsProvider>
      <ExpensesProvider>
        <ExposedState />
        <SettingsScreen />
      </ExpensesProvider>
    </SettingsProvider>
  );
}

beforeEach(async () => {
  await AsyncStorage.clear();
  SecureStore.__reset();
  jest.clearAllMocks();
  Notifications.getPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: true });
  Notifications.requestPermissionsAsync.mockResolvedValue({ granted: true, canAskAgain: true });
});

describe('SettingsScreen', () => {
  it('requests permission, turns the reminder on, and schedules it when granted', async () => {
    await renderSettings();
    await waitFor(() => expect(screen.getByTestId('reminder').props.children).toBe('false'));

    // Switch doesn't respond to a synthetic press the way a Pressable does —
    // its interaction is the platform-level valueChange event.
    fireEvent(screen.getByLabelText('Daily reminder'), 'valueChange', true);

    await waitFor(() => expect(screen.getByTestId('reminder').props.children).toBe('true'));
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({ trigger: { type: 'daily', hour: 20, minute: 0 } })
    );
  });

  it('keeps the reminder off and explains why when permission is denied', async () => {
    Notifications.requestPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: true });
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

    await renderSettings();
    fireEvent(screen.getByLabelText('Daily reminder'), 'valueChange', true);

    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('Notifications disabled', expect.any(String)));
    expect(screen.getByTestId('reminder').props.children).toBe('false');
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('cancels the scheduled reminder when turned off', async () => {
    await renderSettings();
    fireEvent(screen.getByLabelText('Daily reminder'), 'valueChange', true);
    await waitFor(() => expect(screen.getByTestId('reminder').props.children).toBe('true'));

    fireEvent(screen.getByLabelText('Daily reminder'), 'valueChange', false);
    await waitFor(() => expect(screen.getByTestId('reminder').props.children).toBe('false'));
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalled();
  });

  it('shows the device id from SecureStore in the About section', async () => {
    await renderSettings();
    await waitFor(() => expect(screen.getByLabelText('Device ID')).toBeOnTheScreen());
    expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(1);
  });

  it('cycles the currency symbol through presets on tap', async () => {
    const user = userEvent.setup();
    await renderSettings();
    await waitFor(() => expect(screen.getByTestId('currency').props.children).toBe('$'));

    await user.press(screen.getByText('Currency symbol'));
    await waitFor(() => expect(screen.getByTestId('currency').props.children).toBe('£'));

    await user.press(screen.getByText('Currency symbol'));
    await waitFor(() => expect(screen.getByTestId('currency').props.children).toBe('€'));
  });

  it('clears all expenses after confirming', async () => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ id: 'a', amount: 5, categoryId: 'food', date: '2026-08-01', note: '', photoUri: null, createdAt: 1, updatedAt: 1 }])
    );

    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
      buttons.find((b) => b.text === 'Clear').onPress();
    });

    const user = userEvent.setup();
    await renderSettings();
    await waitFor(() => expect(screen.getByTestId('expenseCount').props.children).toBe(1));

    await user.press(screen.getByText('Clear all data'));

    await waitFor(() => expect(screen.getByTestId('expenseCount').props.children).toBe(0));
    alertSpy.mockRestore();
  });
});
