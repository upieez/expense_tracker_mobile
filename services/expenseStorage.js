import AsyncStorage from '@react-native-async-storage/async-storage';

// Persistence layer over AsyncStorage. Pure async functions, no React —
// unit-tested in isolation with the official AsyncStorage jest mock.
// All expenses are stored under one versioned key as a JSON array; at this
// app's scale (personal expense log) a single read/write is simpler and
// safer than per-item keys.

export const STORAGE_KEY = '@expense-tracker/expenses:v1';

export async function getAllExpenses() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    // Corrupted data must never crash the app — treat as empty.
    console.warn('expenseStorage: failed to read, starting empty', e);
    return [];
  }
}

async function saveAll(expenses) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

export async function addExpense(expense) {
  const all = await getAllExpenses();
  const next = [expense, ...all];
  await saveAll(next);
  return next;
}

export async function updateExpense(updated) {
  const all = await getAllExpenses();
  const next = all.map((e) => (e.id === updated.id ? updated : e));
  await saveAll(next);
  return next;
}

export async function removeExpense(id) {
  const all = await getAllExpenses();
  const next = all.filter((e) => e.id !== id);
  await saveAll(next);
  return next;
}

export async function clearAllExpenses() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
