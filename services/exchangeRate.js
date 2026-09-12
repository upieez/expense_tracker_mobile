import AsyncStorage from "@react-native-async-storage/async-storage";

export const RATE_CACHE_KEY = "@expense-tracker/exchange-rate-cache:v1";
const BASE_CURRENCY = "USD";

const SYMBOL_TO_CODE = { $: "USD", "£": "GBP", "€": "EUR", "¥": "JPY" };

export function currencyCodeForSymbol(symbol) {
  return SYMBOL_TO_CODE[symbol] ?? BASE_CURRENCY;
}

function todayStamp(now) {
  return now.toISOString().slice(0, 10);
}

async function readCache() {
  try {
    const raw = await AsyncStorage.getItem(RATE_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function writeCache(entry) {
  await AsyncStorage.setItem(RATE_CACHE_KEY, JSON.stringify(entry)).catch(
    () => {},
  );
}

export async function getExchangeRate(
  currencyCode,
  { fetchImpl = globalThis.fetch, now = new Date() } = {},
) {
  if (currencyCode === BASE_CURRENCY) {
    return {
      code: BASE_CURRENCY,
      rate: 1,
      date: todayStamp(now),
      stale: false,
    };
  }

  const stamp = todayStamp(now);
  const cached = await readCache();
  if (cached && cached.code === currencyCode && cached.date === stamp) {
    return { ...cached, stale: false };
  }

  try {
    const res = await fetchImpl(
      `https://api.frankfurter.app/latest?from=${BASE_CURRENCY}&to=${currencyCode}`,
    );
    if (!res.ok) throw new Error(`exchange rate request failed: ${res.status}`);
    const data = await res.json();
    const rate = data?.rates?.[currencyCode];
    if (typeof rate !== "number")
      throw new Error("unexpected exchange rate response shape");
    const entry = { code: currencyCode, rate, date: stamp };
    await writeCache(entry);
    return { ...entry, stale: false };
  } catch (e) {
    if (cached && cached.code === currencyCode) {
      return { ...cached, stale: true };
    }
    return null;
  }
}
