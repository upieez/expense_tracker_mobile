import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StatsScreen from '../screens/StatsScreen';
import { ExpensesProvider } from '../store/ExpensesContext';
import { SettingsProvider } from '../store/SettingsContext';
import { STORAGE_KEY } from '../services/expenseStorage';

async function renderStats() {
  await render(
    <SettingsProvider>
      <ExpensesProvider>
        <StatsScreen />
      </ExpensesProvider>
    </SettingsProvider>
  );
}

const now = new Date();
const thisMonthISO = (day) => `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
const monthLabel = now.toLocaleString('en-US', { month: 'long' });

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('StatsScreen — empty month', () => {
  it('shows the empty state and no legend when there is no data', async () => {
    await renderStats();
    await waitFor(() => expect(screen.getByText('No stats yet')).toBeOnTheScreen());
  });
});

describe('StatsScreen — with data', () => {
  const seed = [
    { id: 'a', amount: 30, categoryId: 'food', date: thisMonthISO(1), note: '', photoUri: null, createdAt: 1, updatedAt: 1 },
    { id: 'b', amount: 10, categoryId: 'transport', date: thisMonthISO(2), note: '', photoUri: null, createdAt: 2, updatedAt: 2 },
  ];

  it('renders the legend with category totals and an insight', async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    await renderStats();

    await waitFor(() => expect(screen.getByText('Food & Drink')).toBeOnTheScreen());
    expect(screen.getByText('$30.00')).toBeOnTheScreen();
    expect(screen.getByText('Transport')).toBeOnTheScreen();
    expect(screen.getByText('$10.00')).toBeOnTheScreen();
    // Food is 75% of $40 total — clears the 30% threshold for the top-category insight.
    expect(screen.getByText(/Food & Drink is 75% of your spending this month\./)).toBeOnTheScreen();
  });

  it('disables the next-month arrow on the current month', async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    await renderStats();
    await waitFor(() => expect(screen.getByText(new RegExp(monthLabel))).toBeOnTheScreen());

    const nextBtn = screen.getByRole('button', { name: 'Next month' });
    expect(nextBtn.props.accessibilityState.disabled).toBe(true);
  });

  it('navigating to the previous month shows its own (empty) stats', async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    await renderStats();
    await waitFor(() => expect(screen.getByText('Food & Drink')).toBeOnTheScreen());

    const user = userEvent.setup();
    await user.press(screen.getByRole('button', { name: 'Previous month' }));

    await waitFor(() => expect(screen.getByText('No stats yet')).toBeOnTheScreen());
  });

  it('wraps the year correctly when paging back past January', async () => {
    await renderStats();
    await waitFor(() => expect(screen.getByText(new RegExp(monthLabel))).toBeOnTheScreen());

    const user = userEvent.setup();
    const prevBtn = screen.getByRole('button', { name: 'Previous month' });
    // Walk back exactly one full year, one month at a time.
    for (let i = 0; i < 12; i++) {
      // eslint-disable-next-line no-await-in-loop
      await user.press(prevBtn);
    }

    await waitFor(() => expect(screen.getByText(new RegExp(`${monthLabel} ${now.getFullYear() - 1}`))).toBeOnTheScreen());
    // We're in the past now, so paging forward must be allowed again.
    expect(screen.getByRole('button', { name: 'Next month' }).props.accessibilityState.disabled).toBe(false);
  });
});
