import { Link } from 'react-router-dom';
import { Clock, Tag, User } from 'lucide-react';

function formatMoney(v) {
  if (v === null || v === undefined) return '';
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return n.toFixed(2);
}

function formatDate(d) {
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return '';
  return dt.toLocaleString();
}

export default function AuctionCard({ auction }) {
  const price =
    auction.currentPrice !== null && auction.currentPrice !== undefined
      ? auction.currentPrice
      : auction.startingPrice;

  return (
    <Link
      to={`/auctions/${auction.id}`}
      className='group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow'
    >
      <div className='aspect-[16/10] w-full overflow-hidden bg-slate-100'>
        <img
          src={auction.imageUrl}
          alt={auction.title}
          className='h-full w-full object-cover transition group-hover:scale-[1.03]'
          loading='lazy'
        />
      </div>

      <div className='p-4'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0'>
            <div className='truncate text-base font-semibold text-slate-900'>
              {auction.title}
            </div>
            <div className='mt-1 line-clamp-2 text-sm text-slate-600'>
              {auction.description}
            </div>
          </div>

          <div className='shrink-0 rounded-xl bg-purple-50 px-3 py-2 text-right'>
            <div className='text-xs text-slate-600'>Current</div>
            <div className='text-sm font-semibold text-purple-700'>
              {formatMoney(price)}
            </div>
          </div>
        </div>

        <div className='mt-4 grid gap-2 text-xs text-slate-600'>
          <div className='flex items-center gap-2'>
            <Clock size={14} className='text-slate-500' />
            <span className='truncate'>
              Ends: {formatDate(auction.endTime)}
            </span>
          </div>

          <div className='flex items-center gap-2'>
            <Tag size={14} className='text-slate-500' />
            <span className='truncate'>{auction.category?.name || '—'}</span>
          </div>

          <div className='flex items-center gap-2'>
            <User size={14} className='text-slate-500' />
            <span className='truncate'>{auction.seller?.fullName || '—'}</span>
          </div>
        </div>

        <div className='mt-4'>
          <div className='inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition group-hover:bg-slate-800'>
            View details
          </div>
        </div>
      </div>
    </Link>
  );
}