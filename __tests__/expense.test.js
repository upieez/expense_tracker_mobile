import { createExpense, withUpdates, generateId } from '../utils/expense';

describe('generateId', () => {
  it('produces unique ids across many calls', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => generateId()));
    expect(ids.size).toBe(1000);
  });
});

describe('createExpense', () => {
  const now = new Date(2026, 7, 16, 12, 30);

  it('fills defaults and stamps timestamps', () => {
    const e = createExpense({ amount: 8.5, categoryId: 'food' }, now);
    expect(e.amount).toBe(8.5);
    expect(e.categoryId).toBe('food');
    expect(e.date).toBe('2026-08-16');
    expect(e.note).toBe('');
    expect(e.photoUri).toBeNull();
    expect(e.createdAt).toBe(now.getTime());
    expect(e.updatedAt).toBe(now.getTime());
    expect(e.id).toMatch(/^exp_/);
  });

  it('respects an explicit date', () => {
    const e = createExpense({ amount: 5, categoryId: 'bills', date: '2026-08-01' }, now);
    expect(e.date).toBe('2026-08-01');
  });
});

describe('withUpdates', () => {
  it('applies changes, bumps updatedAt, and protects id/createdAt', () => {
    const now = new Date(2026, 7, 16);
    const later = new Date(2026, 7, 17);
    const original = createExpense({ amount: 5, categoryId: 'food' }, now);
    const updated = withUpdates(original, { amount: 9, id: 'hacked', createdAt: 0 }, later);
    expect(updated.amount).toBe(9);
    expect(updated.id).toBe(original.id);
    expect(updated.createdAt).toBe(original.createdAt);
    expect(updated.updatedAt).toBe(later.getTime());

    expect(original.amount).toBe(5);
  });
});
