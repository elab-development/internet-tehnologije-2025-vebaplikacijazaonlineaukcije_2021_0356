import { create } from 'zustand';
import { apiFetch } from '../lib/api';

const getErrMessage = (err, fallback) => err?.message || fallback;

export const useCategoriesStore = create((set, get) => ({
  categories: [],
  category: null,

  isLoading: false,
  error: null,
  success: null,

  clearMessages: () => set({ error: null, success: null }),
  clearError: () => set({ error: null }),
  clearSuccess: () => set({ success: null }),

  // PUBLIC
  // GET /api/categories
  fetchAllCategories: async () => {
    const current = get().categories;
    if (current && current.length > 0) return current;

    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch('/api/categories', { method: 'GET' });
      set({ categories: data.categories || [], isLoading: false });
      return data.categories || [];
    } catch (err) {
      set({
        isLoading: false,
        error: getErrMessage(err, 'Failed to fetch categories'),
      });
      return null;
    }
  },

  // PUBLIC
  // GET /api/categories/:id
  fetchCategoryById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiFetch(`/api/categories/${id}`, { method: 'GET' });
      set({ category: data.category || null, isLoading: false });
      return data.category || null;
    } catch (err) {
      set({
        category: null,
        isLoading: false,
        error: getErrMessage(err, 'Failed to fetch category'),
      });
      return null;
    }
  },

  // ADMIN
  // POST /api/categories
  createCategory: async ({ name, description }) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const data = await apiFetch('/api/categories', {
        method: 'POST',
        body: JSON.stringify({ name, description }),
      });

      const created = data.category;

      set((s) => {
        const next = [...(s.categories || []), created].sort((a, b) =>
          String(a.name).localeCompare(String(b.name)),
        );
        return {
          categories: next,
          success: 'Category created successfully',
          isLoading: false,
        };
      });

      return created || null;
    } catch (err) {
      set({
        isLoading: false,
        error: getErrMessage(err, 'Failed to create category'),
      });
      return null;
    }
  },

  // ADMIN
  // PUT /api/categories/:id
  updateCategory: async (id, { name, description }) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const data = await apiFetch(`/api/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, description }),
      });

      const updated = data.category;

      set((s) => {
        const next = (s.categories || [])
          .map((c) => (c.id === updated?.id ? updated : c))
          .sort((a, b) => String(a.name).localeCompare(String(b.name)));

        return {
          categories: next,
          category: s.category?.id === updated?.id ? updated : s.category,
          success: 'Category updated successfully',
          isLoading: false,
        };
      });

      return updated || null;
    } catch (err) {
      set({
        isLoading: false,
        error: getErrMessage(err, 'Failed to update category'),
      });
      return null;
    }
  },

  // ADMIN
  // DELETE /api/categories/:id
  deleteCategory: async (id) => {
    set({ isLoading: true, error: null, success: null });
    try {
      const data = await apiFetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      set((s) => ({
        categories: (s.categories || []).filter((c) => c.id !== Number(id)),
        isLoading: false,
        success: data?.message || 'Category deleted',
      }));

      if (get().category?.id === Number(id)) set({ category: null });

      return true;
    } catch (err) {
      set({
        isLoading: false,
        error: getErrMessage(err, 'Failed to delete category'),
      });
      return false;
    }
  },
}));