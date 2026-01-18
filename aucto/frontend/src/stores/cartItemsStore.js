import { create } from 'zustand';
import { apiFetch } from '../lib/api';

const msg = (err, fallback) => err?.message || fallback;

export const useCartItemsStore = create((set, get) => ({
  items: [],
  cartItem: null,

  page: 1,
  limit: 12,
  total: 0,
  totalPages: 1,

  isLoading: false,
  error: null,
  success: null,

  clearMessages: () => set({ error: null, success: null }),
  clearError: () => set({ error: null }),
  clearSuccess: () => set({ success: null }),
  clearCartItem: () => set({ cartItem: null }),

  /**
   * AUTH
   * GET /api/cart-items
   *
   * Query:
   * - buyerId (admin only)
   * - sortBy: finalPrice | addedAt
   * - sortOrder: asc | desc
   * - page, limit
   */
  fetchCartItems: async ({
    buyerId,
    sortBy = 'addedAt',
    sortOrder = 'desc',
    page = 1,
    limit = 12,
  } = {}) => {
    set({ isLoading: true, error: null, success: null });

    try {
      const qs = new URLSearchParams();
      if (buyerId !== undefined && buyerId !== null && buyerId !== '')
        qs.set('buyerId', String(buyerId));
      if (sortBy) qs.set('sortBy', String(sortBy));
      if (sortOrder) qs.set('sortOrder', String(sortOrder));
      qs.set('page', String(page));
      qs.set('limit', String(limit));

      const data = await apiFetch(`/api/cart-items?${qs.toString()}`, {
        method: 'GET',
      });

      set({
        items: data.items || [],
        page: data.page ?? page,
        limit: data.limit ?? limit,
        total: data.total ?? 0,
        totalPages: data.totalPages ?? 1,
        isLoading: false,
      });

      return data;
    } catch (err) {
      set({
        items: [],
        cartItem: null,
        page: 1,
        limit,
        total: 0,
        totalPages: 1,
        isLoading: false,
        error: msg(err, 'Failed to fetch cart items'),
      });
      return null;
    }
  },

  /**
   * AUTH
   * GET /api/cart-items/:id
   */
  fetchCartItemById: async (id) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const data = await apiFetch(`/api/cart-items/${id}`, { method: 'GET' });
      set({ cartItem: data.cartItem || null, isLoading: false });
      return data.cartItem || null;
    } catch (err) {
      set({
        cartItem: null,
        isLoading: false,
        error: msg(err, 'Failed to fetch cart item'),
      });
      return null;
    }
  },
}));
