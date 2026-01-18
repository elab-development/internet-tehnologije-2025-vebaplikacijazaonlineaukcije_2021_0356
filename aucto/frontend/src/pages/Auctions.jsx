import { useEffect, useMemo, useState } from 'react';

import { useAuctionsStore } from '../stores/auctionsStore';
import { useAuthStore } from '../stores/authStore';

import AuctionsToolbar from '../components/auctions/AuctionsToolbar';
import AuctionsGrid from '../components/auctions/AuctionsGrid';
import Pagination from '../components/auctions/Pagination';
import AddAuctionModal from '../components/auctions/AddAuctionModal';

function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}

export default function Auctions() {
  const user = useAuthStore((s) => s.user);

  const {
    items,
    page,
    totalPages,
    total,
    isLoading,
    error,
    fetchAuctions,
    clearMessages,
  } = useAuctionsStore();

  const [q, setQ] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const [categoryId, setCategoryId] = useState('');
  const [sellerId, setSellerId] = useState('');

  const [openCreate, setOpenCreate] = useState(false);

  const debouncedQ = useDebouncedValue(q, 450);

  const canAddAuction = useMemo(() => user?.role === 'seller', [user]);

  async function load(nextPage = 1) {
    clearMessages?.();

    await fetchAuctions({
      page: nextPage,
      limit: 12,
      status: 'active',
      q: debouncedQ,
      sortBy,
      sortOrder,
      categoryId: categoryId || undefined,
      sellerId: sellerId || undefined,
    });
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ, sortBy, sortOrder, categoryId, sellerId]);

  return (
    <div className='mx-auto w-full max-w-6xl px-4 py-8'>
      <div className='mb-5 flex flex-col gap-1'>
        <h1 className='text-2xl font-semibold text-slate-900'>Auctions</h1>
        <p className='text-sm text-slate-600'>
          Browse currently active auctions and place your bids.
        </p>
      </div>

      <AuctionsToolbar
        q={q}
        onQChange={setQ}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        categoryId={categoryId}
        onCategoryIdChange={setCategoryId}
        canAddAuction={canAddAuction}
        onOpenCreate={() => setOpenCreate(true)}
        isLoading={isLoading}
      />

      {error && (
        <div className='mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
          {error}
        </div>
      )}

      <div className='mt-5'>
        <AuctionsGrid items={items} isLoading={isLoading} />
      </div>

      <div className='mt-6'>
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          onPageChange={(p) => load(p)}
          disabled={isLoading}
        />
      </div>

      <AddAuctionModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={() => {
          setOpenCreate(false);
          load(1);
        }}
      />
    </div>
  );
}
