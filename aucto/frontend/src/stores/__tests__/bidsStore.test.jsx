import { describe, it, expect, beforeEach, vi } from 'vitest';

// 1) Mock apiFetch
vi.mock('../../lib/api', () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from '../../lib/api';
import { useBidsStore } from '../bidsStore';

describe('useBidsStore', () => {
  beforeEach(() => {
    // reset store state pre svakog testa
    useBidsStore.setState({
      bids: [],
      auctionMeta: null,
      isLoading: false,
      error: null,
      success: null,
      myBidByAuction: {},
    });

    vi.clearAllMocks();
  });

  it('placeBid -> success sets success message and returns data', async () => {
    apiFetch.mockResolvedValueOnce({
      auction: { id: 10, currentPrice: 123.45 },
    });

    const res = await useBidsStore.getState().placeBid({
      auctionId: 10,
      amount: 123.45,
    });

    expect(apiFetch).toHaveBeenCalledWith('/api/bids', {
      method: 'POST',
      body: JSON.stringify({ auctionId: 10, amount: 123.45 }),
    });

    const st = useBidsStore.getState();
    expect(st.isLoading).toBe(false);
    expect(st.error).toBe(null);
    expect(st.success).toBe('Bid placed successfully');

    expect(res).toEqual({ auction: { id: 10, currentPrice: 123.45 } });
  });

  it('placeBid -> error sets error message and returns null', async () => {
    apiFetch.mockRejectedValueOnce(new Error('No auth'));

    const res = await useBidsStore.getState().placeBid({
      auctionId: 10,
      amount: 200,
    });

    const st = useBidsStore.getState();
    expect(st.isLoading).toBe(false);
    expect(st.success).toBe(null);
    expect(st.error).toBe('No auth');
    expect(res).toBe(null);
  });

  it('fetchBidsByAuction -> sets bids and auctionMeta', async () => {
    apiFetch.mockResolvedValueOnce({
      bids: [
        { id: 1, amount: 10 },
        { id: 2, amount: 15 },
      ],
      auction: { id: 99, title: 'Test' },
    });

    const res = await useBidsStore.getState().fetchBidsByAuction(99);

    expect(apiFetch).toHaveBeenCalledWith('/api/bids?auctionId=99', {
      method: 'GET',
    });

    const st = useBidsStore.getState();
    expect(st.isLoading).toBe(false);
    expect(st.error).toBe(null);
    expect(st.bids).toHaveLength(2);
    expect(st.auctionMeta).toEqual({ id: 99, title: 'Test' });

    expect(res.bids).toHaveLength(2);
  });

  it('fetchBidsByAuction -> error clears bids and sets error', async () => {
    apiFetch.mockRejectedValueOnce(new Error('Forbidden'));

    const res = await useBidsStore.getState().fetchBidsByAuction(77);

    const st = useBidsStore.getState();
    expect(st.isLoading).toBe(false);
    expect(st.bids).toEqual([]);
    expect(st.auctionMeta).toBe(null);
    expect(st.error).toBe('Forbidden');
    expect(res).toBe(null);
  });

  it('fetchMyBidForAuction -> stores bid in myBidByAuction', async () => {
    apiFetch.mockResolvedValueOnce({
      bid: { id: 5, amount: 33.33 },
    });

    const bid = await useBidsStore.getState().fetchMyBidForAuction(12);

    expect(apiFetch).toHaveBeenCalledWith('/api/bids/me?auctionId=12', {
      method: 'GET',
    });

    const st = useBidsStore.getState();
    expect(st.isLoading).toBe(false);
    expect(st.myBidByAuction[12]).toEqual({ id: 5, amount: 33.33 });
    expect(bid).toEqual({ id: 5, amount: 33.33 });
  });
});