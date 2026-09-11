import AsyncStorage from '@react-native-async-storage/async-storage';
import { getExchangeRate, currencyCodeForSymbol, RATE_CACHE_KEY } from '../services/exchangeRate';

function fetchOk(rate) {
  return jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ rates: { GBP: rate } }),
  });
}

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('currencyCodeForSymbol', () => {
  it('maps known symbols to ISO currency codes', () => {
    expect(currencyCodeForSymbol('$')).toBe('USD');
    expect(currencyCodeForSymbol('£')).toBe('GBP');
    expect(currencyCodeForSymbol('€')).toBe('EUR');
    expect(currencyCodeForSymbol('¥')).toBe('JPY');
  });

  it('falls back to USD for an unrecognised symbol', () => {
    expect(currencyCodeForSymbol('₹')).toBe('USD');
  });
});

describe('getExchangeRate', () => {
  it('returns a fixed rate of 1 for the base currency without making a request', async () => {
    const fetchImpl = jest.fn();
    const result = await getExchangeRate('USD', { fetchImpl });
    expect(result).toEqual(expect.objectContaining({ code: 'USD', rate: 1, stale: false }));
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('fetches and caches a fresh rate for a non-base currency', async () => {
    const fetchImpl = fetchOk(0.79);
    const now = new Date('2026-08-23T10:00:00Z');
    const result = await getExchangeRate('GBP', { fetchImpl, now });

    expect(result).toEqual({ code: 'GBP', rate: 0.79, date: '2026-08-23', stale: false });
    expect(fetchImpl).toHaveBeenCalledWith(expect.stringContaining('from=USD&to=GBP'));
    expect(JSON.parse(await AsyncStorage.getItem(RATE_CACHE_KEY))).toEqual({
      code: 'GBP',
      rate: 0.79,
      date: '2026-08-23',
    });
  });

  it('reuses the same-day cached value instead of fetching again', async () => {
    const now = new Date('2026-08-23T10:00:00Z');
    await getExchangeRate('GBP', { fetchImpl: fetchOk(0.79), now });

    const secondFetch = jest.fn();
    const result = await getExchangeRate('GBP', { fetchImpl: secondFetch, now: new Date('2026-08-23T18:00:00Z') });

    expect(result).toEqual({ code: 'GBP', rate: 0.79, date: '2026-08-23', stale: false });
    expect(secondFetch).not.toHaveBeenCalled();
  });

  it('fetches again once the cached date has passed', async () => {
    await getExchangeRate('GBP', { fetchImpl: fetchOk(0.79), now: new Date('2026-08-23T10:00:00Z') });

    const nextDayFetch = fetchOk(0.81);
    const result = await getExchangeRate('GBP', { fetchImpl: nextDayFetch, now: new Date('2026-08-24T10:00:00Z') });

    expect(result).toEqual({ code: 'GBP', rate: 0.81, date: '2026-08-24', stale: false });
    expect(nextDayFetch).toHaveBeenCalledTimes(1);
  });

  it('falls back to a stale cached value when the fetch fails', async () => {
    await getExchangeRate('GBP', { fetchImpl: fetchOk(0.79), now: new Date('2026-08-23T10:00:00Z') });

    const failingFetch = jest.fn().mockRejectedValue(new Error('network down'));
    const result = await getExchangeRate('GBP', { fetchImpl: failingFetch, now: new Date('2026-08-24T10:00:00Z') });

    expect(result).toEqual({ code: 'GBP', rate: 0.79, date: '2026-08-23', stale: true });
  });

  it('falls back to a stale value when the response is not ok', async () => {
    await getExchangeRate('GBP', { fetchImpl: fetchOk(0.79), now: new Date('2026-08-23T10:00:00Z') });

    const badResponse = jest.fn().mockResolvedValue({ ok: false, status: 500 });
    const result = await getExchangeRate('GBP', { fetchImpl: badResponse, now: new Date('2026-08-24T10:00:00Z') });

    expect(result).toEqual({ code: 'GBP', rate: 0.79, date: '2026-08-23', stale: true });
  });

  it('returns null when the fetch fails and there is no cache to fall back to', async () => {
    const failingFetch = jest.fn().mockRejectedValue(new Error('network down'));
    const result = await getExchangeRate('GBP', { fetchImpl: failingFetch, now: new Date('2026-08-23T10:00:00Z') });
    expect(result).toBeNull();
  });

  it('returns null when the response shape is unexpected and there is no cache', async () => {
    const weirdResponse = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    const result = await getExchangeRate('GBP', { fetchImpl: weirdResponse, now: new Date('2026-08-23T10:00:00Z') });
    expect(result).toBeNull();
  });
});
