import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../../../stores/bidsStore', () => ({
  useBidsStore: vi.fn(),
}));

vi.mock('../../../../stores/currencyStore', () => ({
  useCurrencyStore: vi.fn(),
}));

import BidBox from '../BidBox';
import { useBidsStore } from '../../../../stores/bidsStore';
import { useCurrencyStore } from '../../../../stores/currencyStore';

function setupStores({
  placeBidImpl,
  fetchMyBidImpl,
  isLoading = false,
  error = null,
  success = null,
  inputToUSDImpl,
  formatUSDImpl,
} = {}) {
  const placeBid = placeBidImpl || vi.fn();
  const fetchMyBidForAuction = fetchMyBidImpl || vi.fn();
  const clearMessages = vi.fn();

  // ✅ useBidsStore() kod tebe se koristi BEZ selector-a
  useBidsStore.mockImplementation((selector) => {
    const state = {
      placeBid,
      fetchMyBidForAuction,
      isLoading,
      error,
      success,
      clearMessages,
    };
    return typeof selector === 'function' ? selector(state) : state;
  });

  const inputToUSD = inputToUSDImpl || ((x) => x);
  const formatUSD = formatUSDImpl || ((x) => `$${Number(x).toFixed(2)}`);

  useCurrencyStore.mockImplementation((selector) => {
    const state = { inputToUSD, formatUSD };
    return typeof selector === 'function' ? selector(state) : state;
  });

  return { placeBid, fetchMyBidForAuction, clearMessages };
}

describe('BidBox', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders warning when auction is not running and disables input/button', () => {
    setupStores();

    render(
      <BidBox
        auctionId={1}
        currentPrice={100}
        isAuctionRunning={false}
        myBid={null}
      />,
    );

    expect(
      screen.getByText(/Bidding is currently closed/i),
    ).toBeInTheDocument();

    const input = screen.getByRole('spinbutton');
    expect(input).toBeDisabled();

    const btn = screen.getByRole('button', { name: /Place bid/i });
    expect(btn).toBeDisabled();
  });

  it('submits bid: converts amount to USD, calls placeBid, clears input and triggers refreshes on success', async () => {
    const user = userEvent.setup();

    const placeBid = vi.fn().mockResolvedValue({
      auction: { currentPrice: 150 },
    });

    const fetchMyBidForAuction = vi.fn().mockResolvedValue({
      bid: { amount: 150 },
    });

    const onBidSuccess = vi.fn();

    setupStores({
      placeBidImpl: placeBid,
      fetchMyBidImpl: fetchMyBidForAuction,
      inputToUSDImpl: (x) => x * 2, // 60 -> 120
      formatUSDImpl: (x) => `$${Number(x).toFixed(2)}`,
    });

    render(
      <BidBox
        auctionId={10}
        currentPrice={100}
        isAuctionRunning={true}
        myBid={null}
        onBidSuccess={onBidSuccess}
      />,
    );

    const input = screen.getByRole('spinbutton');
    await user.clear(input);
    await user.type(input, '60');

    await user.click(screen.getByRole('button', { name: /Place bid/i }));

    expect(placeBid).toHaveBeenCalledWith({ auctionId: 10, amount: 120 });
    expect(fetchMyBidForAuction).toHaveBeenCalledWith(10);
    expect(onBidSuccess).toHaveBeenCalled();

    // input ispraznjen
    expect(input).toHaveDisplayValue('');
  });

  it('does not submit if amount is not finite (empty input)', async () => {
    const user = userEvent.setup();

    const placeBid = vi.fn();
    setupStores({ placeBidImpl: placeBid });

    render(
      <BidBox
        auctionId={10}
        currentPrice={100}
        isAuctionRunning={true}
        myBid={null}
      />,
    );

    const input = screen.getByRole('spinbutton');
    await user.clear(input);

    await user.click(screen.getByRole('button', { name: /Place bid/i }));

    expect(placeBid).not.toHaveBeenCalled();
  });

  it('shows myBid info when provided', () => {
    setupStores({
      formatUSDImpl: (x) => `USD(${x})`,
    });

    render(
      <BidBox
        auctionId={1}
        currentPrice={100}
        isAuctionRunning={true}
        myBid={{ amount: 55.5 }}
      />,
    );

    expect(screen.getByText(/Your current bid:/i)).toBeInTheDocument();
    expect(screen.getByText('USD(55.5)')).toBeInTheDocument();
  });

  it('shows error message from store', () => {
    setupStores({ error: 'Failed to place bid' });

    render(
      <BidBox
        auctionId={1}
        currentPrice={100}
        isAuctionRunning={true}
        myBid={null}
      />,
    );

    expect(screen.getByText('Failed to place bid')).toBeInTheDocument();
  });

  it('shows success message from store', () => {
    setupStores({ success: 'Bid placed successfully' });

    render(
      <BidBox
        auctionId={1}
        currentPrice={100}
        isAuctionRunning={true}
        myBid={null}
      />,
    );

    expect(screen.getByText('Bid placed successfully')).toBeInTheDocument();
  });
});