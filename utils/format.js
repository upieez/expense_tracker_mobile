export function formatAmount(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0.00";
  const [whole, dec] = Math.abs(n).toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const sign = n < 0 ? "-" : "";
  return `${sign}${grouped}.${dec}`;
}

export function formatCurrency(value, symbol = "$") {
  return `${symbol}${formatAmount(value)}`;
}

export function parseAmountInput(text) {
  if (typeof text !== "string") return null;
  const trimmed = text.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  const n = Number(trimmed);
  return n > 0 ? n : null;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function parseISODate(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatDayHeading(iso) {
  const date = parseISODate(iso);
  return `${DAY_NAMES[date.getDay()]}, ${date.getDate()} ${MONTH_NAMES[date.getMonth()]}`;
}

export function dayLabel(iso, now = new Date()) {
  const todayISO = toISODate(now);
  if (iso === todayISO) return "Today";
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (iso === toISODate(yesterday)) return "Yesterday";
  return formatDayHeading(iso);
}

const MONTH_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export function formatMonthYear(monthIndex, year) {
  return `${MONTH_FULL[monthIndex]} ${year}`;
}
