// Rule-based "spending insights" — the innovation feature. Every rule is a
// pure function over already-computed selector output, so each one is
// independently unit-testable and the orchestrator (generateInsights) just
// picks which ones currently have something worth saying.

import { totalsByCategory, totalForMonth, largestExpense, filterByMonth } from './selectors';
import { getCategory } from '../constants/categories';
import { formatCurrency, parseISODate } from '../utils/format';

function pctChange(current, previous) {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

// "Food & Drink is 42% of your spending this month." — only worth saying
// when one category genuinely dominates (>=30% share).
export function topCategoryInsight(monthExpenses) {
  const totals = totalsByCategory(monthExpenses);
  if (totals.length === 0) return null;
  const top = totals[0];
  if (top.share < 0.3) return null;
  const category = getCategory(top.categoryId);
  return `${category.label} is ${Math.round(top.share * 100)}% of your spending this month.`;
}

// "You've spent 18% more than last month." — needs both months to have
// data, and ignores small swings (<5%) as noise rather than a real signal.
export function monthOverMonthInsight(allExpenses, year, monthIndex) {
  const current = totalForMonth(allExpenses, year, monthIndex);
  const prevMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1;
  const prevYear = monthIndex === 0 ? year - 1 : year;
  const previous = totalForMonth(allExpenses, prevYear, prevMonthIndex);
  if (previous === 0 || current === 0) return null;
  const change = pctChange(current, previous);
  if (change === null || Math.abs(change) < 5) return null;
  const direction = change > 0 ? 'more' : 'less';
  return `You've spent ${Math.abs(Math.round(change))}% ${direction} than last month.`;
}

// "Your biggest expense this month was $52.00 on Transport."
export function biggestExpenseInsight(monthExpenses) {
  const biggest = largestExpense(monthExpenses);
  if (!biggest) return null;
  const category = getCategory(biggest.categoryId);
  return `Your biggest expense this month was ${formatCurrency(biggest.amount)} on ${category.label}.`;
}

// "You spend more on weekends — they make up 61% of this month's total."
// Weekends are 2/7 of days (~29%) at baseline, so >=50% of spend is a real
// skew, not noise. Needs a handful of expenses before it says anything.
export function weekendSkewInsight(monthExpenses) {
  if (monthExpenses.length < 4) return null;
  let weekend = 0;
  let weekday = 0;
  for (const e of monthExpenses) {
    const day = parseISODate(e.date).getDay(); // 0 = Sun, 6 = Sat
    if (day === 0 || day === 6) weekend += e.amount;
    else weekday += e.amount;
  }
  const total = weekend + weekday;
  if (total === 0) return null;
  const weekendShare = weekend / total;
  if (weekendShare < 0.5) return null;
  return `You spend more on weekends — they make up ${Math.round(weekendShare * 100)}% of this month's total.`;
}

// "You logged 14 expenses this month." — low-priority filler so there's
// always something to show once any data exists.
export function transactionCountInsight(monthExpenses) {
  if (monthExpenses.length === 0) return null;
  return `You logged ${monthExpenses.length} expense${monthExpenses.length === 1 ? '' : 's'} this month.`;
}

// Orchestrator: gathers whichever rules currently apply, in priority order,
// and returns up to 3. Never silently returns nothing — an empty month gets
// a friendly prompt instead of a blank card.
export function generateInsights(allExpenses, year, monthIndex) {
  const monthExpenses = filterByMonth(allExpenses, year, monthIndex);
  if (monthExpenses.length === 0) {
    return ['Log a few expenses this month to see insights here.'];
  }
  const candidates = [
    monthOverMonthInsight(allExpenses, year, monthIndex),
    topCategoryInsight(monthExpenses),
    biggestExpenseInsight(monthExpenses),
    weekendSkewInsight(monthExpenses),
    transactionCountInsight(monthExpenses),
  ].filter(Boolean);
  return candidates.slice(0, 3);
}
