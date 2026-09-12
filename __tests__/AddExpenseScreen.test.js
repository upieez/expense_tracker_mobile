import { Text, Alert } from 'react-native';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import { ExpensesProvider, useExpenses } from '../store/ExpensesContext';
import { SettingsProvider } from '../store/SettingsContext';
import { STORAGE_KEY } from '../services/expenseStorage';

function ExposedState() {
  const { expenses } = useExpenses();
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  return (
    <>
      <Text testID="count">{expenses.length}</Text>
      <Text testID="total">{total}</Text>
      <Text testID="photoUri">{expenses[0]?.photoUri ?? ''}</Text>
    </>
  );
}

async function renderScreen(routeParams) {
  const navigation = { goBack: jest.fn() };
  await render(
    <SettingsProvider>
      <ExpensesProvider>
        <ExposedState />
        <AddExpenseScreen navigation={navigation} route={{ params: routeParams }} />
      </ExpensesProvider>
    </SettingsProvider>
  );
  return { navigation };
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('AddExpenseScreen — add mode', () => {
  it('disables Save until an amount and a category are chosen', async () => {
    const user = userEvent.setup();
    await renderScreen();

    const save = screen.getByRole('button', { name: 'Save Expense' });
    expect(save.props.accessibilityState.disabled).toBe(true);

    await user.type(screen.getByLabelText('Amount'), '8.50');
    expect(save.props.accessibilityState.disabled).toBe(true);

    await user.press(screen.getByRole('button', { name: 'Food & Drink' }));
    expect(save.props.accessibilityState.disabled).toBe(false);
  });

  it('rejects zero as an invalid amount', async () => {
    const user = userEvent.setup();
    await renderScreen();

    await user.type(screen.getByLabelText('Amount'), '0');
    await user.press(screen.getByRole('button', { name: 'Transport' }));
    expect(screen.getByRole('button', { name: 'Save Expense' }).props.accessibilityState.disabled).toBe(true);
  });

  it('saves a new expense and navigates back', async () => {
    const user = userEvent.setup();
    const { navigation } = await renderScreen();

    await user.type(screen.getByLabelText('Amount'), '12.50');
    await user.press(screen.getByRole('button', { name: 'Groceries' }));
    await user.type(screen.getByLabelText('Note'), 'Weekly shop');
    await user.press(screen.getByRole('button', { name: 'Save Expense' }));

    expect(screen.getByTestId('count').props.children).toBe(1);
    expect(navigation.goBack).toHaveBeenCalledTimes(1);
  });
});

describe('AddExpenseScreen — discard confirmation', () => {
  it('closes immediately with no prompt when nothing has been entered', async () => {
    const user = userEvent.setup();
    const { navigation } = await renderScreen();

    await user.press(screen.getByLabelText('Close'));

    expect(navigation.goBack).toHaveBeenCalledTimes(1);
  });

  it('prompts to discard when there are unsaved changes, and keeps the form open on cancel', async () => {
    const user = userEvent.setup();
    const { navigation } = await renderScreen();
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
      buttons.find((b) => b.text === 'Keep editing').onPress?.();
    });

    await user.type(screen.getByLabelText('Amount'), '4');
    await user.press(screen.getByLabelText('Close'));

    expect(alertSpy).toHaveBeenCalledWith(
      'Discard changes?',
      expect.any(String),
      expect.any(Array)
    );
    expect(navigation.goBack).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('navigates back when the user confirms discarding', async () => {
    const user = userEvent.setup();
    const { navigation } = await renderScreen();
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
      buttons.find((b) => b.text === 'Discard').onPress();
    });

    await user.press(screen.getByRole('button', { name: 'Groceries' }));
    await user.press(screen.getByLabelText('Close'));

    expect(navigation.goBack).toHaveBeenCalledTimes(1);
    alertSpy.mockRestore();
  });

  it('in edit mode, closes without a prompt when nothing was changed', async () => {
    const existing = {
      id: 'exp_9',
      amount: 10,
      categoryId: 'food',
      date: '2026-08-10',
      note: '',
      photoUri: null,
      createdAt: 1,
      updatedAt: 1,
    };
    const user = userEvent.setup();
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { navigation } = await renderScreen({ expense: existing });

    await user.press(screen.getByLabelText('Close'));

    expect(alertSpy).not.toHaveBeenCalled();
    expect(navigation.goBack).toHaveBeenCalledTimes(1);
    alertSpy.mockRestore();
  });
});

