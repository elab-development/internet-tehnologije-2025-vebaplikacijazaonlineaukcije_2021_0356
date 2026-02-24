import { create } from 'zustand';
import {
  SUPPORTED_CURRENCIES,
  fetchRates,
  formatFromUSD,
  loadCurrencyPrefs,
  saveCurrencyPrefs,
  loadRatesCache,
  saveRatesCache,
  toUSD,
} from '../lib/currency';

const TTL_MS = 6 * 60 * 60 * 1000; // 6h cache

export const useCurrencyStore = create((set, get) => ({
  base: 'USD', // u bazi
  currency: 'USD',

  rates: {}, // rates za USD (1 USD -> X currency)
  fetchedAt: 0,

  isLoading: false,
  error: null,

  supported: SUPPORTED_CURRENCIES,

  clearError: () => set({ error: null }),

  init: async () => {
    // prefs
    const prefs = loadCurrencyPrefs();
    const prefCurrency = prefs?.currency;
    if (prefCurrency && SUPPORTED_CURRENCIES.includes(prefCurrency)) {
      set({ currency: prefCurrency });
    }

    // rates cache
    const cached = loadRatesCache();
    if (cached?.rates) {
      set({ rates: cached.rates, fetchedAt: cached.fetchedAt || 0 });
    }

    // refresh if stale or empty
    const { fetchedAt, rates } = get();
    const stale = !fetchedAt || Date.now() - fetchedAt > TTL_MS;
    const empty = !rates || Object.keys(rates).length === 0;

    if (stale || empty) {
      await get().refreshRates();
    }
  },

  setCurrency: (currency) => {
    const c = String(currency || '').toUpperCase();
    if (!SUPPORTED_CURRENCIES.includes(c)) return;

    set({ currency: c });
    saveCurrencyPrefs({ currency: c });
  },

  refreshRates: async () => {
    set({ isLoading: true, error: null });
    try {
      const { rates } = await fetchRates('USD');

      // obezbedi da USD uvek radi
      const nextRates = { ...rates, USD: 1 };

      set({ rates: nextRates, fetchedAt: Date.now(), isLoading: false });
      saveRatesCache({ rates: nextRates, fetchedAt: Date.now() });
      return nextRates;
    } catch (err) {
      set({
        isLoading: false,
        error: err?.message || 'Failed to refresh rates',
      });
      return null;
    }
  },

  // Helpers (za celu aplikaciju)
  formatUSD: (usd, { locale } = {}) => {
    const { currency, rates } = get();
    return formatFromUSD(usd, { currency, rates, locale });
  },

  // Konverzija user input -> USD (npr. bid ili startingPrice)
  inputToUSD: (amount) => {
    const { currency, rates } = get();
    return toUSD(amount, { currency, rates });
  },
}));