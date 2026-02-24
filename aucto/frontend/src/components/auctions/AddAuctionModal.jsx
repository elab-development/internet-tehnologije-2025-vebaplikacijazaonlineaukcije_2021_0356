import { useEffect, useState } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

import { useAuctionsStore } from '../../stores/auctionsStore';
import { useAuthStore } from '../../stores/authStore';
import { useCurrencyStore } from '../../stores/currencyStore';
import CategorySelect from './CategorySelect';

export default function AddAuctionModal({ open, onClose, onCreated }) {
  const user = useAuthStore((s) => s.user);

  const { createAuction, isLoading, error, success, clearMessages } =
    useAuctionsStore();

  const inputToUSD = useCurrencyStore((s) => s.inputToUSD);
  const formatUSD = useCurrencyStore((s) => s.formatUSD);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (!open) return;
    clearMessages?.();
  }, [open, clearMessages]);

  if (!open) return null;

  const canUse = user?.role === 'seller';

  async function onSubmit(e) {
    e.preventDefault();
    clearMessages?.();

    if (!canUse) return;

    const spUSD = inputToUSD(Number(startingPrice));
    if (!Number.isFinite(spUSD) || spUSD <= 0) return;

    const created = await createAuction({
      title,
      description,
      startingPrice: spUSD,
      startTime,
      endTime,
      categoryId,
      imageFile,
      imageUrl,
    });

    if (created) {
      setTitle('');
      setDescription('');
      setStartingPrice('');
      setStartTime('');
      setEndTime('');
      setCategoryId('');
      setImageUrl('');
      setImageFile(null);

      onCreated?.();
    }
  }

  return (
    <div className='fixed inset-0 z-100'>
      <button
        onClick={onClose}
        className='absolute inset-0 bg-black/50'
        aria-label='Close modal'
      />

      <div className='relative mx-auto flex h-full max-w-6xl items-center justify-center px-4 py-6'>
        <div className='w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-white shadow-xl'>
          <div className='flex items-center justify-between border-b border-slate-200 px-5 py-4'>
            <div>
              <div className='text-lg font-semibold text-slate-900'>
                Add Auction
              </div>
              <div className='text-sm text-slate-600'>
                Create a new active auction.
              </div>
            </div>

            <button
              onClick={onClose}
              className='inline-flex items-center justify-center rounded-xl bg-slate-100 p-2 text-slate-700 hover:bg-slate-200'
              type='button'
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={onSubmit} className='p-5'>
            {!canUse && (
              <div className='mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
                Only sellers can create auctions.
              </div>
            )}

            {error && (
              <div className='mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
                {error}
              </div>
            )}

            {success && (
              <div className='mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700'>
                {success}
              </div>
            )}

            <div className='grid gap-4 md:grid-cols-2'>
              <div className='md:col-span-2'>
                <label className='mb-2 block text-sm font-medium text-slate-700'>
                  Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
                  placeholder='e.g. Vintage Watch'
                />
              </div>

              <div className='md:col-span-2'>
                <label className='mb-2 block text-sm font-medium text-slate-700'>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
                  placeholder='Describe the item...'
                />
              </div>

              <div>
                <label className='mb-2 block text-sm font-medium text-slate-700'>
                  Starting price ({useCurrencyStore.getState().currency})
                </label>
                <input
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(e.target.value)}
                  required
                  type='number'
                  min='0'
                  step='0.01'
                  className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
                  placeholder='100.00'
                />
              </div>

              <CategorySelect
                value={categoryId}
                onChange={setCategoryId}
                label='Category'
                required
                disabled={isLoading}
              />

              <div>
                <label className='mb-2 block text-sm font-medium text-slate-700'>
                  Start time
                </label>
                <input
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  type='datetime-local'
                  className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
                />
              </div>

              <div>
                <label className='mb-2 block text-sm font-medium text-slate-700'>
                  End time
                </label>
                <input
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  type='datetime-local'
                  className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
                />
              </div>

              <div className='md:col-span-2'>
                <div className='mb-2 text-sm font-medium text-slate-700'>
                  Image (file or URL)
                </div>

                <div className='grid gap-3 md:grid-cols-2'>
                  <label className='flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50'>
                    <ImageIcon size={18} className='text-slate-500' />
                    <span className='truncate'>
                      {imageFile ? imageFile.name : 'Upload file'}
                    </span>
                    <input
                      type='file'
                      accept='image/png,image/jpeg,image/webp'
                      className='hidden'
                      onChange={(e) =>
                        setImageFile(e.target.files?.[0] || null)
                      }
                    />
                  </label>

                  <input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder='https://... (optional if file)'
                    className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
                  />
                </div>

                <div className='mt-2 text-xs text-slate-500'>
                  Image is required: upload a file or provide image URL.
                </div>
              </div>
            </div>

            <div className='mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
              <button
                type='button'
                onClick={onClose}
                className='rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50'
              >
                Cancel
              </button>

              <button
                disabled={!canUse || isLoading}
                className='rounded-xl bg-linear-to-r from-purple-700 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:opacity-95 disabled:opacity-60'
              >
                {isLoading ? 'Creating…' : 'Create auction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}