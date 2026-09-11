import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  STORAGE_KEY,
  getAllExpenses,
  addExpense,
  updateExpense,
  removeExpense,
  clearAllExpenses,
} from '../services/expenseStorage';

const sample = (id, amount) => ({
  id,
  amount,
  categoryId: 'food',
  date: '2026-08-16',
  note: '',
  photoUri: null,
  createdAt: 1,
  updatedAt: 1,
});

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.restoreAllMocks();
});

describe('expenseStorage', () => {
  it('returns an empty list when nothing is stored', async () => {
    expect(await getAllExpenses()).toEqual([]);
  });

  it('adds newest-first and persists', async () => {
    await addExpense(sample('a', 5));
    const after = await addExpense(sample('b', 10));
    expect(after.map((e) => e.id)).toEqual(['b', 'a']);
    expect(await getAllExpenses()).toEqual(after);
  });

  it('updates an expense in place', async () => {
    await addExpense(sample('a', 5));
    await updateExpense({ ...sample('a', 7.5), updatedAt: 2 });
    const all = await getAllExpenses();
    expect(all).toHaveLength(1);
    expect(all[0].amount).toBe(7.5);
  });

  it('removes by id and clears everything', async () => {
    await addExpense(sample('a', 5));
    await addExpense(sample('b', 10));
    await removeExpense('a');
    expect((await getAllExpenses()).map((e) => e.id)).toEqual(['b']);
    await clearAllExpenses();
    expect(await getAllExpenses()).toEqual([]);
  });

  it('survives corrupted stored JSON by starting empty', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    await AsyncStorage.setItem(STORAGE_KEY, 'not valid json {');
    expect(await getAllExpenses()).toEqual([]);
  });

  it('survives stored non-array JSON by starting empty', async () => {
    await AsyncStorage.setItem(STORAGE_KEY, '{"oops": true}');
    expect(await getAllExpenses()).toEqual([]);
  });
});
