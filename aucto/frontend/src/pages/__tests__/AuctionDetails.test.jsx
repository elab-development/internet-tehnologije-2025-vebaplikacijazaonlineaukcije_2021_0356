import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('../../components/auctions/details/BidBox', () => ({
  default: () => <div data-testid='bidbox'>BidBox</div>,
}));

vi.mock('../../components/auctions/details/BidsPanel', () => ({
  default: () => <div data-testid='bidspanel'>BidsPanel</div>,
}));

// Mock store hookovi
vi.mock('../../stores/authStore', () => ({ useAuthStore: vi.fn() }));
vi.mock('../../stores/auctionsStore', () => ({ useAuctionsStore: vi.fn() }));
vi.mock('../../stores/bidsStore', () => ({ useBidsStore: vi.fn() }));
vi.mock('../../stores/currencyStore', () => ({ useCurrencyStore: vi.fn() }));

import AuctionDetails from '../AuctionDetails';
import { useAuthStore } from '../../stores/authStore';
import { useAuctionsStore } from '../../stores/auctionsStore';
import { useBidsStore } from '../../stores/bidsStore';
import { useCurrencyStore } from '../../stores/currencyStore';

function mockAll({ role }) {
  useAuthStore.mockImplementation((selector) =>
    selector(
      role ? { user: { id: 1, role, fullName: 'Test' } } : { user: null },
    ),
  );

  useAuctionsStore.mockReturnValue({
    auction: {
      id: 10,
      title: 'Auction',
      description: 'Desc',
      imageUrl: 'x',
      status: 'active',
      startingPrice: 10,
      currentPrice: 15,
      startTime: new Date(Date.now() - 60_000).toISOString(),
      endTime: new Date(Date.now() + 60_000).toISOString(),
      category: { name: 'Cat' },
      seller: { id: 2, fullName: 'Seller' },
    },
    isLoading: false,
    error: null,
    fetchAuctionById: vi.fn().mockResolvedValue({ auction: { id: 10 } }),
  });

  useBidsStore.mockReturnValue({
    bids: [],
    auctionMeta: null,
    isLoading: false,
    error: null,
    myBidByAuction: {},
    fetchBidsByAuction: vi
      .fn()
      .mockResolvedValue({ bids: [], auction: { id: 10 } }),
    fetchMyBidForAuction: vi.fn().mockResolvedValue({ bid: null }),
  });

  useCurrencyStore.mockImplementation((selector) =>
    selector({ formatUSD: (n) => `$${Number(n).toFixed(2)}` }),
  );
}

describe('AuctionDetails role rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('buyer sees BidBox', () => {
    mockAll({ role: 'buyer' });

    render(
      <MemoryRouter initialEntries={['/auctions/10']}>
        <Routes>
          <Route path='/auctions/:id' element={<AuctionDetails />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('bidbox')).toBeInTheDocument();
  });

  it('admin does NOT see BidBox', () => {
    mockAll({ role: 'admin' });

    render(
      <MemoryRouter initialEntries={['/auctions/10']}>
        <Routes>
          <Route path='/auctions/:id' element={<AuctionDetails />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.queryByTestId('bidbox')).not.toBeInTheDocument();

    expect(screen.getByTestId('bidspanel')).toBeInTheDocument();
  });

  it('guest sees login prompt text', () => {
    mockAll({ role: null });

    render(
      <MemoryRouter initialEntries={['/auctions/10']}>
        <Routes>
          <Route path='/auctions/:id' element={<AuctionDetails />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText(/to place a bid you need to/i)).toBeInTheDocument();

    expect(screen.getAllByText(/login/i).length).toBeGreaterThan(0);

    expect(screen.queryByTestId('bidbox')).not.toBeInTheDocument();
  });
});