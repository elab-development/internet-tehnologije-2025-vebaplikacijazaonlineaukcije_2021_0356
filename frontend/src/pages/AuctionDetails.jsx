import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Gavel, Clock, Tag, User, Shield, Info } from 'lucide-react';

import { useAuthStore } from '../stores/authStore';
import { useAuctionsStore } from '../stores/auctionsStore';
import { useBidsStore } from '../stores/bidsStore';

import BidBox from '../components/auctions/details/BidBox';
import BidsPanel from '../components/auctions/details/BidsPanel';

function formatMoney(v) {
  if (v === null || v === undefined) return '—';
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return n.toFixed(2);
}

function formatDate(d) {
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return '—';
  return dt.toLocaleString();
}

export default function AuctionDetails() {
  const { id } = useParams();
  const auctionId = Number(id);

  const user = useAuthStore((s) => s.user);

  const { auction, isLoading, error, fetchAuctionById } = useAuctionsStore();

  const {
    bids,
    fetchBidsByAuction,
    isLoading: bidsLoading,
    error: bidsError,
    myBidByAuction,
    fetchMyBidForAuction,
  } = useBidsStore();

  const myBid = myBidByAuction?.[auctionId] || null;

  const [bidsLoaded, setBidsLoaded] = useState(false);
  const [myBidLoaded, setMyBidLoaded] = useState(false);

  useEffect(() => {
    if (!auctionId) return;
    fetchAuctionById(auctionId);
  }, [auctionId, fetchAuctionById]);

  const role = user?.role; // buyer | seller | admin
  const isAdmin = role === 'admin';

  const isSellerOwner = useMemo(() => {
    if (!user || !auction) return false;
    return user.role === 'seller' && auction?.seller?.id === user.id;
  }, [user, auction]);

  const canSeeBids = useMemo(() => {
    if (!user || !auction) return false;
    if (isAdmin) return true;

    if (
      isSellerOwner &&
      (auction.status === 'finished' || auction.status === 'archived')
    ) {
      return true;
    }

    return false;
  }, [user, auction, isAdmin, isSellerOwner]);

  useEffect(() => {
    if (!auctionId) return;
    if (!canSeeBids) return;
    if (bidsLoaded) return;

    fetchBidsByAuction(auctionId).finally(() => setBidsLoaded(true));
  }, [auctionId, canSeeBids, bidsLoaded, fetchBidsByAuction]);

  useEffect(() => {
    if (!auctionId) return;
    if (!user) return;
    if (user.role !== 'buyer') return;
    if (myBidLoaded) return;

    fetchMyBidForAuction(auctionId).finally(() => setMyBidLoaded(true));
  }, [auctionId, user, myBidLoaded, fetchMyBidForAuction]);

  const price =
    auction?.currentPrice !== null && auction?.currentPrice !== undefined
      ? auction.currentPrice
      : auction?.startingPrice;

  const isAuctionRunning = useMemo(() => {
    if (!auction) return false;
    const now = new Date();
    const st = new Date(auction.startTime);
    const et = new Date(auction.endTime);
    return auction.status === 'active' && now >= st && now <= et;
  }, [auction]);

  return (
    <div className='mx-auto w-full max-w-6xl px-4 py-8'>
      {error && (
        <div className='mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
          {error}
        </div>
      )}

      {!error && !auction && isLoading && (
        <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
          <div className='h-6 w-64 animate-pulse rounded bg-slate-200' />
          <div className='mt-4 h-4 w-full animate-pulse rounded bg-slate-200' />
          <div className='mt-2 h-4 w-5/6 animate-pulse rounded bg-slate-200' />
        </div>
      )}

      {auction && (
        <div className='grid gap-6 lg:grid-cols-3'>
          {/* Left */}
          <div className='lg:col-span-2'>
            <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
              <div className='aspect-square w-full overflow-hidden bg-slate-100'>
                <img
                  src={auction.imageUrl}
                  alt={auction.title}
                  className='h-full w-full object-cover'
                />
              </div>

              <div className='p-6'>
                <div className='flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
                  <div className='min-w-0'>
                    <div className='flex items-center gap-2'>
                      <div className='grid h-9 w-9 place-items-center rounded-xl bg-purple-50 text-purple-700'>
                        <Gavel size={18} />
                      </div>
                      <h1 className='truncate text-xl font-semibold text-slate-900'>
                        {auction.title}
                      </h1>
                    </div>

                    <div className='mt-3 text-sm text-slate-700'>
                      {auction.description}
                    </div>
                  </div>

                  <div className='mt-4 shrink-0 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-600 px-5 py-4 text-white sm:mt-0'>
                    <div className='text-xs text-white/80'>Current price</div>
                    <div className='text-2xl font-semibold'>
                      {formatMoney(price)}
                    </div>
                    <div className='mt-1 text-xs text-white/80'>
                      Status:{' '}
                      <span className='font-semibold'>{auction.status}</span>
                    </div>
                  </div>
                </div>

                <div className='mt-6 grid gap-2 text-sm text-slate-700 sm:grid-cols-2'>
                  <div className='flex items-center gap-2'>
                    <Clock size={16} className='text-slate-500' />
                    <span>
                      <span className='font-medium'>Start:</span>{' '}
                      {formatDate(auction.startTime)}
                    </span>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Clock size={16} className='text-slate-500' />
                    <span>
                      <span className='font-medium'>End:</span>{' '}
                      {formatDate(auction.endTime)}
                    </span>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Tag size={16} className='text-slate-500' />
                    <span>
                      <span className='font-medium'>Category:</span>{' '}
                      {auction.category?.name || '—'}
                    </span>
                  </div>

                  <div className='flex items-center gap-2'>
                    <User size={16} className='text-slate-500' />
                    <span>
                      <span className='font-medium'>Seller:</span>{' '}
                      {auction.seller?.fullName || '—'}
                    </span>
                  </div>
                </div>

                {!user && (
                  <div className='mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700'>
                    <div className='flex items-start gap-2'>
                      <Info size={18} className='mt-0.5 text-slate-500' />
                      <div>
                        You can view this auction, but to place a bid you need
                        to{' '}
                        <Link
                          to='/login'
                          className='font-semibold text-purple-700 hover:underline'
                        >
                          login
                        </Link>
                        .
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {canSeeBids && (
              <div className='mt-6'>
                <BidsPanel
                  isAdmin={isAdmin}
                  bids={bids}
                  isLoading={bidsLoading}
                  error={bidsError}
                />
              </div>
            )}
          </div>

          {/* Right */}
          <div className='space-y-4'>
            <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
              <div className='mb-2 flex items-center gap-2'>
                {isAdmin ? (
                  <Shield size={18} className='text-slate-700' />
                ) : (
                  <Gavel size={18} className='text-slate-700' />
                )}
                <div className='text-base font-semibold text-slate-900'>
                  Actions
                </div>
              </div>

              {user?.role === 'buyer' ? (
                <BidBox
                  auctionId={auction.id}
                  currentPrice={price}
                  isAuctionRunning={isAuctionRunning}
                  myBid={myBid}
                  onBidSuccess={async () => {
                    await fetchAuctionById(auctionId);
                    await fetchMyBidForAuction(auctionId);
                  }}
                />
              ) : !user ? (
                <div className='mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700'>
                  <div className='font-medium text-slate-900'>
                    Want to place a bid?
                  </div>
                  <div className='mt-1'>
                    Please{' '}
                    <Link
                      to='/login'
                      className='font-semibold text-purple-700 hover:underline'
                    >
                      login
                    </Link>{' '}
                    as a buyer.
                  </div>
                </div>
              ) : (
                <div className='mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700'>
                  <div className='font-medium text-slate-900'>
                    Bidding unavailable
                  </div>
                  <div className='mt-1'>
                    Only users with role{' '}
                    <span className='font-semibold'>buyer</span> can place bids.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}