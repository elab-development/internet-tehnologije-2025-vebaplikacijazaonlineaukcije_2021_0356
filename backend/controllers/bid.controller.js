import { prisma } from '../prismaClient.js';

const toInt = (v) => {
  const n = Number(v);
  return Number.isInteger(n) ? n : null;
};

const toAmount = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/**
 * BUYER ONLY (must be active)
 * POST /api/bids
 * Body: { auctionId, amount }
 *
 * Rules:
 * - buyer must be active
 * - auction must be active
 * - now must be between startTime and endTime
 * - amount must be > currentPrice (if exists), else > startingPrice
 * - if a bid already exists for (userId, auctionId), update amount + timestamp
 * - no delete, no separate update endpoint
 */
export const createOrUpdateBid = async (req, res) => {
  try {
    if (req.user.status !== 'active') {
      return res.status(403).json({ message: 'Buyer account is not active' });
    }

    const { auctionId, amount } = req.body;

    const aid = toInt(auctionId);
    if (!aid) return res.status(400).json({ message: 'Invalid auctionId' });

    const amt = toAmount(amount);
    if (amt === null)
      return res.status(400).json({ message: 'Invalid amount' });

    const result = await prisma.$transaction(async (tx) => {
      const auction = await tx.auction.findUnique({
        where: { id: aid },
        select: {
          id: true,
          status: true,
          startTime: true,
          endTime: true,
          startingPrice: true,
          currentPrice: true,
        },
      });

      if (!auction) {
        return { error: { status: 404, message: 'Auction not found' } };
      }

      if (auction.status !== 'active') {
        return { error: { status: 400, message: 'Auction is not active' } };
      }

      const now = new Date();
      if (now < auction.startTime || now > auction.endTime) {
        return {
          error: { status: 400, message: 'Auction is not currently running' },
        };
      }

      const min = auction.currentPrice ?? auction.startingPrice;
      if (!(amt > Number(min))) {
        return {
          error: {
            status: 400,
            message: `Bid amount must be greater than ${Number(min)}`,
          },
        };
      }

      const auctionUpdate = await tx.auction.updateMany({
        where: {
          id: aid,
          status: 'active',
          startTime: { lte: now },
          endTime: { gte: now },
          OR: [
            { currentPrice: null, startingPrice: { lt: amt } },
            { currentPrice: { lt: amt } },
          ],
        },
        data: { currentPrice: amt },
      });

      if (auctionUpdate.count !== 1) {
        return {
          error: {
            status: 409,
            message:
              'Bid conflict: current price changed. Please retry with a higher amount.',
          },
        };
      }

      const bid = await tx.bid.upsert({
        where: {
          userId_auctionId: {
            userId: req.user.id,
            auctionId: aid,
          },
        },
        update: {
          amount: amt,
          createdAt: now,
        },
        create: {
          userId: req.user.id,
          auctionId: aid,
          amount: amt,
          createdAt: now,
        },
        select: {
          id: true,
          amount: true,
          createdAt: true,
          userId: true,
          auctionId: true,
        },
      });

      return { bid, currentPrice: amt };
    });

    if (result?.error) {
      return res
        .status(result.error.status)
        .json({ message: result.error.message });
    }

    return res.status(201).json({
      bid: result.bid,
      auction: { id: result.bid.auctionId, currentPrice: result.currentPrice },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to place bid' });
  }
};

/**
 * ADMIN OR SELLER
 * GET /api/bids?auctionId=123
 *
 * Rules:
 * - auctionId is required
 * - admin can see all bids
 * - seller can see bids only if auction status is finished or archived
 * - seller can see bids only for their own auction
 */
export const listBidsByAuction = async (req, res) => {
  try {
    const { auctionId } = req.query;

    const aid = toInt(auctionId);
    if (!aid)
      return res
        .status(400)
        .json({ message: 'auctionId is required and must be an integer' });

    const auction = await prisma.auction.findUnique({
      where: { id: aid },
      select: {
        id: true,
        status: true,
        sellerId: true,
      },
    });

    if (!auction) return res.status(404).json({ message: 'Auction not found' });

    const isAdmin = req.user.role === 'admin';
    const isSeller = req.user.role === 'seller';

    if (isSeller) {
      if (auction.sellerId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      if (auction.status === 'active') {
        return res
          .status(403)
          .json({ message: 'Bids are not visible while auction is active' });
      }

      if (auction.status !== 'finished' && auction.status !== 'archived') {
        return res
          .status(403)
          .json({ message: 'Bids are not available for this auction status' });
      }
    }

    if (!isAdmin && !isSeller) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const bids = await prisma.bid.findMany({
      where: { auctionId: aid },
      orderBy: { amount: 'desc' },
      select: {
        id: true,
        amount: true,
        createdAt: true,
        user: { select: { id: true, fullName: true, email: true } },
      },
    });

    return res.json({
      auction: { id: auction.id, status: auction.status },
      bids,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to list bids' });
  }
};

/**
 * AUTH
 * GET /api/bids/me?auctionId=123
 *
 * Returns:
 * - { bid: { id, amount, createdAt, auctionId } } OR { bid: null }
 */
export const getMyBidForAuction = async (req, res) => {
  try {
    const { auctionId } = req.query;

    const aid = toInt(auctionId);
    if (!aid) {
      return res
        .status(400)
        .json({ message: 'auctionId is required and must be an integer' });
    }

    const exists = await prisma.auction.findUnique({
      where: { id: aid },
      select: { id: true },
    });
    if (!exists) return res.status(404).json({ message: 'Auction not found' });

    const bid = await prisma.bid.findUnique({
      where: {
        userId_auctionId: {
          userId: req.user.id,
          auctionId: aid,
        },
      },
      select: {
        id: true,
        amount: true,
        createdAt: true,
        auctionId: true,
      },
    });

    return res.json({ bid: bid || null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch my bid' });
  }
};