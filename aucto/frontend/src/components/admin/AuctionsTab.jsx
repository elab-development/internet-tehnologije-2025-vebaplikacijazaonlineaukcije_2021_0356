import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Gavel,
  Search,
  Filter,
  RefreshCw,
  Shield,
  Eye,
  Archive,
  X,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

import { useAuctionsStore } from '../../stores/auctionsStore';

function formatMoney(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  return n.toFixed(2);
}

function formatDate(d) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleString();
}

function normalizeStr(v) {
  return String(v ?? '').trim();
}

function canAdminArchive(auction) {
  if (!auction) return false;
  return auction.status !== 'archived';
}

function AuctionStatusPill({ status }) {
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

function ArchiveModal({ open, auction, isLoading, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div
        className='absolute inset-0 bg-slate-900/40'
        onClick={isLoading ? undefined : onClose}
      />

      <div className='relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl'>
        <div className='flex items-center justify-between border-b border-slate-200 px-5 py-4'>
          <div className='flex items-center gap-2'>
            <div className='grid h-9 w-9 place-items-center rounded-xl bg-purple-50 text-purple-700'>
              <Shield size={18} />
            </div>
            <div>
              <div className='text-lg font-semibold text-slate-900'>
                Archive auction
              </div>
              <div className='text-xs text-slate-600'>
                This will set status to{' '}
                <span className='font-semibold'>archived</span>.
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

        <div className='p-5'>
          <div className='rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800'>
            <div className='flex items-start gap-2'>
              <AlertTriangle size={18} className='mt-0.5' />
              <div>
                You are about to archive auction{' '}
                <span className='font-semibold'>#{auction?.id}</span> —{' '}
                <span className='font-semibold'>{auction?.title}</span>.
              </div>
            </div>
          </div>

          <div className='mt-4 grid gap-2 text-sm text-slate-700 sm:grid-cols-2'>
            <div>
              <span className='font-medium'>Status:</span>{' '}
              <AuctionStatusPill status={auction?.status} />
            </div>
            <div>
              <span className='font-medium'>Seller:</span>{' '}
              {auction?.seller?.fullName || '—'}
            </div>
            <div>
              <span className='font-medium'>Category:</span>{' '}
              {auction?.category?.name || '—'}
            </div>
            <div>
              <span className='font-medium'>End:</span>{' '}
              {formatDate(auction?.endTime)}
            </div>
          </div>

          <div className='mt-5 flex items-center justify-end gap-2'>
            <button
              onClick={onClose}
              disabled={isLoading}
              className='rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60'
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              disabled={isLoading}
              className='inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60'
            >
              <Archive size={16} />
              {isLoading ? 'Archiving…' : 'Archive'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuctionsTab() {
  const auctions = useAuctionsStore();

  const {
    items,
    page,
    limit,
    total,
    totalPages,
    isLoading,
    error,
    success,
    clearMessages,
    fetchAuctions,
    updateAuction,
  } = auctions;

  // Filters
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Archive modal
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const rows = useMemo(() => items || [], [items]);

  useEffect(() => {
    clearMessages?.();
    fetchAuctions?.({
      page: 1,
      limit: 12,
      sortBy,
      sortOrder,
      status: status || undefined,
      q: q || undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load(nextPage = 1) {
    clearMessages?.();
    await fetchAuctions?.({
      page: nextPage,
      limit,
      sortBy,
      sortOrder,
      status: status || undefined,
      q: q || undefined,
    });
  }

  async function onApplyFilters() {
    await load(1);
  }

  async function onRefresh() {
    await load(page || 1);
  }

  function openArchive(a) {
    clearMessages?.();
    setSelected(a);
    setArchiveOpen(true);
  }

  function closeArchive() {
    setArchiveOpen(false);
    setSelected(null);
  }

  async function confirmArchive() {
    if (!selected?.id) return;
    const updated = await updateAuction?.(selected.id, { status: 'archived' });
    if (updated) {
      setSelected(updated);
      closeArchive();
    }
  }

  return (
    <div>
      {/* Header */}
      <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <div className='flex items-center gap-2'>
            <div className='grid h-9 w-9 place-items-center rounded-xl bg-purple-50 text-purple-700'>
              <Gavel size={18} />
            </div>
            <div className='text-lg font-semibold text-slate-900'>Auctions</div>
          </div>
          <div className='mt-1 text-sm text-slate-600'>
            Review auctions and update status where allowed.
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className='inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60'
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters card */}
      <div className='mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
        <div className='mb-3 flex items-center gap-2'>
          <Filter size={16} className='text-slate-700' />
          <div className='text-sm font-semibold text-slate-900'>Filters</div>
        </div>

        <div className='grid gap-3 md:grid-cols-4'>
          <div className='md:col-span-2'>
            <div className='mb-1 text-xs font-semibold text-slate-600'>
              Search
            </div>
            <div className='relative'>
              <Search
                size={16}
                className='absolute left-3 top-2.5 text-slate-400'
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder='Search title/description…'
                className='w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <div className='mb-1 text-xs font-semibold text-slate-600'>
              Status
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
              disabled={isLoading}
            >
              <option value=''>All</option>
              <option value='active'>Active</option>
              <option value='finished'>Finished</option>
              <option value='archived'>Archived</option>
            </select>
          </div>

          <div>
            <div className='mb-1 text-xs font-semibold text-slate-600'>
              Sort
            </div>
            <div className='flex gap-2'>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
                disabled={isLoading}
              >
                <option value='createdAt'>Created</option>
                <option value='endTime'>End time</option>
                <option value='startTime'>Start time</option>
                <option value='startingPrice'>Starting price</option>
                <option value='title'>Title</option>
              </select>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className='w-28 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
                disabled={isLoading}
              >
                <option value='desc'>Desc</option>
                <option value='asc'>Asc</option>
              </select>
            </div>
          </div>
        </div>

        <div className='mt-4 flex flex-wrap items-center justify-end gap-2'>
          <button
            onClick={() => {
              setQ('');
              setStatus('');
              setSortBy('createdAt');
              setSortOrder('desc');
              setTimeout(() => onApplyFilters(), 0);
            }}
            disabled={isLoading}
            className='rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60'
          >
            Reset
          </button>

          <button
            onClick={onApplyFilters}
            disabled={isLoading}
            className='rounded-xl bg-linear-to-r from-purple-700 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-95 disabled:opacity-60'
          >
            Apply
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
          <table className='min-w-262.5 w-full text-left text-sm'>
            <thead className='bg-slate-50 text-xs uppercase tracking-wide text-slate-600'>
              <tr>
                <th className='px-4 py-3'>Auction</th>
                <th className='px-4 py-3'>Seller</th>
                <th className='px-4 py-3'>Category</th>
                <th className='px-4 py-3'>Time</th>
                <th className='px-4 py-3'>Prices</th>
                <th className='px-4 py-3'>Status</th>
                <th className='px-4 py-3 text-right'>Actions</th>
              </tr>
            </thead>

            <tbody className='divide-y divide-slate-200'>
              {isLoading && rows.length === 0 && (
                <>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className='animate-pulse'>
                      <td className='px-4 py-3'>
                        <div className='h-4 w-64 rounded bg-slate-200' />
                        <div className='mt-2 h-3 w-40 rounded bg-slate-200' />
                      </td>
                      <td className='px-4 py-3'>
                        <div className='h-4 w-40 rounded bg-slate-200' />
                      </td>
                      <td className='px-4 py-3'>
                        <div className='h-4 w-28 rounded bg-slate-200' />
                      </td>
                      <td className='px-4 py-3'>
                        <div className='h-4 w-60 rounded bg-slate-200' />
                      </td>
                      <td className='px-4 py-3'>
                        <div className='h-4 w-32 rounded bg-slate-200' />
                      </td>
                      <td className='px-4 py-3'>
                        <div className='h-6 w-20 rounded bg-slate-200' />
                      </td>
                      <td className='px-4 py-3'>
                        <div className='ml-auto h-8 w-40 rounded bg-slate-200' />
                      </td>
                    </tr>
                  ))}
                </>
              )}

              {!isLoading && rows.length === 0 && (
                <tr>
                  <td className='px-4 py-6 text-slate-600' colSpan={7}>
                    No auctions found.
                  </td>
                </tr>
              )}

              {rows.map((a) => {
                const title = normalizeStr(a.title) || '—';
                const sellerName = a?.seller?.fullName || '—';
                const categoryName = a?.category?.name || '—';
                const cp =
                  a.currentPrice !== null && a.currentPrice !== undefined
                    ? a.currentPrice
                    : null;

                return (
                  <tr key={a.id} className='hover:bg-slate-50'>
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-3'>
                        <div className='h-12 w-12 overflow-hidden rounded-xl bg-slate-100'>
                          {a.imageUrl ? (
                            <img
                              src={a.imageUrl}
                              alt={title}
                              className='h-full w-full object-cover'
                            />
                          ) : null}
                        </div>
                        <div className='min-w-0'>
                          <div className='truncate font-semibold text-slate-900'>
                            {title}
                          </div>
                          <div className='mt-1 text-xs text-slate-600'>
                            #{a.id}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className='px-4 py-3 text-slate-700'>{sellerName}</td>
                    <td className='px-4 py-3 text-slate-700'>{categoryName}</td>

                    <td className='px-4 py-3 text-slate-700'>
                      <div className='text-xs'>
                        <div>
                          <span className='font-semibold'>Start:</span>{' '}
                          {formatDate(a.startTime)}
                        </div>
                        <div className='mt-1'>
                          <span className='font-semibold'>End:</span>{' '}
                          {formatDate(a.endTime)}
                        </div>
                      </div>
                    </td>

                    <td className='px-4 py-3 text-slate-700'>
                      <div className='text-xs'>
                        <div>
                          <span className='font-semibold'>Start:</span>{' '}
                          {formatMoney(a.startingPrice)}
                        </div>
                        <div className='mt-1'>
                          <span className='font-semibold'>Current:</span>{' '}
                          {cp === null ? '—' : formatMoney(cp)}
                        </div>
                      </div>
                    </td>

                    <td className='px-4 py-3'>
                      <AuctionStatusPill status={a.status} />
                    </td>

                    <td className='px-4 py-3'>
                      <div className='flex justify-end gap-2'>
                        <Link
                          to={`/auctions/${a.id}`}
                          className='inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50'
                        >
                          <Eye size={14} />
                          View
                        </Link>

                        <button
                          onClick={() => openArchive(a)}
                          disabled={isLoading || !canAdminArchive(a)}
                          className='inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50'
                          title={
                            canAdminArchive(a)
                              ? 'Archive auction'
                              : 'Already archived'
                          }
                        >
                          <Archive size={14} />
                          Archive
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className='flex flex-col gap-2 border-t border-slate-200 px-4 py-3 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            Total: <span className='font-semibold'>{total}</span> · Page{' '}
            <span className='font-semibold'>{page}</span> /{' '}
            <span className='font-semibold'>{totalPages || 1}</span>
          </div>

          <div className='flex items-center gap-2'>
            <button
              onClick={() => load(Math.max(1, (page || 1) - 1))}
              disabled={isLoading || (page || 1) <= 1}
              className='rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50'
            >
              Prev
            </button>

            <button
              onClick={() => load(Math.min(totalPages || 1, (page || 1) + 1))}
              disabled={isLoading || (page || 1) >= (totalPages || 1)}
              className='rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50'
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Archive modal */}
      <ArchiveModal
        open={archiveOpen}
        auction={selected}
        isLoading={isLoading}
        onClose={closeArchive}
        onConfirm={confirmArchive}
      />
    </div>
  );
}
