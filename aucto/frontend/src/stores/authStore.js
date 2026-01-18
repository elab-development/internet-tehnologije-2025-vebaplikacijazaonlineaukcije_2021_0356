import { create } from 'zustand';
import { apiFetch } from '../lib/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  // GET /api/auth/me
  fetchMe: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch('/api/auth/me', { method: 'GET' });
      set({ user: data.user || null, isLoading: false });
      return data.user || null;
    } catch (err) {
      if (err?.status === 401) {
        set({ user: null, isLoading: false, error: null });
        return null;
      }
      set({
        isLoading: false,
        error: err.message || 'Failed to fetch session',
      });
      return null;
    }
  },

  // POST /api/auth/register
  register: async ({ fullName, email, password, role }) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ fullName, email, password, role }),
      });

      set({ user: data.user, isLoading: false });
      return data.user;
    } catch (err) {
      set({ isLoading: false, error: err.message || 'Register failed' });
      return null;
    }
  },

  // POST /api/auth/login
  login: async ({ email, password }) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      set({ user: data.user, isLoading: false });
      return data.user;
    } catch (err) {
      set({ isLoading: false, error: err.message || 'Login failed' });
      return null;
    }
  },

  // POST /api/auth/logout
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      set({ error: err.message || 'Logout failed' });
    } finally {
      set({ user: null, isLoading: false });
    }
  },

  isAuthenticated: () => Boolean(get().user),
  hasRole: (role) => get().user?.role === role,
}));
