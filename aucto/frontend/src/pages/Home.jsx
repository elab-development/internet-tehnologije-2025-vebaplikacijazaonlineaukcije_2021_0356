import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gavel, Sparkles, Clock } from 'lucide-react';

import { useAuctionsStore } from '../stores/auctionsStore';
import { useAuthStore } from '../stores/authStore';
import { useCurrencyStore } from '../stores/currencyStore';

function formatMoney(v) {
  if (v === null || v === undefined) return '—';
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return n.toFixed(2);
}

function formatDate(d) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleString();
}

function StatusPill({ status }) {
  const s = String(status || '').toLowerCase();

  const cls =
    s === 'active'
      ? 'bg-green-50 text-green-700 border-green-200'
      : s === 'finished'
        ? 'bg-blue-50 text-blue-700 border-blue-200'
        : s === 'archived'
          ? 'bg-slate-100 text-slate-700 border-slate-200'
          : 'bg-amber-50 text-amber-700 border-amber-200';

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cls}`}
    >
      {status}
    </span>
  );
}

function AuctionCard({ a }) {
  const price =
    a?.currentPrice !== null && a?.currentPrice !== undefined
      ? a.currentPrice
      : a?.startingPrice;

  const formatUSD = useCurrencyStore((s) => s.formatUSD);

  return (
    <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md'>
      <div className='aspect-square w-full overflow-hidden bg-slate-100'>
        <img
          src={a.imageUrl}
          alt={a.title}
          className='h-full w-full object-cover'
          loading='lazy'
        />
      </div>

      <div className='p-5'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0'>
            <div className='truncate text-base font-semibold text-slate-900'>
              {a.title}
            </div>
            <div className='mt-1 text-xs text-slate-600'>
              Seller:{' '}
              <span className='font-semibold'>
                {a?.seller?.fullName || '—'}
              </span>
            </div>
          </div>
          <StatusPill status={a.status} />
        </div>

        <div className='mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3'>
          <div>
            <div className='text-[11px] font-semibold uppercase tracking-wide text-slate-500'>
              Current price
            </div>
            <div className='text-lg font-semibold text-slate-900'>
              {formatUSD(price)}
            </div>
          </div>
          <div className='text-right text-xs text-slate-600'>
            <div className='flex items-center justify-end gap-1'>
              <Clock size={14} className='text-slate-500' />
              <span className='font-semibold'>Ends</span>
            </div>
            <div>{formatDate(a.endTime)}</div>
          </div>
        </div>

        <div className='mt-4 flex items-center justify-between'>
          <div className='text-xs text-slate-600'>
            Category:{' '}
            <span className='font-semibold text-slate-900'>
              {a?.category?.name || '—'}
            </span>
          </div>

          <Link
            to={`/auctions/${a.id}`}
            className='inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800'
          >
            View
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const user = useAuthStore((s) => s.user);

  const auctions = useAuctionsStore((s) => s.items);
  const isLoading = useAuctionsStore((s) => s.isLoading);
  const error = useAuctionsStore((s) => s.error);
  const fetchAuctions = useAuctionsStore((s) => s.fetchAuctions);
  const clearMessages = useAuctionsStore((s) => s.clearMessages);

  useEffect(() => {
    clearMessages?.();
    fetchAuctions?.({
      page: 1,
      limit: 3,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      status: 'active',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const latest = useMemo(() => auctions || [], [auctions]);

  return (
    <div className='bg-linear-to-br from-purple-50 via-white to-indigo-50'>
      <div className='mx-auto w-full max-w-6xl px-4 py-10'>
        {/* HERO */}
        <div className='relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm'>
          <div className='absolute -right-24 -top-24 h-72 w-72 rounded-full bg-purple-100 blur-2xl' />
          <div className='absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-indigo-100 blur-2xl' />

          <div className='relative grid gap-8 p-8 md:grid-cols-2 md:p-10'>
            <div>
              <div className='inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700'>
                <Sparkles size={14} />
                Live auctions • Simple bidding
              </div>

              <h1 className='mt-4 text-3xl font-semibold leading-tight text-slate-900 md:text-4xl'>
                Bid smart. Win faster.
                <span className='text-purple-700'> All in one place.</span>
              </h1>

              <p className='mt-3 text-sm leading-relaxed text-slate-600'>
                Browse auctions, place bids, and keep track of your purchases.
                Sellers can publish auctions in minutes. Admin keeps everything
                under control.
              </p>

              <div className='mt-6 flex flex-wrap items-center gap-3'>
                <Link
                  to='/auctions'
                  className='inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-purple-700 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:opacity-95'
                >
                  Explore auctions
                  <ArrowRight size={16} />
                </Link>

                {!user ? (
                  <Link
                    to='/register'
                    className='inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50'
                  >
                    Create account
                  </Link>
                ) : (
                  <Link
                    to='/profile'
                    className='inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50'
                  >
                    Go to profile
                  </Link>
                )}
              </div>

              <div className='mt-6 flex flex-wrap gap-2 text-xs text-slate-600'>
                <span className='inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1'>
                  <Gavel size={14} className='text-slate-700' />
                  Safe bidding rules
                </span>
                <span className='inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1'>
                  <Clock size={14} className='text-slate-700' />
                  Time-window control
                </span>
              </div>
            </div>

            {/* HERO SIDE CARD */}
            <div className='rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm backdrop-blur'>
              <div className='text-sm font-semibold text-slate-900'>
                Quick tips
              </div>

              <div className='mt-3 space-y-3 text-sm text-slate-700'>
                <div className='rounded-xl border border-slate-200 bg-white px-4 py-3'>
                  Your bid must be higher than the current price.
                </div>
                <div className='rounded-xl border border-slate-200 bg-white px-4 py-3'>
                  Sellers see bids only after auctions are finished/archived.
                </div>
                <div className='rounded-xl border border-slate-200 bg-white px-4 py-3'>
                  If you win, it appears in your cart — then create an order.
                </div>
              </div>

              <div className='mt-4 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-xs text-purple-800'>
                Pro tip: Use “Profile” to track your participation and
                purchases.
              </div>
            </div>
          </div>
        </div>

        {/* Latest auctions */}
        <div className='mt-10'>
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <div className='text-lg font-semibold text-slate-900'>
                Latest auctions
              </div>
              <div className='text-sm text-slate-600'>
                3 most recently created auctions
              </div>
            </div>

            <Link
              to='/auctions'
              className='inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50'
            >
              View all
              <ArrowRight size={16} />
            </Link>
          </div>

          {error && (
            <div className='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
              {error}
            </div>
          )}

          {!error && isLoading && latest.length === 0 && (
            <div className='grid gap-4 md:grid-cols-3'>
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'
                >
                  <div className='aspect-square w-full animate-pulse bg-slate-200' />
                  <div className='p-5'>
                    <div className='h-4 w-2/3 animate-pulse rounded bg-slate-200' />
                    <div className='mt-3 h-3 w-1/2 animate-pulse rounded bg-slate-200' />
                    <div className='mt-4 h-12 animate-pulse rounded bg-slate-200' />
                    <div className='mt-4 h-9 animate-pulse rounded bg-slate-200' />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && !error && latest.length === 0 && (
            <div className='rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm'>
              No auctions yet.{' '}
              <Link
                to='/auctions'
                className='font-semibold text-purple-700 hover:underline'
              >
                Browse auctions
              </Link>
              .
            </div>
          )}

          {latest.length > 0 && (
            <div className='grid gap-4 md:grid-cols-3'>
              {latest.map((a) => (
                <AuctionCard key={a.id} a={a} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}