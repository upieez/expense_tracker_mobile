import { parseISODate } from '../utils/format';
import { CATEGORIES } from '../constants/categories';

export function roundCents(n) {
  return Math.round(n * 100) / 100;
}

export function sumAmounts(expenses) {
  return roundCents(expenses.reduce((acc, e) => acc + e.amount, 0));
}

export function filterByMonth(expenses, year, monthIndex) {
  return expenses.filter((e) => {
    const d = parseISODate(e.date);
    return d.getFullYear() === year && d.getMonth() === monthIndex;
  });
}

export function totalForMonth(expenses, year, monthIndex) {
  return sumAmounts(filterByMonth(expenses, year, monthIndex));
}

export function groupIntoDaySections(expenses) {
  const byDay = new Map();
  for (const e of expenses) {
    if (!byDay.has(e.date)) byDay.set(e.date, []);
    byDay.get(e.date).push(e);
  }
  return [...byDay.entries()]
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([date, items]) => ({
      title: date,
      data: [...items].sort((x, y) => y.createdAt - x.createdAt),
    }));
}

export function totalsByCategory(expenses) {
  const total = sumAmounts(expenses);
  const byCat = new Map();
  for (const e of expenses) {
    byCat.set(e.categoryId, roundCents((byCat.get(e.categoryId) ?? 0) + e.amount));
  }
  return CATEGORIES.filter((c) => byCat.has(c.id))
    .map((c) => ({
      categoryId: c.id,
      total: byCat.get(c.id),
      share: total > 0 ? byCat.get(c.id) / total : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

export function monthsWithData(expenses) {
  const seen = new Set();
  const out = [];
  for (const e of expenses) {
    const d = parseISODate(e.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push({ year: d.getFullYear(), monthIndex: d.getMonth() });
    }
  }
  return out.sort((a, b) => b.year - a.year || b.monthIndex - a.monthIndex);
}

export function largestExpense(expenses) {
  if (expenses.length === 0) return null;
  return expenses.reduce((max, e) => (e.amount > max.amount ? e : max), expenses[0]);
}
