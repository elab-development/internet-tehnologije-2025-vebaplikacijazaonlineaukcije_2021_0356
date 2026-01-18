import bcrypt from 'bcrypt';
import { prisma } from '../prismaClient.js';
import {
  signToken,
  setAuthCookie,
  clearAuthCookie,
} from '../utils/authTokens.js';

/**
 * POST /api/auth/register
 * Body: { fullName, email, password, role }
 * role: 'buyer' | 'seller'
 */
export const register = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ message: 'fullName, email and password are required' });
    }

    const chosenRole = role || 'buyer';

    if (chosenRole === 'admin') {
      return res.status(403).json({ message: 'Admin role cannot be assigned' });
    }

    if (!['buyer', 'seller'].includes(chosenRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return res.status(409).json({ message: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 10);

    const status = chosenRole === 'seller' ? 'inactive' : 'active';

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash,
        role: chosenRole,
        status,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    const token = signToken(user.id);
    setAuthCookie(res, token);

    return res.status(201).json({ user });
  } catch (err) {
    if (err?.code === 'P2002') {
      return res.status(409).json({ message: 'Email already in use' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Register failed' });
  }
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    if (user.status === 'blocked') {
      return res.status(403).json({ message: 'Account is blocked' });
    }
    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = signToken(user.id);
    setAuthCookie(res, token);

    return res.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Login failed' });
  }
};

/**
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  clearAuthCookie(res);
  return res.json({ message: 'Logged out' });
};

/**
 * GET /api/auth/me
 */
export const me = async (req, res) => {
  return res.json({ user: req.user });
};
