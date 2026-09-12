import {
  roundCents,
  sumAmounts,
  filterByMonth,
  totalForMonth,
  groupIntoDaySections,
  totalsByCategory,
  monthsWithData,
  largestExpense,
} from '../store/selectors';

const exp = (id, amount, date, categoryId = 'food', createdAt = 1) => ({
  id,
  amount,
  categoryId,
  date,
  createdAt,
  updatedAt: createdAt,
});

describe('money maths', () => {
  it('rounds to cents', () => {
    expect(roundCents(0.1 + 0.2)).toBe(0.3);
  });
  it('sums without floating point drift', () => {
    const items = [exp('a', 0.1, '2026-08-01'), exp('b', 0.2, '2026-08-01'), exp('c', 0.3, '2026-08-01')];
    expect(sumAmounts(items)).toBe(0.6);
  });
  it('sums empty to zero', () => {
    expect(sumAmounts([])).toBe(0);
  });
});

describe('month filtering', () => {
  const items = [
    exp('a', 10, '2026-08-16'),
    exp('b', 20, '2026-08-01'),
    exp('c', 30, '2026-07-31'),
    exp('d', 40, '2025-08-16'),
  ];
  it('filters by year and month', () => {
    expect(filterByMonth(items, 2026, 7).map((e) => e.id)).toEqual(['a', 'b']);
  });
  it('totals a single month only', () => {
    expect(totalForMonth(items, 2026, 7)).toBe(30);
    expect(totalForMonth(items, 2026, 6)).toBe(30);
    expect(totalForMonth(items, 2026, 0)).toBe(0);
  });
});

describe('groupIntoDaySections', () => {
  it('groups by day, days newest-first, items newest-logged-first within a day', () => {
    const items = [
      exp('a', 1, '2026-08-15', 'food', 100),
      exp('b', 2, '2026-08-16', 'food', 200),
      exp('c', 3, '2026-08-16', 'food', 300),
    ];
    const sections = groupIntoDaySections(items);
    expect(sections.map((s) => s.title)).toEqual(['2026-08-16', '2026-08-15']);
    expect(sections[0].data.map((e) => e.id)).toEqual(['c', 'b']);
  });
  it('returns no sections for no data', () => {
    expect(groupIntoDaySections([])).toEqual([]);
  });
});

describe('totalsByCategory', () => {
  it('aggregates, sorts largest-first and computes shares', () => {
    const items = [
      exp('a', 30, '2026-08-01', 'food'),
      exp('b', 10, '2026-08-02', 'transport'),
      exp('c', 60, '2026-08-03', 'bills'),
    ];
    const totals = totalsByCategory(items);
    expect(totals.map((t) => t.categoryId)).toEqual(['bills', 'food', 'transport']);
    expect(totals[0].share).toBeCloseTo(0.6);
    expect(totals[2].share).toBeCloseTo(0.1);
  });
  it('handles a single category taking 100%', () => {
    const totals = totalsByCategory([exp('a', 5, '2026-08-01', 'food')]);
    expect(totals).toHaveLength(1);
    expect(totals[0].share).toBe(1);
  });
  it('returns empty for no data', () => {
    expect(totalsByCategory([])).toEqual([]);
  });
});

describe('monthsWithData', () => {
  it('lists distinct months newest-first', () => {
    const items = [
      exp('a', 1, '2026-07-01'),
      exp('b', 1, '2026-08-16'),
      exp('c', 1, '2026-08-01'),
      exp('d', 1, '2025-12-31'),
    ];
    expect(monthsWithData(items)).toEqual([
      { year: 2026, monthIndex: 7 },
      { year: 2026, monthIndex: 6 },
      { year: 2025, monthIndex: 11 },
    ]);
  });
});

describe('largestExpense', () => {
  it('finds the largest and returns null for empty', () => {
    const items = [exp('a', 5, '2026-08-01'), exp('b', 50, '2026-08-02'), exp('c', 20, '2026-08-03')];
    expect(largestExpense(items).id).toBe('b');
    expect(largestExpense([])).toBeNull();
  });
});
