import { Alert } from 'react-native';
import { render, screen, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from '../screens/HomeScreen';
import { ExpensesProvider } from '../store/ExpensesContext';
import { SettingsProvider } from '../store/SettingsContext';
import { STORAGE_KEY } from '../services/expenseStorage';

async function renderHome() {
  const navigation = { navigate: jest.fn() };
  await render(
    <SettingsProvider>
      <ExpensesProvider>
        <HomeScreen navigation={navigation} />
      </ExpensesProvider>
    </SettingsProvider>
  );
  return { navigation };
}

const thisMonthISO = (day) => {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${mm}-${String(day).padStart(2, '0')}`;
};

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('HomeScreen — empty state', () => {
  it('shows the empty state and a zero total when there is no data', async () => {
    await renderHome();
    await waitFor(() => expect(screen.getByText('No expenses yet')).toBeOnTheScreen());
    expect(screen.getByText('$0.00')).toBeOnTheScreen();
  });
});

describe('HomeScreen — with data', () => {
  const seed = [
    { id: 'a', amount: 10, categoryId: 'food', date: thisMonthISO(1), note: '', photoUri: null, createdAt: 1, updatedAt: 1 },
    { id: 'b', amount: 20.5, categoryId: 'transport', date: thisMonthISO(2), note: '', photoUri: null, createdAt: 2, updatedAt: 2 },
  ];

  it('renders rows and sums the running total for this month', async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    await renderHome();

    await waitFor(() => expect(screen.getByText('$30.50')).toBeOnTheScreen());
    expect(screen.getByText('Food & Drink')).toBeOnTheScreen();
    expect(screen.getByText('Transport')).toBeOnTheScreen();
    expect(screen.queryByText('No expenses yet')).toBeNull();
  });

  it('shows the long-press-to-delete hint once there is at least one expense', async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    await renderHome();
    await waitFor(() => expect(screen.getByText('Long-press an expense to delete it')).toBeOnTheScreen());
  });

  it('does not show the delete hint on the empty state', async () => {
    await renderHome();
    await waitFor(() => expect(screen.getByText('No expenses yet')).toBeOnTheScreen());
    expect(screen.queryByText('Long-press an expense to delete it')).toBeNull();
  });

  it('navigates to AddExpense in edit mode when a row is tapped', async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    const { navigation } = await renderHome();
    await waitFor(() => expect(screen.getByText('Food & Drink')).toBeOnTheScreen());

    const { userEvent } = require('@testing-library/react-native');
    const user = userEvent.setup();
    await user.press(screen.getByRole('button', { name: /Food & Drink expense/ }));

    expect(navigation.navigate).toHaveBeenCalledWith('AddExpense', {
      expense: expect.objectContaining({ id: 'a' }),
    });
  });

  it('removes an expense after long-press + confirming delete', async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    await renderHome();
    await waitFor(() => expect(screen.getByText('Food & Drink')).toBeOnTheScreen());

    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation((title, message, buttons) => {
      const deleteButton = buttons.find((b) => b.text === 'Delete');
      deleteButton.onPress();
    });

    const { userEvent } = require('@testing-library/react-native');
    const user = userEvent.setup();
    await user.longPress(screen.getByRole('button', { name: /Food & Drink expense/ }));

    await waitFor(() => expect(screen.queryByText('Food & Drink')).toBeNull());
    expect(screen.getByText('Transport')).toBeOnTheScreen();
    alertSpy.mockRestore();
  });

  it('taps the FAB to open Add Expense', async () => {
    const { navigation } = await renderHome();
    await waitFor(() => expect(screen.getByText('No expenses yet')).toBeOnTheScreen());

    const { userEvent } = require('@testing-library/react-native');
    const user = userEvent.setup();
    await user.press(screen.getByLabelText('Add expense'));

    expect(navigation.navigate).toHaveBeenCalledWith('AddExpense');
  });
});
