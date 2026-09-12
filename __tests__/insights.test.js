import {
  topCategoryInsight,
  monthOverMonthInsight,
  biggestExpenseInsight,
  weekendSkewInsight,
  transactionCountInsight,
  generateInsights,
} from '../store/insights';

const exp = (id, amount, date, categoryId = 'food') => ({
  id,
  amount,
  categoryId,
  date,
  createdAt: 1,
  updatedAt: 1,
});

describe('topCategoryInsight', () => {
  it('names the dominant category when it is a large share', () => {
    const items = [exp('a', 30, '2026-08-01', 'food'), exp('b', 10, '2026-08-02', 'transport')];
    expect(topCategoryInsight(items)).toBe('Food & Drink is 75% of your spending this month.');
  });
  it('stays quiet when no category dominates', () => {

    const items = [
      exp('a', 10, '2026-08-01', 'food'),
      exp('b', 10, '2026-08-02', 'transport'),
      exp('c', 10, '2026-08-03', 'bills'),
      exp('d', 10, '2026-08-04', 'health'),
    ];
    expect(topCategoryInsight(items)).toBeNull();
  });
  it('returns null for no data', () => {
    expect(topCategoryInsight([])).toBeNull();
  });
});

describe('monthOverMonthInsight', () => {
  it('reports a meaningful increase', () => {
    const items = [exp('a', 100, '2026-08-01'), exp('b', 50, '2026-07-01')];
    expect(monthOverMonthInsight(items, 2026, 7)).toBe("You've spent 100% more than last month.");
  });
  it('reports a meaningful decrease', () => {
    const items = [exp('a', 50, '2026-08-01'), exp('b', 100, '2026-07-01')];
    expect(monthOverMonthInsight(items, 2026, 7)).toBe("You've spent 50% less than last month.");
  });
  it('ignores small swings under 5%', () => {
    const items = [exp('a', 102, '2026-08-01'), exp('b', 100, '2026-07-01')];
    expect(monthOverMonthInsight(items, 2026, 7)).toBeNull();
  });
  it('stays quiet with no prior-month data', () => {
    const items = [exp('a', 100, '2026-08-01')];
    expect(monthOverMonthInsight(items, 2026, 7)).toBeNull();
  });
  it('handles the January -> December year rollover', () => {
    const items = [exp('a', 100, '2026-01-05'), exp('b', 50, '2025-12-20')];
    expect(monthOverMonthInsight(items, 2026, 0)).toBe("You've spent 100% more than last month.");
  });
});

describe('biggestExpenseInsight', () => {
  it('names the largest expense and its category', () => {
    const items = [exp('a', 5, '2026-08-01', 'food'), exp('b', 52, '2026-08-02', 'transport')];
    expect(biggestExpenseInsight(items)).toBe('Your biggest expense this month was $52.00 on Transport.');
  });
  it('returns null for no data', () => {
    expect(biggestExpenseInsight([])).toBeNull();
  });
});

describe('weekendSkewInsight', () => {
  it('flags a real weekend skew', () => {

    const items = [
      exp('a', 60, '2026-08-15'),
      exp('b', 40, '2026-08-16'),
      exp('c', 20, '2026-08-17'),
      exp('d', 20, '2026-08-18'),
    ];
    expect(weekendSkewInsight(items)).toMatch(/weekends/);
  });
  it('stays quiet when spending is weekday-dominant', () => {
    const items = [
      exp('a', 10, '2026-08-15'),
      exp('b', 90, '2026-08-17'),
      exp('c', 90, '2026-08-18'),
      exp('d', 90, '2026-08-19'),
    ];
    expect(weekendSkewInsight(items)).toBeNull();
  });
  it('stays quiet with too little data', () => {
    expect(weekendSkewInsight([exp('a', 10, '2026-08-15')])).toBeNull();
  });
});

describe('transactionCountInsight', () => {
  it('reports singular and plural correctly', () => {
    expect(transactionCountInsight([exp('a', 5, '2026-08-01')])).toBe('You logged 1 expense this month.');
    expect(transactionCountInsight([exp('a', 5, '2026-08-01'), exp('b', 5, '2026-08-02')])).toBe(
      'You logged 2 expenses this month.'
    );
  });
  it('returns null for no data', () => {
    expect(transactionCountInsight([])).toBeNull();
  });
});

describe('generateInsights', () => {
  it('gives a friendly prompt for an empty month', () => {
    expect(generateInsights([], 2026, 7)).toEqual(['Log a few expenses this month to see insights here.']);
  });
  it('returns at most 3 insights, most relevant first', () => {
    const items = [
      exp('a', 80, '2026-08-01', 'food'),
      exp('b', 10, '2026-08-02', 'transport'),
      exp('c', 5, '2026-08-03', 'bills'),
      exp('d', 50, '2026-07-01', 'food'),
    ];
    const result = generateInsights(items, 2026, 7);
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThanOrEqual(3);
  });
});
