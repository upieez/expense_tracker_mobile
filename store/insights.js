

import { totalsByCategory, totalForMonth, largestExpense, filterByMonth } from './selectors';
import { getCategory } from '../constants/categories';
import { formatCurrency, parseISODate } from '../utils/format';

function pctChange(current, previous) {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export function topCategoryInsight(monthExpenses) {
  const totals = totalsByCategory(monthExpenses);
  if (totals.length === 0) return null;
  const top = totals[0];
  if (top.share < 0.3) return null;
  const category = getCategory(top.categoryId);
  return `${category.label} is ${Math.round(top.share * 100)}% of your spending this month.`;
}

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

export function biggestExpenseInsight(monthExpenses) {
  const biggest = largestExpense(monthExpenses);
  if (!biggest) return null;
  const category = getCategory(biggest.categoryId);
  return `Your biggest expense this month was ${formatCurrency(biggest.amount)} on ${category.label}.`;
}

export function weekendSkewInsight(monthExpenses) {
  if (monthExpenses.length < 4) return null;
  let weekend = 0;
  let weekday = 0;
  for (const e of monthExpenses) {
    const day = parseISODate(e.date).getDay();
    if (day === 0 || day === 6) weekend += e.amount;
    else weekday += e.amount;
  }
  const total = weekend + weekday;
  if (total === 0) return null;
  const weekendShare = weekend / total;
  if (weekendShare < 0.5) return null;
  return `You spend more on weekends — they make up ${Math.round(weekendShare * 100)}% of this month's total.`;
}

export function transactionCountInsight(monthExpenses) {
  if (monthExpenses.length === 0) return null;
  return `You logged ${monthExpenses.length} expense${monthExpenses.length === 1 ? '' : 's'} this month.`;
}

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
