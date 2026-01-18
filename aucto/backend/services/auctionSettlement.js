import { prisma } from '../prismaClient.js';

/**
 * Settle auctions that have ended
 */
export const settleEndedAuctions = async () => {
  const now = new Date();

  // 1) Find candidates
  const ended = await prisma.auction.findMany({
    where: {
      status: 'active',
      endTime: { lte: now },
    },
    select: {
      id: true,
      currentPrice: true,
    },
    take: 50,
  });

  if (ended.length === 0) return { processed: 0 };

  let processed = 0;

  for (const a of ended) {
    const result = await prisma.$transaction(async (tx) => {
      const auction = await tx.auction.findUnique({
        where: { id: a.id },
        select: {
          id: true,
          status: true,
          endTime: true,
          currentPrice: true,
          startingPrice: true,
        },
      });

      if (!auction) return { skipped: true, reason: 'not_found' };

      if (auction.status !== 'active')
        return { skipped: true, reason: 'already_settled' };

      if (auction.endTime > now) return { skipped: true, reason: 'not_ended' };

      await tx.auction.update({
        where: { id: auction.id },
        data: { status: 'finished' },
      });

      if (auction.currentPrice === null) {
        return { finished: true, hasWinner: false };
      }

      // 2) Find winning bid
      const winningBid = await tx.bid.findFirst({
        where: { auctionId: auction.id },
        orderBy: [{ amount: 'desc' }, { createdAt: 'asc' }],
        select: {
          id: true,
          userId: true,
          amount: true,
          createdAt: true,
        },
      });

      if (!winningBid) {
        return {
          finished: true,
          hasWinner: false,
          warning: 'currentPrice_without_bids',
        };
      }

      // 3) Create CartItem for winner
      await tx.cartItem.upsert({
        where: {
          auctionId: auction.id,
        },
        update: {
          finalPrice: winningBid.amount,
          userId: winningBid.userId,
          addedAt: now,
        },
        create: {
          auctionId: auction.id,
          userId: winningBid.userId,
          finalPrice: winningBid.amount,
          addedAt: now,
        },
      });

      return {
        finished: true,
        hasWinner: true,
        winnerUserId: winningBid.userId,
        finalPrice: winningBid.amount,
      };
    });

    if (!result?.skipped) processed += 1;
  }

  return { processed };
};
