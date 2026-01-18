import { prisma } from '../prismaClient.js';
import { uploadImageBuffer } from '../utils/cloudinary.js';

const toInt = (v) => {
  const n = Number(v);
  return Number.isInteger(n) ? n : null;
};

const allowedSort = new Set([
  'title',
  'startingPrice',
  'endTime',
  'startTime',
  'createdAt',
]);

/**
 * PUBLIC
 * GET /api/auctions
 * Query:
 *  - page, limit
 *  - sortBy: title|startingPrice|endTime|startTime|createdAt
 *  - sortOrder: asc|desc
 *  - status, categoryId, sellerId
 *  - q (search in title/description)
 */
export const listAuctions = async (req, res) => {
  try {
    const {
      page = '1',
      limit = '12',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      categoryId,
      sellerId,
      q,
    } = req.query;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(50, Math.max(1, Number(limit) || 12));
    const skip = (pageNum - 1) * limitNum;

    const orderByField = allowedSort.has(sortBy) ? sortBy : 'createdAt';
    const order = sortOrder === 'asc' ? 'asc' : 'desc';

    const where = {};

    if (status) where.status = status;

    if (categoryId) {
      const cid = toInt(categoryId);
      if (!cid) return res.status(400).json({ message: 'Invalid categoryId' });
      where.categoryId = cid;
    }

    if (sellerId) {
      const sid = toInt(sellerId);
      if (!sid) return res.status(400).json({ message: 'Invalid sellerId' });
      where.sellerId = sid;
    }

    if (q && typeof q === 'string' && q.trim()) {
      where.OR = [
        { title: { contains: q.trim() } },
        { description: { contains: q.trim() } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.auction.findMany({
        where,
        orderBy: { [orderByField]: order },
        skip,
        take: limitNum,
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
          createdAt: true,
          sellerId: true,
          categoryId: true,
          seller: { select: { id: true, fullName: true } },
          category: { select: { id: true, name: true } },
        },
      }),
      prisma.auction.count({ where }),
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
    return res.status(500).json({ message: 'Failed to list auctions' });
  }
};

/**
 * PUBLIC
 * GET /api/auctions/:id
 */
export const getAuctionById = async (req, res) => {
  try {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid auction id' });

    const auction = await prisma.auction.findUnique({
      where: { id },
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
        createdAt: true,
        seller: { select: { id: true, fullName: true } },
        category: { select: { id: true, name: true } },
      },
    });

    if (!auction) return res.status(404).json({ message: 'Auction not found' });

    return res.json({ auction });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch auction' });
  }
};

/**
 * SELLER ONLY (must be active)
 * POST /api/auctions
 * Content-Type: multipart/form-data
 * Fields:
 *  - title (string)
 *  - description (string)
 *  - startingPrice (number > 0)
 *  - startTime (date string/ISO)
 *  - endTime (date string/ISO)
 *  - categoryId (int)
 *  - image (file) OPTIONAL
 *  - imageUrl (string) OPTIONAL (ako ne šalješ fajl)
 *
 * Rules:
 *  - status is auto "active"
 *  - currentPrice is null
 *  - startTime must be before endTime
 *  - imageUrl required either via file upload OR provided as imageUrl
 */
export const createAuction = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const {
      title,
      description,
      startingPrice,
      startTime,
      endTime,
      categoryId,
      imageUrl: bodyImageUrl,
    } = req.body;

    if (
      !title ||
      !description ||
      !startingPrice ||
      !startTime ||
      !endTime ||
      !categoryId
    ) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const sp = Number(startingPrice);
    if (!Number.isFinite(sp) || sp <= 0) {
      return res
        .status(400)
        .json({ message: 'startingPrice must be greater than 0' });
    }

    const st = new Date(startTime);
    const et = new Date(endTime);
    if (isNaN(st.getTime()) || isNaN(et.getTime())) {
      return res.status(400).json({ message: 'Invalid startTime or endTime' });
    }
    if (st >= et) {
      return res
        .status(400)
        .json({ message: 'startTime must be before endTime' });
    }

    const cid = toInt(categoryId);
    if (!cid) return res.status(400).json({ message: 'Invalid categoryId' });

    let finalImageUrl = bodyImageUrl;

    if (req.file?.buffer) {
      const uploaded = await uploadImageBuffer(req.file.buffer, {
        tags: ['auction'],
      });
      finalImageUrl = uploaded.secureUrl;
    }

    if (
      !finalImageUrl ||
      typeof finalImageUrl !== 'string' ||
      !finalImageUrl.trim()
    ) {
      return res
        .status(400)
        .json({ message: 'Image is required (file or imageUrl)' });
    }

    const auction = await prisma.auction.create({
      data: {
        title: String(title),
        description: String(description),
        imageUrl: finalImageUrl.trim(),
        startingPrice: sp,
        currentPrice: null,
        startTime: st,
        endTime: et,
        status: 'active',
        sellerId,
        categoryId: cid,
      },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        status: true,
        startingPrice: true,
        currentPrice: true,
        startTime: true,
        endTime: true,
        sellerId: true,
        categoryId: true,
        createdAt: true,
      },
    });

    return res.status(201).json({ auction });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to create auction' });
  }
};

