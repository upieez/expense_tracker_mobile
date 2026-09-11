import { expensesReducer, initialState } from '../store/expensesReducer';

const exp = (id) => ({ id, amount: 5, categoryId: 'food', date: '2026-08-16', createdAt: 1, updatedAt: 1 });

describe('expensesReducer', () => {
  it('hydrates and flips the hydrated flag', () => {
    const next = expensesReducer(initialState, { type: 'hydrate', expenses: [exp('a')] });
    expect(next.hydrated).toBe(true);
    expect(next.expenses).toHaveLength(1);
  });

  it('adds newest-first', () => {
    let s = expensesReducer(initialState, { type: 'add', expense: exp('a') });
    s = expensesReducer(s, { type: 'add', expense: exp('b') });
    expect(s.expenses.map((e) => e.id)).toEqual(['b', 'a']);
  });

  it('updates the matching expense only', () => {
    let s = expensesReducer(initialState, { type: 'hydrate', expenses: [exp('a'), exp('b')] });
    s = expensesReducer(s, { type: 'update', expense: { ...exp('a'), amount: 99 } });
    expect(s.expenses.find((e) => e.id === 'a').amount).toBe(99);
    expect(s.expenses.find((e) => e.id === 'b').amount).toBe(5);
  });

  it('removes by id and clears', () => {
    let s = expensesReducer(initialState, { type: 'hydrate', expenses: [exp('a'), exp('b')] });
    s = expensesReducer(s, { type: 'remove', id: 'a' });
    expect(s.expenses.map((e) => e.id)).toEqual(['b']);
    s = expensesReducer(s, { type: 'clear' });
    expect(s.expenses).toEqual([]);
  });

  it('does not mutate previous state', () => {
    const before = expensesReducer(initialState, { type: 'hydrate', expenses: [exp('a')] });
    const frozen = JSON.stringify(before);
    expensesReducer(before, { type: 'add', expense: exp('b') });
    expensesReducer(before, { type: 'remove', id: 'a' });
    expect(JSON.stringify(before)).toBe(frozen);
  });

  it('returns state unchanged for unknown actions', () => {
    expect(expensesReducer(initialState, { type: 'nope' })).toBe(initialState);
  });
});