describe('AddExpenseScreen — receipt photo', () => {
  it('opens the camera and shows a preview once a photo is captured', async () => {
    const user = userEvent.setup();
    await renderScreen();

    await user.press(screen.getByRole('button', { name: 'Add receipt photo' }));
    await user.press(screen.getByLabelText('Take photo'));

    await waitFor(() =>
      expect(screen.getByLabelText('Receipt photo, tap to retake or remove')).toBeOnTheScreen()
    );
    expect(screen.queryByRole('button', { name: 'Add receipt photo' })).toBeNull();
  });

  it('includes the captured photo uri when the expense is saved', async () => {
    const user = userEvent.setup();
    await renderScreen();

    await user.press(screen.getByRole('button', { name: 'Add receipt photo' }));
    await user.press(screen.getByLabelText('Take photo'));
    await waitFor(() =>
      expect(screen.getByLabelText('Receipt photo, tap to retake or remove')).toBeOnTheScreen()
    );

    await user.type(screen.getByLabelText('Amount'), '5');
    await user.press(screen.getByRole('button', { name: 'Entertainment' }));
    await user.press(screen.getByRole('button', { name: 'Save Expense' }));

    await waitFor(() =>
      expect(screen.getByTestId('photoUri').props.children).toMatch(/^file:\/\/\/mock-documents\/receipts\//)
    );
  });

  it('offers retake/remove once a photo is attached, and removing clears it', async () => {
    const user = userEvent.setup();
    await renderScreen();

    await user.press(screen.getByRole('button', { name: 'Add receipt photo' }));
    await user.press(screen.getByLabelText('Take photo'));
    await waitFor(() =>
      expect(screen.getByLabelText('Receipt photo, tap to retake or remove')).toBeOnTheScreen()
    );

    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
      const removeButton = buttons.find((b) => b.text === 'Remove');
      removeButton.onPress();
    });

    await user.press(screen.getByLabelText('Receipt photo, tap to retake or remove'));

    expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Add receipt photo' })).toBeOnTheScreen());
    alertSpy.mockRestore();
  });
});

describe('AddExpenseScreen — edit mode', () => {
  const existing = {
    id: 'exp_1',
    amount: 25,
    categoryId: 'bills',
    date: '2026-08-10',
    note: 'Electricity',
    photoUri: null,
    createdAt: 1,
    updatedAt: 1,
  };

  it('pre-fills fields and shows the edit title/button', async () => {
    await renderScreen({ expense: existing });
    expect(screen.getByText('Edit Expense')).toBeOnTheScreen();
    expect(screen.getByLabelText('Amount').props.value).toBe('25');
    expect(screen.getByLabelText('Note').props.value).toBe('Electricity');
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeOnTheScreen();
  });

  it('updates the existing expense in place rather than adding a new one', async () => {
    const user = userEvent.setup();

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([existing]));

    await renderScreen({ expense: existing });
    await waitFor(() => expect(screen.getByTestId('count').props.children).toBe(1));

    const amountInput = screen.getByLabelText('Amount');
    await user.clear(amountInput);
    await user.type(amountInput, '30');
    await user.press(screen.getByRole('button', { name: 'Save Changes' }));

    expect(screen.getByTestId('count').props.children).toBe(1);
    expect(screen.getByTestId('total').props.children).toBe(30);
  });
});
