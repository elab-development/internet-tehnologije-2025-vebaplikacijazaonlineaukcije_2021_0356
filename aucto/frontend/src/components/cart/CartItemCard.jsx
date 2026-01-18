import { Link } from 'react-router-dom';
import { Clock, Tag, User, ShoppingBag } from 'lucide-react';

function formatMoney(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  return n.toFixed(2);
}

function formatDate(d) {
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return '—';
  return dt.toLocaleString();
}

export default function CartItemCard({
  item,
  canCreateOrder,
  isCreating,
  onCreateOrder,
  disabled,
}) {
  const auction = item.auction;

  return (
    <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
      <div className='p-4'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0'>
            <div className='truncate text-base font-semibold text-slate-900'>
              {auction?.title || `Auction #${item.auctionId}`}
            </div>
            <div className='mt-1 text-sm text-slate-600'>
              Cart item #{item.id}
            </div>
          </div>

          <div className='shrink-0 rounded-xl bg-purple-50 px-3 py-2 text-right'>
            <div className='text-xs text-slate-600'>Final</div>
            <div className='text-sm font-semibold text-purple-700'>
              {formatMoney(item.finalPrice)}
            </div>
          </div>
        </div>

        <div className='mt-4 grid gap-2 text-xs text-slate-600'>
          <div className='flex items-center gap-2'>
            <Clock size={14} className='text-slate-500' />
            <span className='truncate'>Added: {formatDate(item.addedAt)}</span>
          </div>

          <div className='flex items-center gap-2'>
            <Tag size={14} className='text-slate-500' />
            <span className='truncate'>
              Status: {auction?.status || '—'} | CategoryId:{' '}
              {auction?.categoryId ?? '—'}
            </span>
          </div>

          <div className='flex items-center gap-2'>
            <User size={14} className='text-slate-500' />
            <span className='truncate'>
              Buyer:{' '}
              {item.user?.fullName || item.user?.email || `#${item.userId}`}
            </span>
          </div>
        </div>

        <div className='mt-4 grid gap-2'>
          <Link
            to={`/auctions/${item.auctionId}`}
            className='inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50'
          >
            View auction
          </Link>

          {canCreateOrder && (
            <button
              onClick={onCreateOrder}
              disabled={disabled || isCreating}
              className='inline-flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-purple-700 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-95 disabled:opacity-60'
            >
              <ShoppingBag size={16} />
              {isCreating ? 'Creating…' : 'Create order'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
