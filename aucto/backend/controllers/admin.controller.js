import { prisma } from '../prismaClient.js';

const toInt = (v, fallback) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
};

/**
 * GET /api/admin/stats?days=30
 * Admin only
 *
 * Response shape:
 * {
 *   range: { days, from, to },
 *   kpis: { ... },
 *   charts: { ... },
 *   top: { ... }
 * }
 */
export const getAdminStats = async (req, res) => {
  try {
    const days = Math.min(365, Math.max(7, toInt(req.query.days, 30)));

    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - days);

    // KPIs
    const [
      usersTotal,
      usersByRole,
      usersByStatus,

      auctionsTotal,
      auctionsByStatus,

      bidsTotal,
      bidsInRange,

      ordersTotal,
      ordersInRange,

      revenueAgg, // sum totalPrice
      revenueInRangeAgg,

      activeAuctions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
      prisma.user.groupBy({ by: ['status'], _count: { _all: true } }),

      prisma.auction.count(),
      prisma.auction.groupBy({ by: ['status'], _count: { _all: true } }),

      prisma.bid.count(),
      prisma.bid.count({ where: { createdAt: { gte: from, lte: to } } }),

      prisma.order.count(),
      prisma.order.count({ where: { orderDate: { gte: from, lte: to } } }),

      prisma.order.aggregate({ _sum: { totalPrice: true } }),
      prisma.order.aggregate({
        where: { orderDate: { gte: from, lte: to } },
        _sum: { totalPrice: true },
      }),

      prisma.auction.count({ where: { status: 'active' } }),
    ]);

    // "Revenue" iz Prisma Decimal -> vrati kao string ili number
    const revenueTotal = revenueAgg?._sum?.totalPrice?.toString?.() ?? '0';
    const revenueInRange =
      revenueInRangeAgg?._sum?.totalPrice?.toString?.() ?? '0';

    // Top kategorije (po broju aukcija)
    const topCategories = await prisma.category.findMany({
      take: 5,
      orderBy: { auctions: { _count: 'desc' } },
      select: {
        id: true,
        name: true,
        _count: { select: { auctions: true } },
      },
    });

    // Top selleri (po broju aukcija)
    const topSellers = await prisma.user.findMany({
      where: { role: 'seller' },
      take: 5,
      orderBy: { auctions: { _count: 'desc' } },
      select: {
        id: true,
        fullName: true,
        email: true,
        _count: { select: { auctions: true } },
      },
    });

    // Aukcije koje uskoro ističu (npr. narednih 24h)
    const soon = new Date();
    soon.setHours(soon.getHours() + 24);

    const endingSoon = await prisma.auction.findMany({
      where: {
        status: 'active',
        endTime: { gte: new Date(), lte: soon },
      },
      orderBy: { endTime: 'asc' },
      take: 5,
      select: {
        id: true,
        title: true,
        currentPrice: true,
        startingPrice: true,
        endTime: true,
        seller: { select: { id: true, fullName: true } },
        category: { select: { id: true, name: true } },
      },
    });

    /**
     * CHART DATA (MySQL)
     * Grupisanje po danu najlakše preko raw SQL (DATE())
     * - bids per day
     * - orders per day
     * - new users per day
     */
    const [bidsPerDay, ordersPerDay, usersPerDay] = await Promise.all([
      prisma.$queryRaw`
        SELECT DATE(createdAt) AS day, COUNT(*) AS value
        FROM Bid
        WHERE createdAt BETWEEN ${from} AND ${to}
        GROUP BY DATE(createdAt)
        ORDER BY day ASC
      `,
      prisma.$queryRaw`
        SELECT DATE(orderDate) AS day, COUNT(*) AS value
        FROM \`Order\`
        WHERE orderDate BETWEEN ${from} AND ${to}
        GROUP BY DATE(orderDate)
        ORDER BY day ASC
      `,
      prisma.$queryRaw`
        SELECT DATE(createdAt) AS day, COUNT(*) AS value
        FROM User
        WHERE createdAt BETWEEN ${from} AND ${to}
        GROUP BY DATE(createdAt)
        ORDER BY day ASC
      `,
    ]);

    // helper da ujednači format labela
    const normalizeSeries = (rows) =>
      (rows || []).map((r) => ({
        label: String(r.day), // npr "2026-02-23"
        value: Number(r.value) || 0,
      }));

    const charts = {
      bidsPerDay: normalizeSeries(bidsPerDay),
      ordersPerDay: normalizeSeries(ordersPerDay),
      usersPerDay: normalizeSeries(usersPerDay),

      // pie/bar: users by role/status, auctions by status
      usersByRole: (usersByRole || []).map((x) => ({
        label: x.role,
        value: x._count._all,
      })),
      usersByStatus: (usersByStatus || []).map((x) => ({
        label: x.status,
        value: x._count._all,
      })),
      auctionsByStatus: (auctionsByStatus || []).map((x) => ({
        label: x.status,
        value: x._count._all,
      })),

      topCategories: topCategories.map((c) => ({
        label: c.name,
        value: c._count.auctions,
      })),
    };

    const kpis = {
      usersTotal,
      auctionsTotal,
      bidsTotal,
      ordersTotal,
      activeAuctions,
      bidsInRange,
      ordersInRange,
      revenueTotal, // string (Decimal)
      revenueInRange, // string (Decimal)
    };

    return res.json({
      range: { days, from: from.toISOString(), to: to.toISOString() },
      kpis,
      charts,
      top: {
        topCategories,
        topSellers,
        endingSoon,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch admin stats' });
  }
};