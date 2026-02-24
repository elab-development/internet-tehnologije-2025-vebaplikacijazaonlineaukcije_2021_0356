import { useMemo, useState } from 'react';
import { useBidsStore } from '../../../stores/bidsStore';
import { useCurrencyStore } from '../../../stores/currencyStore';

export default function BidBox({
  auctionId,
  currentPrice,
  isAuctionRunning,
  onBidSuccess,
  myBid,
}) {
  const {
    placeBid,
    fetchMyBidForAuction,
    isLoading,
    error,
    success,
    clearMessages,
  } = useBidsStore();

  const formatUSD = useCurrencyStore((s) => s.formatUSD);
  const inputToUSD = useCurrencyStore((s) => s.inputToUSD);

  const [amount, setAmount] = useState('');

  const minNext = useMemo(() => {
    const n = Number(currentPrice);
    return Number.isFinite(n) ? n : 0;
  }, [currentPrice]);

  async function onSubmit(e) {
    e.preventDefault();
    clearMessages?.();

    const amtInSelected = Number(amount);
    if (!Number.isFinite(amtInSelected)) return;

    const amtUSD = inputToUSD(amtInSelected);
    if (!Number.isFinite(amtUSD)) return;

    const res = await placeBid({ auctionId, amount: amtUSD });

    if (res?.auction?.currentPrice !== undefined) {
      setAmount('');
      await fetchMyBidForAuction(auctionId);
      onBidSuccess?.();
    }
  }

  return (
    <div className='mt-3'>
      {!isAuctionRunning && (
        <div className='mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800'>
          Bidding is currently closed for this auction.
        </div>
      )}

      {myBid?.amount !== undefined && myBid?.amount !== null && (
        <div className='mb-3 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-800'>
          <span className='font-medium'>Your current bid:</span>{' '}
          {formatUSD(myBid.amount)}
        </div>
      )}

      {error && (
        <div className='mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
          {error}
        </div>
      )}

      {success && (
        <div className='mb-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700'>
          {success}
        </div>
      )}

      <form onSubmit={onSubmit} className='space-y-3'>
        <div>
          <div className='mb-2 text-sm font-medium text-slate-700'>
            New bid amount
          </div>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type='number'
            min='0'
            step='0.01'
            placeholder={`Must be > ${formatUSD(minNext)}`}
            className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
            disabled={!isAuctionRunning || isLoading}
            required
          />
          <div className='mt-1 text-xs text-slate-500'>
            Must be greater than current price.
          </div>
        </div>

        <button
          disabled={!isAuctionRunning || isLoading}
          className='w-full rounded-xl bg-linear-to-r from-purple-700 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:opacity-95 disabled:opacity-60'
        >
          {isLoading ? 'Submitting…' : 'Place bid'}
        </button>
      </form>
    </div>
  );
}