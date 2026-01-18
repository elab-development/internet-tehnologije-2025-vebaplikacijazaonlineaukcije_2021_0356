import { Shield, ListOrdered } from 'lucide-react';

function formatMoney(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return n.toFixed(2);
}

function formatDate(d) {
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return '—';
  return dt.toLocaleString();
}

export default function BidsPanel({ bids, isLoading, error, isAdmin }) {
  return (
    <div className='rounded-2xl border border-slate-200 bg-white shadow-sm'>
      <div className='flex items-center justify-between border-b border-slate-200 px-5 py-4'>
        <div className='flex items-center gap-2'>
          {isAdmin ? (
            <Shield size={18} className='text-slate-700' />
          ) : (
            <ListOrdered size={18} className='text-slate-700' />
          )}
          <div className='text-base font-semibold text-slate-900'>Bids</div>
        </div>

        <div className='text-sm text-slate-600'>
          {Array.isArray(bids) ? bids.length : 0} total
        </div>
      </div>

      <div className='p-5'>
        {error && (
          <div className='mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
            {error}
          </div>
        )}

        {isLoading && (
          <div className='space-y-2'>
            <div className='h-10 animate-pulse rounded bg-slate-200' />
            <div className='h-10 animate-pulse rounded bg-slate-200' />
            <div className='h-10 animate-pulse rounded bg-slate-200' />
          </div>
        )}

        {!isLoading && (!bids || bids.length === 0) && (
          <div className='rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700'>
            No bids yet.
          </div>
        )}

        {!isLoading && bids && bids.length > 0 && (
          <div className='overflow-hidden rounded-xl border border-slate-200'>
            <div className='grid grid-cols-12 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700'>
              <div className='col-span-4'>User</div>
              <div className='col-span-4'>Email</div>
              <div className='col-span-2 text-right'>Amount</div>
              <div className='col-span-2 text-right'>Time</div>
            </div>

            <div className='divide-y divide-slate-200'>
              {bids.map((b) => (
                <div
                  key={b.id}
                  className='grid grid-cols-12 px-4 py-3 text-sm text-slate-800'
                >
                  <div className='col-span-4 truncate'>
                    {b.user?.fullName || '—'}
                  </div>
                  <div className='col-span-4 truncate text-slate-600'>
                    {b.user?.email || '—'}
                  </div>
                  <div className='col-span-2 text-right font-semibold text-slate-900'>
                    {formatMoney(b.amount)}
                  </div>
                  <div className='col-span-2 text-right text-xs text-slate-600'>
                    {formatDate(b.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isAdmin && (
          <div className='mt-3 text-xs text-slate-500'>
            Visible to seller only after auction ends (finished/archived).
          </div>
        )}
      </div>
    </div>
  );
}
