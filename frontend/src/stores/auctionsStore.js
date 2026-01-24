import { create } from 'zustand';
import { apiFetch } from '../lib/api';

function buildQuery(params = {}) {
  const qs = new URLSearchParams();

  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (typeof v === 'string' && !v.trim()) return;
    qs.set(k, String(v));
  });

  const str = qs.toString();
  return str ? `?${str}` : '';
}

function getErrMessage(err, fallback) {
  return err?.message || fallback;
}

export const useAuctionsStore = create((set, get) => ({
  // LIST STATE
  items: [],
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 0,

  // DETAILS STATE
  auction: null,

  // UI STATE
  isLoading: false,
  error: null,
  success: null,

  clearMessages: () => set({ error: null, success: null }),
  clearError: () => set({ error: null }),
  clearSuccess: () => set({ success: null }),

  // -----------------------------
  // GET /api/auctions
  // -----------------------------
  fetchAuctions: async (params = {}) => {
    set({ isLoading: true, error: null });

    try {
      const query = buildQuery(params);
      const data = await apiFetch(`/api/auctions${query}`, { method: 'GET' });

      set({
        items: data.items || [],
        page: data.page || 1,
        limit: data.limit || 12,
        total: data.total || 0,
        totalPages: data.totalPages || 0,
        isLoading: false,
      });

      return data;
    } catch (err) {
      set({
        isLoading: false,
        error: getErrMessage(err, 'Failed to fetch auctions'),
      });
      return null;
    }
  },

  // -----------------------------
  // GET /api/auctions/:id
  // -----------------------------
  fetchAuctionById: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const data = await apiFetch(`/api/auctions/${id}`, { method: 'GET' });
      set({ auction: data.auction || null, isLoading: false });
      return data.auction || null;
    } catch (err) {
      set({
        auction: null,
        isLoading: false,
        error: getErrMessage(err, 'Failed to fetch auction'),
      });
      return null;
    }
  },

  // -----------------------------
  // POST /api/auctions (SELLER)
  // Content-Type: multipart/form-data
  // -----------------------------
  createAuction: async ({
    title,
    description,
    startingPrice,
    startTime,
    endTime,
    categoryId,
    imageFile,
    imageUrl,
  }) => {
    set({ isLoading: true, error: null, success: null });

    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('description', description);
      fd.append('startingPrice', String(startingPrice));
      fd.append('startTime', startTime);
      fd.append('endTime', endTime);
      fd.append('categoryId', String(categoryId));

      if (imageFile) fd.append('image', imageFile);
      else if (imageUrl) fd.append('imageUrl', imageUrl);

      const data = await apiFetch('/api/auctions', {
        method: 'POST',
        body: fd,
      });

      const created = data.auction;
      if (created) {
        set((s) => ({
          items: [created, ...s.items],
          success: 'Auction created successfully',
          isLoading: false,
        }));
      } else {
        set({ success: 'Auction created successfully', isLoading: false });
      }

      return created || null;
    } catch (err) {
      set({
        isLoading: false,
        error: getErrMessage(err, 'Failed to create auction'),
      });
      return null;
    }
  },

  // -----------------------------
  // PUT /api/auctions/:id
  // (SELLER owner or ADMIN)
  // -----------------------------
  updateAuction: async (id, { description, status, imageFile, imageUrl }) => {
    set({ isLoading: true, error: null, success: null });

    try {
      const fd = new FormData();

      if (description !== undefined) fd.append('description', description);
      if (status !== undefined) fd.append('status', status);

      if (imageFile) fd.append('image', imageFile);
      else if (imageUrl !== undefined) fd.append('imageUrl', imageUrl);

      const data = await apiFetch(`/api/auctions/${id}`, {
        method: 'PUT',
        body: fd,
      });

      const updated = data.auction;

      set((s) => ({
        auction: s.auction?.id === updated?.id ? updated : s.auction,
        items: s.items.map((a) => (a.id === updated?.id ? updated : a)),
        success: 'Auction updated successfully',
        isLoading: false,
      }));

      return updated || null;
    } catch (err) {
      set({
        isLoading: false,
        error: getErrMessage(err, 'Failed to update auction'),
      });
      return null;
    }
  },
}));