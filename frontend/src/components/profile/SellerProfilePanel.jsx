import { Gavel } from 'lucide-react';
import AuctionCard from '../auctions/AuctionCard';

export default function SellerProfilePanel({
  user,
  tab,
  onTabChange,
  isLoading,
  error,
  activeAuctions,
  finishedAuctions,
}) {
  const list = tab === 'active' ? activeAuctions : finishedAuctions;

  return (
    <div className='space-y-6'>
      <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
        <div className='flex items-center gap-2'>
          <Gavel size={18} className='text-slate-700' />
          <div className='text-base font-semibold text-slate-900'>
            Seller dashboard
          </div>
        </div>
        <div className='mt-2 text-sm text-slate-700'>
          <span className='font-medium'>Full name:</span> {user.fullName}
          <br />
          <span className='font-medium'>Email:</span> {user.email}
        </div>
      </div>

      <div className='flex flex-wrap gap-2'>
        {[
          { id: 'active', label: `Active (${activeAuctions.length})` },
          {
            id: 'finished',
            label: `Finished/Archived (${finishedAuctions.length})`,
          },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={`rounded-xl border px-4 py-2 text-sm font-semibold shadow-sm ${
              tab === t.id
                ? 'border-purple-200 bg-purple-50 text-purple-700'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
          {error}
        </div>
      )}

      {isLoading ? (
        <div className='rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm'>
          Loading…
        </div>
      ) : list.length === 0 ? (
        <div className='rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm'>
          No auctions in this category.
        </div>
      ) : (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {list.map((a) => (
            <AuctionCard key={a.id} auction={a} />
          ))}
        </div>
      )}
    </div>
  );
}