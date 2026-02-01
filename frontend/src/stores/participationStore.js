import { create } from 'zustand';
import { apiFetch } from '../lib/api';

const msg = (err, fallback) => err?.message || fallback;

export const useParticipationStore = create((set) => ({
  items: [],
  page: 1,
  totalPages: 1,
  total: 0,
  isLoading: false,
  error: null,

  clearMessages: () => set({ error: null }),

  // GET /api/auctions/participating?status=active&page=1&limit=12
  fetchMyParticipatingAuctions: async ({
    status = 'active',
    page = 1,
    limit = 12,
  } = {}) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch(
        `/api/auctions/participating?status=${encodeURIComponent(status)}&page=${page}&limit=${limit}`,
        { method: 'GET' },
      );

      set({
        items: data.items || [],
        page: data.page || 1,
        totalPages: data.totalPages || 1,
        total: data.total || 0,
        isLoading: false,
      });

      return data;
    } catch (err) {
      set({
        items: [],
        isLoading: false,
        error: msg(err, 'Failed to fetch participating auctions'),
      });
      return null;
    }
  },
}));