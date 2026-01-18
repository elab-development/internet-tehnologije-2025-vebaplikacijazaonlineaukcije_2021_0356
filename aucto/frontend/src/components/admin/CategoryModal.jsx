import { AlertTriangle, Tag, X } from 'lucide-react';
import { useEffect, useState } from 'react';

function normalizeStr(v) {
  return String(v ?? '').trim();
}

export function CategoryModal({
  open,
  mode, // 'create' | 'edit'
  initial,
  isLoading,
  onClose,
  onSubmit,
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setLocalError(null);
    setName(normalizeStr(initial?.name));
    setDescription(normalizeStr(initial?.description));
  }, [open, initial]);

  if (!open) return null;

  const title = mode === 'edit' ? 'Edit category' : 'Create category';

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError(null);

    const n = normalizeStr(name);
    const d = normalizeStr(description);

    if (!n) return setLocalError('Name is required.');

    await onSubmit({ name: n, description: d });
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* backdrop */}
      <div
        className='absolute inset-0 bg-slate-900/40'
        onClick={isLoading ? undefined : onClose}
      />

      {/* modal */}
      <div className='relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl'>
        <div className='flex items-center justify-between border-b border-slate-200 px-5 py-4'>
          <div className='flex items-center gap-2'>
            <div className='grid h-9 w-9 place-items-center rounded-xl bg-purple-50 text-purple-700'>
              <Tag size={18} />
            </div>
            <div>
              <div className='text-lg font-semibold text-slate-900'>
                {title}
              </div>
              <div className='text-xs text-slate-600'>
                {mode === 'edit'
                  ? `Editing: #${initial?.id}`
                  : 'Add a new category to the system.'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            className='rounded-xl p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-60'
            aria-label='Close'
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className='p-5'>
          {localError && (
            <div className='mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
              <div className='flex items-start gap-2'>
                <AlertTriangle size={18} className='mt-0.5' />
                <div>{localError}</div>
              </div>
            </div>
          )}

          <div className='space-y-4'>
            <div>
              <div className='mb-2 text-sm font-medium text-slate-700'>
                Name <span className='text-red-600'>*</span>
              </div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
                placeholder='e.g. Electronics'
                disabled={isLoading}
                maxLength={80}
                autoFocus
              />
              <div className='mt-1 text-xs text-slate-500'>
                Keep it short and unique.
              </div>
            </div>

            <div>
              <div className='mb-2 text-sm font-medium text-slate-700'>
                Description
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className='min-h-27.5 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
                placeholder='Optional description…'
                disabled={isLoading}
                maxLength={500}
              />
              <div className='mt-1 text-xs text-slate-500'>
                Optional. Up to 500 characters.
              </div>
            </div>
          </div>

          <div className='mt-5 flex items-center justify-end gap-2'>
            <button
              type='button'
              onClick={onClose}
              disabled={isLoading}
              className='rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60'
            >
              Cancel
            </button>

            <button
              type='submit'
              disabled={isLoading}
              className='rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60'
            >
              {isLoading
                ? 'Saving…'
                : mode === 'edit'
                  ? 'Save changes'
                  : 'Create category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