/**
 * SELLER OWNER OR ADMIN
 * PUT /api/auctions/:id
 *
 * Seller (owner) can update:
 *  - description
 *  - imageUrl OR image(file)
 *  - status=archived only if currentPrice is null
 *
 * Admin can update:
 *  - status=archived (moderation)
 */
export const updateAuction = async (req, res) => {
  try {
    const id = toInt(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid auction id' });

    const auction = await prisma.auction.findUnique({
      where: { id },
      select: { id: true, sellerId: true, currentPrice: true, status: true },
    });
    if (!auction) return res.status(404).json({ message: 'Auction not found' });

    const isAdmin = req.user.role === 'admin';
    const isOwner =
      req.user.role === 'seller' && req.user.id === auction.sellerId;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const data = {};

    // Seller owner updates
    if (isOwner) {
      const { description, imageUrl, status } = req.body;

      if (description !== undefined) {
        if (typeof description !== 'string' || !description.trim()) {
          return res.status(400).json({ message: 'Invalid description' });
        }
        data.description = description;
      }

      if (req.file?.buffer) {
        const uploaded = await uploadImageBuffer(req.file.buffer, {
          tags: ['auction'],
        });
        data.imageUrl = uploaded.secureUrl;
      } else if (imageUrl !== undefined) {
        if (typeof imageUrl !== 'string' || !imageUrl.trim()) {
          return res.status(400).json({ message: 'Invalid imageUrl' });
        }
        data.imageUrl = imageUrl.trim();
      }

      if (status !== undefined) {
        if (status !== 'archived') {
          return res
            .status(403)
            .json({ message: 'Seller can only set status to archived' });
        }
        if (auction.currentPrice !== null) {
          return res
            .status(400)
            .json({ message: 'Cannot archive auction after bidding started' });
        }
        data.status = 'archived';
      }
    }

    if (isAdmin) {
      const { status } = req.body;
      if (status !== undefined) {
        if (status !== 'archived') {
          return res
            .status(400)
            .json({ message: 'Admin can only set status to archived here' });
        }
        data.status = 'archived';
      }
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'No allowed fields to update' });
    }

    const updated = await prisma.auction.update({
      where: { id },
      data,
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
        categoryId: true,
        updatedAt: true,
      },
    });

    return res.json({ auction: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update auction' });
  }
};

/**
 * BUYER ONLY
 * GET /api/auctions/participating
 *
 * Query:
 *  - status: active | finished | archived | all (default all)
 *  - page, limit
 *
 * Returns:
 *  {
 *    page, limit, total, totalPages,
 *    items: [
 *      {
 *        auction: { ...minimal fields for AuctionCard... },
 *        myBid: { id, amount, createdAt },
 *        isWinning: boolean
 *      }
 *    ]
 *  }
 */
export const listMyParticipatingAuctions = async (req, res) => {
  try {
    if (req.user.role !== 'buyer') {
      return res.status(403).json({ message: 'Only buyers can access this' });
    }

    const { status = 'all', page = '1', limit = '12' } = req.query;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(50, Math.max(1, Number(limit) || 12));
    const skip = (pageNum - 1) * limitNum;

    const allowedStatus = new Set(['active', 'finished', 'archived', 'all']);
    const st = allowedStatus.has(status) ? status : 'all';

    const where = {
      userId: req.user.id,
      ...(st !== 'all' ? { auction: { status: st } } : {}),
    };

    const [bids, total] = await Promise.all([
      prisma.bid.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        select: {
          id: true,
          amount: true,
          createdAt: true,
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
              createdAt: true,
              sellerId: true,
              categoryId: true,
              seller: { select: { id: true, fullName: true } },
              category: { select: { id: true, name: true } },
            },
          },
        },
      }),
      prisma.bid.count({ where }),
    ]);

    const items = (bids || []).map((b) => {
      const auction = b.auction;

      const current = auction?.currentPrice;
      const myAmt = b.amount;

      const isWinning =
        current !== null &&
        current !== undefined &&
        Number(current) === Number(myAmt);

      return {
        auction,
        myBid: { id: b.id, amount: b.amount, createdAt: b.createdAt },
        isWinning,
      };
    });

    return res.json({
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      items,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: 'Failed to list participating auctions' });
  }
};
