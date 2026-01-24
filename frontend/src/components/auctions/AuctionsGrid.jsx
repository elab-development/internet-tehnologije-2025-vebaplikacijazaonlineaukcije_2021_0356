import AuctionCard from './AuctionCard';

export default function AuctionsGrid({ items, isLoading }) {
  if (isLoading && (!items || items.length === 0)) {
    return (
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className='h-72 animate-pulse rounded-2xl border border-slate-200 bg-white'
          />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className='rounded-2xl border border-slate-200 bg-white p-10 text-center'>
        <div className='text-sm font-medium text-slate-900'>
          No active auctions found
        </div>
        <div className='mt-1 text-sm text-slate-600'>
          Try adjusting search or sorting.
        </div>
      </div>
    );
  }

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {items.map((a) => (
        <AuctionCard key={a.id} auction={a} />
      ))}
    </div>
  );
}