import { prisma } from '../prismaClient.js';

const toInt = (v) => {
  const n = Number(v);
  return Number.isInteger(n) ? n : null;
};

const allowedSort = new Set(['finalPrice', 'addedAt']);

/**
 * AUTH REQUIRED
 * GET /api/cart-items
 *
 * Admin:
 * - can see all cart items
 * - can filter by buyerId
 * - can sort by finalPrice or addedAt
 *
 * Seller:
 * - can see cart items ONLY for auctions where sellerId = req.user.id
 *
 * Buyer:
 * - can see ONLY their own cart items
 *
 * Query params:
 * - buyerId (admin only)
 * - sortBy: finalPrice | addedAt (default addedAt)
 * - sortOrder: asc | desc (default desc)
 * - page, limit
 */
export const listCartItems = async (req, res) => {
  try {
    const {
      buyerId,
      sortBy = 'addedAt',
      sortOrder = 'desc',
      page = '1',
      limit = '12',
    } = req.query;

    const role = req.user.role;
    const isAdmin = role === 'admin';
    const isSeller = role === 'seller';
    const isBuyer = role === 'buyer';

    const orderByField = allowedSort.has(sortBy) ? sortBy : 'addedAt';
    const order = sortOrder === 'asc' ? 'asc' : 'desc';

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(50, Math.max(1, Number(limit) || 12));
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    if (isAdmin) {
      if (buyerId !== undefined) {
        const bid = toInt(buyerId);
        if (!bid) return res.status(400).json({ message: 'Invalid buyerId' });
        where.userId = bid;
      }
    } else if (isSeller) {
      where.auction = { sellerId: req.user.id };
    } else if (isBuyer) {
      where.userId = req.user.id;
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const [items, total] = await Promise.all([
      prisma.cartItem.findMany({
        where,
        orderBy: { [orderByField]: order },
        skip,
        take: limitNum,
        select: {
          id: true,
          finalPrice: true,
          addedAt: true,
          userId: true,
          auctionId: true,
          user: { select: { id: true, fullName: true, email: true } },
          auction: {
            select: {
              id: true,
              title: true,
              status: true,
              endTime: true,
              sellerId: true,
              categoryId: true,
            },
          },
        },
      }),
      prisma.cartItem.count({ where }),
    ]);

    return res.json({
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      items,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to list cart items' });
  }
};

/**
 * AUTH REQUIRED
 * GET /api/cart-items/:id
 *
 * Same access rules as list:
 * - admin: any
 * - seller: only if cartItem.auction.sellerId == seller
 * - buyer: only if cartItem.userId == buyer
 */
export const getCartItemById = async (req, res) => {
  try {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid cartItem id' });

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      select: {
        id: true,
        finalPrice: true,
        addedAt: true,
        user: { select: { id: true, fullName: true, email: true, role: true } },
        auction: {
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            startingPrice: true,
            currentPrice: true,
            startTime: true,
            endTime: true,
            status: true,
            sellerId: true,
            seller: { select: { id: true, fullName: true, email: true } },
            category: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!cartItem)
      return res.status(404).json({ message: 'CartItem not found' });

    const isAdmin = req.user.role === 'admin';
    const isSeller = req.user.role === 'seller';
    const isBuyer = req.user.role === 'buyer';

    if (isAdmin) {
      return res.json({ cartItem });
    }

    if (isBuyer) {
      if (cartItem.user.id !== req.user.id)
        return res.status(403).json({ message: 'Forbidden' });
      return res.json({ cartItem });
    }

    if (isSeller) {
      if (cartItem.auction.sellerId !== req.user.id)
        return res.status(403).json({ message: 'Forbidden' });
      return res.json({ cartItem });
    }

    return res.status(403).json({ message: 'Forbidden' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch cart item' });
  }
};