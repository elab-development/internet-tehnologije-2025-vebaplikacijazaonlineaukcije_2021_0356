import { create } from 'zustand';
import { apiFetch } from '../lib/api';

const msg = (err, fallback) => err?.message || fallback;

export const useUsersStore = create((set, get) => ({
  users: [],
  roleFilter: '', // '' | 'buyer' | 'seller' | 'admin'

  isLoading: false,
  error: null,
  success: null,

  clearMessages: () => set({ error: null, success: null }),
  clearError: () => set({ error: null }),
  clearSuccess: () => set({ success: null }),

  setRoleFilter: (role) => set({ roleFilter: role || '' }),

  /**
   * ADMIN
   * GET /api/users?role=buyer|seller|admin
   */
  fetchUsers: async (role) => {
    set({ isLoading: true, error: null, success: null });

    try {
      const finalRole = role ?? get().roleFilter;
      const qs = new URLSearchParams();
      if (finalRole) qs.set('role', String(finalRole));

      const data = await apiFetch(
        `/api/users${qs.toString() ? `?${qs}` : ''}`,
        {
          method: 'GET',
        },
      );

      set({
        users: data.users || [],
        roleFilter: finalRole || '',
        isLoading: false,
      });

      return data.users || [];
    } catch (err) {
      set({
        users: [],
        isLoading: false,
        error: msg(err, 'Failed to fetch users'),
      });
      return null;
    }
  },

  /**
   * ADMIN
   * PUT /api/users/:id/status
   * Body: { status }
   */
  updateUserStatus: async ({ userId, status, meId }) => {
    set({ error: null, success: null });

    const id = Number(userId);
    if (!Number.isInteger(id)) {
      set({ error: 'Invalid user id' });
      return null;
    }

    // FE guard (matches backend rule)
    if (meId && Number(meId) === id && status !== 'active') {
      set({ error: 'You cannot change your own status' });
      return null;
    }

    const prev = get().users;
    // optimistic
    set({
      users: prev.map((u) => (u.id === id ? { ...u, status } : u)),
      isLoading: true,
    });

    try {
      const data = await apiFetch(`/api/users/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });

      const updated = data.user;

      set({
        users: get().users.map((u) => (u.id === updated?.id ? updated : u)),
        isLoading: false,
        success: 'User status updated',
      });

      return updated || null;
    } catch (err) {
      // rollback
      set({
        users: prev,
        isLoading: false,
        error: msg(err, 'Failed to update status'),
      });
      return null;
    }
  },

  /**
   * ADMIN
   * PUT /api/users/:id/role
   * Body: { role }
   */
  updateUserRole: async ({ userId, role, meId }) => {
    set({ error: null, success: null });

    const id = Number(userId);
    if (!Number.isInteger(id)) {
      set({ error: 'Invalid user id' });
      return null;
    }

    // FE guard (matches backend rule)
    if (meId && Number(meId) === id && role !== 'admin') {
      set({ error: 'You cannot change your own role' });
      return null;
    }

    const prev = get().users;
    // optimistic
    set({
      users: prev.map((u) => (u.id === id ? { ...u, role } : u)),
      isLoading: true,
    });

    try {
      const data = await apiFetch(`/api/users/${id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      });

      const updated = data.user;

      set({
        users: get().users.map((u) => (u.id === updated?.id ? updated : u)),
        isLoading: false,
        success: 'User role updated',
      });

      return updated || null;
    } catch (err) {
      // rollback
      set({
        users: prev,
        isLoading: false,
        error: msg(err, 'Failed to update role'),
      });
      return null;
    }
  },
}));