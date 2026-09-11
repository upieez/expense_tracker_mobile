import { toISODate } from './format';

// Expense model factory. Shape stored everywhere in the app:
// {
//   id: string            unique, stable
//   amount: number        > 0, max 2dp
//   categoryId: string    one of constants/categories ids
//   date: 'YYYY-MM-DD'    the day the money was spent (local)
//   note: string          optional, '' when unset
//   photoUri: string|null local uri of the receipt photo (added in phase D)
//   createdAt: number     epoch ms
//   updatedAt: number     epoch ms
// }

let counter = 0;

// Unique enough for a single-device app: time + monotonic counter + random.
export function generateId(now = Date.now()) {
  counter = (counter + 1) % 10000;
  const rand = Math.random().toString(36).slice(2, 8);
  return `exp_${now}_${counter}_${rand}`;
}

export function createExpense({ amount, categoryId, date, note = '', photoUri = null }, now = new Date()) {
  return {
    id: generateId(now.getTime()),
    amount,
    categoryId,
    date: date ?? toISODate(now),
    note,
    photoUri,
    createdAt: now.getTime(),
    updatedAt: now.getTime(),
  };
}

// Returns a copy with changes applied and updatedAt bumped (used by edit mode).
export function withUpdates(expense, changes, now = new Date()) {
  return { ...expense, ...changes, id: expense.id, createdAt: expense.createdAt, updatedAt: now.getTime() };
}
