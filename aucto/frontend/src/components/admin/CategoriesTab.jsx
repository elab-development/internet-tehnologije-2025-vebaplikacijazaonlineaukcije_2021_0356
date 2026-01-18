import { useEffect, useMemo, useState } from 'react';
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

import { useCategoriesStore } from '../../stores/categoriesStore';
import { CategoryModal } from './CategoryModal';

function normalizeStr(v) {
  return String(v ?? '').trim();
}

export default function CategoriesTab() {
  const {
    categories,
    isLoading,
    error,
    success,
    clearMessages,
    fetchAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategoriesStore();

  const [q, setQ] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    const list = categories || [];
    const s = normalizeStr(q).toLowerCase();
    if (!s) return list;

    return list.filter((c) => {
      const name = normalizeStr(c?.name).toLowerCase();
      const desc = normalizeStr(c?.description).toLowerCase();
      return name.includes(s) || desc.includes(s);
    });
  }, [categories, q]);

  useEffect(() => {
    clearMessages?.();
    fetchAllCategories?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    clearMessages?.();
    setEditing(null);
    setModalMode('create');
    setModalOpen(true);
  }

  function openEdit(cat) {
    clearMessages?.();
    setEditing(cat);
    setModalMode('edit');
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
  }

  async function handleSubmit(payload) {
    if (modalMode === 'edit' && editing?.id) {
      const updated = await updateCategory?.(editing.id, payload);
      if (updated) closeModal();
      return;
    }

    const created = await createCategory?.(payload);
    if (created) closeModal();
  }

  async function handleDelete(cat) {
    clearMessages?.();
    const ok = window.confirm(
      `Delete category "${cat?.name}"?\n\nThis action cannot be undone.`,
    );
    if (!ok) return;
    await deleteCategory?.(cat.id);
  }

  async function onRefresh() {
    clearMessages?.();
    await fetchAllCategories?.();
  }

  return (
    <div>
      {/* Header */}
      <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <div className='flex items-center gap-2'>
            <div className='grid h-9 w-9 place-items-center rounded-xl bg-purple-50 text-purple-700'>
              <Tag size={18} />
            </div>
            <div className='text-lg font-semibold text-slate-900'>
              Categories
            </div>
          </div>
          <div className='mt-1 text-sm text-slate-600'>
            Create, edit and remove categories.
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder='Search…'
            className='w-56 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
            disabled={isLoading}
          />

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className='inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60'
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            onClick={openCreate}
            disabled={isLoading}
            className='inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-purple-700 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-95 disabled:opacity-60'
          >
            <Plus size={16} />
            New category
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className='mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
          <div className='flex items-start gap-2'>
            <AlertTriangle size={18} className='mt-0.5' />
            <div>{error}</div>
          </div>
        </div>
      )}

      {success && (
        <div className='mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700'>
          <div className='flex items-start gap-2'>
            <CheckCircle2 size={18} className='mt-0.5' />
            <div>{success}</div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white'>
        <div className='overflow-x-auto'>
          <table className='min-w-212.5 w-full text-left text-sm'>
            <thead className='bg-slate-50 text-xs uppercase tracking-wide text-slate-600'>
              <tr>
                <th className='px-4 py-3'>Name</th>
                <th className='px-4 py-3'>Description</th>
                <th className='px-4 py-3'>ID</th>
                <th className='px-4 py-3 text-right'>Actions</th>
              </tr>
            </thead>

            <tbody className='divide-y divide-slate-200'>
              {isLoading && (filtered?.length || 0) === 0 && (
                <>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className='animate-pulse'>
                      <td className='px-4 py-3'>
                        <div className='h-4 w-44 rounded bg-slate-200' />
                      </td>
                      <td className='px-4 py-3'>
                        <div className='h-4 w-130 rounded bg-slate-200' />
                      </td>
                      <td className='px-4 py-3'>
                        <div className='h-4 w-16 rounded bg-slate-200' />
                      </td>
                      <td className='px-4 py-3'>
                        <div className='ml-auto h-8 w-28 rounded bg-slate-200' />
                      </td>
                    </tr>
                  ))}
                </>
              )}

              {!isLoading && (filtered?.length || 0) === 0 && (
                <tr>
                  <td className='px-4 py-6 text-slate-600' colSpan={4}>
                    {normalizeStr(q)
                      ? 'No categories match your search.'
                      : 'No categories yet.'}
                  </td>
                </tr>
              )}

              {(filtered || []).map((c) => (
                <tr key={c.id} className='hover:bg-slate-50'>
                  <td className='px-4 py-3'>
                    <div className='font-semibold text-slate-900'>{c.name}</div>
                    <div className='mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700'>
                      category
                    </div>
                  </td>

                  <td className='px-4 py-3 text-slate-700'>
                    {normalizeStr(c.description) ? (
                      <div className='line-clamp-2 max-w-140'>
                        {c.description}
                      </div>
                    ) : (
                      <span className='text-slate-400'>—</span>
                    )}
                  </td>

                  <td className='px-4 py-3 text-slate-700'>#{c.id}</td>

                  <td className='px-4 py-3'>
                    <div className='flex justify-end gap-2'>
                      <button
                        onClick={() => openEdit(c)}
                        disabled={isLoading}
                        className='inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60'
                      >
                        <Pencil size={14} />
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(c)}
                        disabled={isLoading}
                        className='inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60'
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-xs text-slate-600'>
          <div>
            Showing <span className='font-semibold'>{filtered.length}</span> of{' '}
            <span className='font-semibold'>{(categories || []).length}</span>{' '}
            categories
          </div>

          {isLoading ? (
            <div className='font-semibold text-slate-700'>Loading…</div>
          ) : (
            <button
              onClick={() => clearMessages?.()}
              className='rounded-lg px-2 py-1 font-semibold text-slate-700 hover:bg-slate-100'
            >
              Clear messages
            </button>
          )}
        </div>
      </div>

      {/* Modal */}
      <CategoryModal
        open={modalOpen}
        mode={modalMode}
        initial={editing}
        isLoading={isLoading}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
