const STORAGE_KEY = 'aucto_currency_v1';
const RATES_CACHE_KEY = 'aucto_rates_usd_v1';

export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'RSD', 'GBP', 'CHF'];

export function getCurrencySymbol(code) {
  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency: code,
      currencyDisplay: 'narrowSymbol',
    })
      .format(0)
      .replace(/[0-9.,\s]/g, '')
      .trim();
  } catch {
    return code;
  }
}

export function formatFromUSD(
  usd,
  { currency = 'USD', rates = {}, locale = 'en-US' } = {},
) {
  if (usd === null || usd === undefined) return '—';
  const n = Number(usd);
  if (!Number.isFinite(n)) return String(usd);

  const rate = currency === 'USD' ? 1 : Number(rates?.[currency]);
  const converted = Number.isFinite(rate) ? n * rate : n;

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(converted);
  } catch {
    // fallback
    return `${converted.toFixed(2)} ${currency}`;
  }
}

// Ako user unese cenu u izabranoj valuti, a backend očekuje USD
export function toUSD(
  amountInSelectedCurrency,
  { currency = 'USD', rates = {} } = {},
) {
  const n = Number(amountInSelectedCurrency);
  if (!Number.isFinite(n)) return null;

  if (currency === 'USD') return n;

  const rate = Number(rates?.[currency]); // 1 USD -> currency
  if (!Number.isFinite(rate) || rate <= 0) return null;

  return n / rate;
}

export function saveCurrencyPrefs({ currency }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ currency }));
  } catch {
    // ignore
  }
}

export function loadCurrencyPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function loadRatesCache() {
  try {
    const raw = localStorage.getItem(RATES_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw); // { rates, fetchedAt }
  } catch {
    return null;
  }
}

export function saveRatesCache(payload) {
  try {
    localStorage.setItem(RATES_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export async function fetchRates(base = 'USD') {
  // API: https://open.er-api.com/v6/latest/USD
  const url = `https://open.er-api.com/v6/latest/${encodeURIComponent(base)}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch rates (${res.status})`);
  }

  const data = await res.json();

  // očekujemo: { result: "success", base_code, rates: { ... } }
  if (data?.result !== 'success' || !data?.rates) {
    throw new Error(data?.error_type || 'Invalid rates response');
  }

  return {
    base: data.base_code || base,
    rates: data.rates || {},
  };
}