import { create } from 'zustand';
import { apiFetch } from '../lib/api';

const getErrMessage = (err, fallback) => err?.message || fallback;

export const useAdminStatsStore = create((set) => ({
  stats: null,

  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  // GET /api/admin/stats?days=30
  fetchStats: async (days = 30) => {
    set({ isLoading: true, error: null });

    try {
      const data = await apiFetch(`/api/admin/stats?days=${days}`, {
        method: 'GET',
      });

      set({
        stats: data,
        isLoading: false,
      });

      return data;
    } catch (err) {
      set({
        isLoading: false,
        error: getErrMessage(err, 'Failed to fetch admin stats'),
      });
      return null;
    }
  },
}));