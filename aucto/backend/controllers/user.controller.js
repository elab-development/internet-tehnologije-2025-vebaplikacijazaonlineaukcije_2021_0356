import { prisma } from '../prismaClient.js';

const isValidRole = (role) => ['buyer', 'seller', 'admin'].includes(role);
const isValidStatus = (status) =>
  ['active', 'inactive', 'blocked'].includes(status);

/**
 * GET /api/users?role=buyer|seller|admin
 * Admin only
 */
export const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;

    const where = {};
    if (role) {
      if (!isValidRole(role)) {
        return res.status(400).json({ message: 'Invalid role filter' });
      }
      where.role = role;
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return res.json({ users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch users' });
  }
};

/**
 * PUT /api/users/:id/status
 * Body: { status: 'active'|'inactive'|'blocked' }
 * Admin only
 */
export const updateUserStatus = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(userId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    if (!status || !isValidStatus(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    if (req.user?.id === userId && status !== 'active') {
      return res
        .status(400)
        .json({ message: 'You cannot change your own status' });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return res.json({ user: updated });
  } catch (err) {
    if (err?.code === 'P2025') {
      return res.status(404).json({ message: 'User not found' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Failed to update status' });
  }
};

/**
 * PUT /api/users/:id/role
 * Body: { role: 'buyer'|'seller'|'admin' }
 * Admin only
 */
export const updateUserRole = async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { role } = req.body;

    if (!Number.isInteger(userId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    if (!role || !isValidRole(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (req.user?.id === userId && role !== 'admin') {
      return res
        .status(400)
        .json({ message: 'You cannot change your own role' });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return res.json({ user: updated });
  } catch (err) {
    if (err?.code === 'P2025') {
      return res.status(404).json({ message: 'User not found' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Failed to update role' });
  }
};
