// Pure formatting helpers. No React imports — everything here is trivially
// unit-testable (see __tests__/format.test.js).

// 1234.5 -> "1,234.50" (manual grouping keeps behaviour identical across
// JS engines rather than relying on Intl availability in Hermes).
export function formatAmount(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '0.00';
  const [whole, dec] = Math.abs(n).toFixed(2).split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const sign = n < 0 ? '-' : '';
  return `${sign}${grouped}.${dec}`;
}

// (1234.5, "$") -> "$1,234.50"
export function formatCurrency(value, symbol = '$') {
  return `${symbol}${formatAmount(value)}`;
}

// Parse user input like " 12.50 " -> 12.5; returns null when invalid
// (empty, negative, zero, non-numeric, or more than 2 decimal places).
export function parseAmountInput(text) {
  if (typeof text !== 'string') return null;
  const trimmed = text.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  const n = Number(trimmed);
  return n > 0 ? n : null;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "2026-08-16" -> local Date at midnight (avoids UTC parsing surprises).
export function parseISODate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Date -> "2026-08-16" (local time, for storage keys).
export function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// "2026-08-16" -> "Sat, 16 Aug"
export function formatDayHeading(iso) {
  const date = parseISODate(iso);
  return `${DAY_NAMES[date.getDay()]}, ${date.getDate()} ${MONTH_NAMES[date.getMonth()]}`;
}

// "Today" / "Yesterday" / "Sat, 16 Aug". `now` is injectable for tests.
export function dayLabel(iso, now = new Date()) {
  const todayISO = toISODate(now);
  if (iso === todayISO) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (iso === toISODate(yesterday)) return 'Yesterday';
  return formatDayHeading(iso);
}

// (7, 2026) -> "August 2026" (monthIndex is 0-based like Date#getMonth).
const MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export function formatMonthYear(monthIndex, year) {
  return `${MONTH_FULL[monthIndex]} ${year}`;
}
