import { create } from 'zustand';
import { apiFetch } from '../lib/api';

const msg = (err, fallback) => err?.message || fallback;

export const useBidsStore = create((set, get) => ({
  bids: [],
  auctionMeta: null,
  isLoading: false,
  error: null,
  success: null,

  clearMessages: () => set({ error: null, success: null }),
  clearError: () => set({ error: null }),
  clearSuccess: () => set({ success: null }),

  // BUYER
  // POST /api/bids  Body: { auctionId, amount }
  placeBid: async ({ auctionId, amount }) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const data = await apiFetch('/api/bids', {
        method: 'POST',
        body: JSON.stringify({ auctionId, amount }),
      });

      set({ isLoading: false, success: 'Bid placed successfully' });
      return data;
    } catch (err) {
      set({ isLoading: false, error: msg(err, 'Failed to place bid') });
      return null;
    }
  },

  // ADMIN OR SELLER
  // GET /api/bids?auctionId=123
  fetchBidsByAuction: async (auctionId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch(`/api/bids?auctionId=${auctionId}`, {
        method: 'GET',
      });

      set({
        bids: data.bids || [],
        auctionMeta: data.auction || null,
        isLoading: false,
      });

      return data;
    } catch (err) {
      set({
        bids: [],
        auctionMeta: null,
        isLoading: false,
        error: msg(err, 'Failed to fetch bids'),
      });
      return null;
    }
  },

  // GET /api/bids/me?auctionId=123
  fetchMyBidForAuction: async (auctionId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch(`/api/bids/me?auctionId=${auctionId}`, {
        method: 'GET',
      });

      set((s) => ({
        isLoading: false,
        myBidByAuction: { ...(s.myBidByAuction || {}), [auctionId]: data.bid },
      }));

      return data.bid;
    } catch (err) {
      set({ isLoading: false, error: err.message || 'Failed to fetch my bid' });
      return null;
    }
  },
}));
