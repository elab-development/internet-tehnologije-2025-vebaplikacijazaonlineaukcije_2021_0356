import { prisma } from '../prismaClient.js';

const toInt = (v) => {
  const n = Number(v);
  return Number.isInteger(n) ? n : null;
};

const allowedSort = new Set(['totalPrice', 'orderDate']);

/**
 * AUTH REQUIRED
 * GET /api/orders
 *
 * Admin:
 * - sees all orders
 * - can filter by buyerId and/or sellerId
 * - can sort by totalPrice or orderDate
 *
 * Seller:
 * - sees orders only for auctions where sellerId == req.user.id
 *
 * Buyer:
 * - sees only their orders
 *
 * Query params:
 * - buyerId (admin only)
 * - sellerId (admin only)  [orders for auctions of that seller]
 * - sortBy: totalPrice | orderDate (default orderDate)
 * - sortOrder: asc | desc (default desc)
 * - page, limit
 */
export const listOrders = async (req, res) => {
  try {
    const {
      buyerId,
      sellerId,
      sortBy = 'orderDate',
      sortOrder = 'desc',
      page = '1',
      limit = '12',
    } = req.query;

    const isAdmin = req.user.role === 'admin';
    const isSeller = req.user.role === 'seller';
    const isBuyer = req.user.role === 'buyer';

    const orderByField = allowedSort.has(sortBy) ? sortBy : 'orderDate';
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
      if (sellerId !== undefined) {
        const sid = toInt(sellerId);
        if (!sid) return res.status(400).json({ message: 'Invalid sellerId' });
        where.auction = { sellerId: sid };
      }
    } else if (isSeller) {
      where.auction = { sellerId: req.user.id };
    } else if (isBuyer) {
      where.userId = req.user.id;
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { [orderByField]: order },
        skip,
        take: limitNum,
        select: {
          id: true,
          totalPrice: true,
          orderDate: true,
          userId: true,
          auctionId: true,
          user: { select: { id: true, fullName: true, email: true } },
          auction: {
            select: {
              id: true,
              title: true,
              status: true,
              sellerId: true,
              categoryId: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
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
    return res.status(500).json({ message: 'Failed to list orders' });
  }
};

/**
 * AUTH REQUIRED
 * GET /api/orders/:id
 *
 * Same access rules:
 * - admin: any
 * - seller: only if order.auction.sellerId == seller
 * - buyer: only if order.userId == buyer
 *
 * Response includes order + user + auction details.
 */
export const getOrderById = async (req, res) => {
  try {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid order id' });

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        totalPrice: true,
        orderDate: true,
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

    if (!order) return res.status(404).json({ message: 'Order not found' });

    const isAdmin = req.user.role === 'admin';
    const isSeller = req.user.role === 'seller';
    const isBuyer = req.user.role === 'buyer';

    if (isAdmin) return res.json({ order });

    if (isBuyer) {
      if (order.user.id !== req.user.id)
        return res.status(403).json({ message: 'Forbidden' });
      return res.json({ order });
    }

    if (isSeller) {
      if (order.auction.sellerId !== req.user.id)
        return res.status(403).json({ message: 'Forbidden' });
      return res.json({ order });
    }

    return res.status(403).json({ message: 'Forbidden' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch order' });
  }
};

/**
 * BUYER ONLY
 * POST /api/orders
 * Body: { cartId }
 *
 * Rules:
 * - requester must own the cart item (cartItem.userId == req.user.id)
 * - creates Order from cart item (totalPrice = finalPrice, auctionId, userId)
 * - removes cart item after successful order creation
 *
 * Note: admin could theoretically create too, but we can restrict to buyer only if you want.
 */
export const createOrderFromCartItem = async (req, res) => {
  try {
    const { cartId } = req.body;

    const cid = toInt(cartId);
    if (!cid) return res.status(400).json({ message: 'Invalid cartId' });

    if (req.user.role !== 'buyer') {
      return res.status(403).json({ message: 'Only buyers can create orders' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const cartItem = await tx.cartItem.findUnique({
        where: { id: cid },
        select: {
          id: true,
          userId: true,
          auctionId: true,
          finalPrice: true,
        },
      });

      if (!cartItem) {
        return { error: { status: 404, message: 'CartItem not found' } };
      }

      if (cartItem.userId !== req.user.id) {
        return { error: { status: 403, message: 'Forbidden' } };
      }

      const order = await tx.order.create({
        data: {
          userId: cartItem.userId,
          auctionId: cartItem.auctionId,
          totalPrice: cartItem.finalPrice,
          orderDate: new Date(),
        },
        select: {
          id: true,
          totalPrice: true,
          orderDate: true,
          userId: true,
          auctionId: true,
        },
      });

      await tx.cartItem.delete({ where: { id: cartItem.id } });

      return { order };
    });

    if (result?.error) {
      return res
        .status(result.error.status)
        .json({ message: result.error.message });
    }

    return res.status(201).json({ order: result.order });
  } catch (err) {
    if (err?.code === 'P2002') {
      return res
        .status(409)
        .json({ message: 'Order already exists for this auction' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Failed to create order' });
  }
};