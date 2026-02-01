import { create } from 'zustand';
import { apiFetch } from '../lib/api';

const msg = (err, fallback) => err?.message || fallback;

export const useOrdersStore = create((set, get) => ({
  items: [],
  order: null,

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
  clearOrder: () => set({ order: null }),

  /**
   * AUTH
   * GET /api/orders
   *
   * Query:
   * - buyerId (admin only)
   * - sellerId (admin only)
   * - sortBy: totalPrice | orderDate
   * - sortOrder: asc | desc
   * - page, limit
   */
  fetchOrders: async ({
    buyerId,
    sellerId,
    sortBy = 'orderDate',
    sortOrder = 'desc',
    page = 1,
    limit = 12,
  } = {}) => {
    set({ isLoading: true, error: null, success: null });

    try {
      const qs = new URLSearchParams();
      if (buyerId !== undefined && buyerId !== null && buyerId !== '')
        qs.set('buyerId', String(buyerId));
      if (sellerId !== undefined && sellerId !== null && sellerId !== '')
        qs.set('sellerId', String(sellerId));
      if (sortBy) qs.set('sortBy', String(sortBy));
      if (sortOrder) qs.set('sortOrder', String(sortOrder));
      qs.set('page', String(page));
      qs.set('limit', String(limit));

      const data = await apiFetch(`/api/orders?${qs.toString()}`, {
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
        order: null,
        page: 1,
        limit,
        total: 0,
        totalPages: 1,
        isLoading: false,
        error: msg(err, 'Failed to fetch orders'),
      });
      return null;
    }
  },

  /**
   * AUTH
   * GET /api/orders/:id
   */
  fetchOrderById: async (id) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const data = await apiFetch(`/api/orders/${id}`, { method: 'GET' });
      set({ order: data.order || null, isLoading: false });
      return data.order || null;
    } catch (err) {
      set({
        order: null,
        isLoading: false,
        error: msg(err, 'Failed to fetch order'),
      });
      return null;
    }
  },

  /**
   * BUYER ONLY
   * POST /api/orders
   * Body: { cartId }
   *
   * UX hint:
   * - after success you usually want to refresh cart-items list
   */
  createOrderFromCartItem: async ({ cartId }) => {
    set({ isLoading: true, error: null, success: null });

    try {
      const data = await apiFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ cartId }),
      });

      set({
        isLoading: false,
        success: 'Order created successfully',
        order: data.order || null,
      });

      return data.order || null;
    } catch (err) {
      set({
        isLoading: false,
        error: msg(err, 'Failed to create order'),
      });
      return null;
    }
  },
}));