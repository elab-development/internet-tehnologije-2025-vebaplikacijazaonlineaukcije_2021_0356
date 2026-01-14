import { prisma } from '../prismaClient.js';

const toId = (val) => {
  const n = Number(val);
  return Number.isInteger(n) ? n : null;
};

/**
 * PUBLIC
 * GET /api/categories
 */
export const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });

    return res.json({ categories });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch categories' });
  }
};

/**
 * PUBLIC
 * GET /api/categories/:id
 */
export const getCategoryById = async (req, res) => {
  try {
    const id = toId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid category id' });

    const category = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });

    if (!category)
      return res.status(404).json({ message: 'Category not found' });

    return res.json({ category });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch category' });
  }
};

/**
 * ADMIN ONLY
 * POST /api/categories
 * Body: { name, description? }
 */
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const created = await prisma.category.create({
      data: {
        name: name.trim(),
        description: typeof description === 'string' ? description : null,
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });

    return res.status(201).json({ category: created });
  } catch (err) {
    if (err?.code === 'P2002') {
      return res.status(409).json({ message: 'Category name already exists' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Failed to create category' });
  }
};

/**
 * ADMIN ONLY
 * PUT /api/categories/:id
 * Body: { name?, description? }
 */
export const updateCategory = async (req, res) => {
  try {
    const id = toId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid category id' });

    const { name, description } = req.body;

    const data = {};
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ message: 'Invalid name' });
      }
      data.name = name.trim();
    }

    if (description !== undefined) {
      if (description !== null && typeof description !== 'string') {
        return res.status(400).json({ message: 'Invalid description' });
      }
      data.description = description;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'No fields provided for update' });
    }

    const updated = await prisma.category.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        description: true,
      },
    });

    return res.json({ category: updated });
  } catch (err) {
    if (err?.code === 'P2025') {
      return res.status(404).json({ message: 'Category not found' });
    }
    if (err?.code === 'P2002') {
      return res.status(409).json({ message: 'Category name already exists' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Failed to update category' });
  }
};

/**
 * ADMIN ONLY
 * DELETE /api/categories/:id
 */
export const deleteCategory = async (req, res) => {
  try {
    const id = toId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid category id' });

    await prisma.category.delete({ where: { id } });

    return res.json({ message: 'Category deleted' });
  } catch (err) {
    if (err?.code === 'P2025') {
      return res.status(404).json({ message: 'Category not found' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Failed to delete category' });
  }
};