import {
  formatAmount,
  formatCurrency,
  parseAmountInput,
  parseISODate,
  toISODate,
  formatDayHeading,
  dayLabel,
  formatMonthYear,
} from '../utils/format';

describe('formatAmount', () => {
  it('formats a simple value to 2dp', () => {
    expect(formatAmount(8.5)).toBe('8.50');
  });
  it('groups thousands', () => {
    expect(formatAmount(1234.5)).toBe('1,234.50');
    expect(formatAmount(1234567.89)).toBe('1,234,567.89');
  });
  it('handles zero and negatives', () => {
    expect(formatAmount(0)).toBe('0.00');
    expect(formatAmount(-42.1)).toBe('-42.10');
  });
  it('falls back safely on invalid input', () => {
    expect(formatAmount('not a number')).toBe('0.00');
    expect(formatAmount(undefined)).toBe('0.00');
  });
});

describe('formatCurrency', () => {
  it('prefixes the symbol', () => {
    expect(formatCurrency(12.5)).toBe('$12.50');
    expect(formatCurrency(12.5, 'S$')).toBe('S$12.50');
  });
});

describe('parseAmountInput', () => {
  it('accepts plain and decimal amounts, trimming whitespace', () => {
    expect(parseAmountInput('12')).toBe(12);
    expect(parseAmountInput(' 12.50 ')).toBe(12.5);
  });
  it('rejects zero, negatives and malformed input', () => {
    expect(parseAmountInput('0')).toBeNull();
    expect(parseAmountInput('0.00')).toBeNull();
    expect(parseAmountInput('-5')).toBeNull();
    expect(parseAmountInput('12.345')).toBeNull(); // >2dp
    expect(parseAmountInput('abc')).toBeNull();
    expect(parseAmountInput('')).toBeNull();
    expect(parseAmountInput('1,000')).toBeNull();
  });
});

describe('date helpers', () => {
  it('round-trips ISO dates in local time', () => {
    expect(toISODate(parseISODate('2026-08-16'))).toBe('2026-08-16');
  });
  it('formats a day heading', () => {
    // 16 Aug 2026 is a Sunday
    expect(formatDayHeading('2026-08-16')).toBe('Sun, 16 Aug');
  });
  it('labels today and yesterday relative to an injected now', () => {
    const now = new Date(2026, 7, 16); // 16 Aug 2026
    expect(dayLabel('2026-08-16', now)).toBe('Today');
    expect(dayLabel('2026-08-15', now)).toBe('Yesterday');
    expect(dayLabel('2026-08-10', now)).toBe('Mon, 10 Aug');
  });
  it('handles month boundaries for yesterday', () => {
    const now = new Date(2026, 8, 1); // 1 Sep 2026
    expect(dayLabel('2026-08-31', now)).toBe('Yesterday');
  });
  it('formats month + year', () => {
    expect(formatMonthYear(7, 2026)).toBe('August 2026');
  });
});
