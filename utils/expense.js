import { toISODate } from './format';

let counter = 0;

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

export function withUpdates(expense, changes, now = new Date()) {
  return { ...expense, ...changes, id: expense.id, createdAt: expense.createdAt, updatedAt: now.getTime() };
}
