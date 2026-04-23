const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { auth, authorize } = require('../middleware/auth');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const activityLogger = require('../middleware/activityLogger');
const { paginate, paginatedResponse } = require('../utils/pagination');

// GET /api/products - List all products (paginated)
router.get('/', auth, async (req, res) => {
  try {
    const { category, search, includeInactive } = req.query;
    const { page, limit, skip } = paginate(req.query);
    const where = {};

    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (!includeInactive || includeInactive === 'false') {
      where.isActive = true;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ]);
    res.json(paginatedResponse(products, total, page, limit));
  } catch (err) {
    console.error('GET /api/products error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/categories - Get all categories
router.get('/categories', auth, async (req, res) => {
  try {
    const categories = await prisma.product.groupBy({
      by: ['category'],
      _count: true,
      where: { isActive: true }
    });
    res.json(categories.map(c => ({ name: c.category, count: c._count })));
  } catch (err) {
    console.error('GET /api/products/categories error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id',
  auth,
  param('id').isInt().withMessage('ID must be a number'),
  validate,
  async (req, res) => {
    try {
      const product = await prisma.product.findUnique({
        where: { id: parseInt(req.params.id) }
      });
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.json(product);
    } catch (err) {
      console.error('GET /api/products/:id error:', err);
      res.status(500).json({ error: 'Failed to fetch product' });
    }
  }
);

// POST /api/products - Create product
router.post('/',
  auth,
  activityLogger('Product', 'CREATE'),
  body('sku').notEmpty().withMessage('SKU is required'),
  body('name').notEmpty().withMessage('Name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('costPrice').optional().isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative number'),
  validate,
  async (req, res) => {
    try {
      const { sku, name, description, category, unit, price, costPrice, stock } = req.body;
      const product = await prisma.product.create({
        data: { sku, name, description, category, unit, price, costPrice, stock }
      });
      res.status(201).json(product);
    } catch (err) {
      console.error('POST /api/products error:', err);
      if (err.code === 'P2002') {
        return res.status(400).json({ error: 'Product with this SKU already exists' });
      }
      res.status(500).json({ error: 'Failed to create product' });
    }
  }
);

// PUT /api/products/:id - Update product
router.put('/:id',
  auth,
  activityLogger('Product', 'UPDATE'),
  param('id').isInt().withMessage('ID must be a number'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('costPrice').optional().isFloat({ min: 0 }).withMessage('Cost price must be a positive number'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative number'),
  validate,
  async (req, res) => {
    try {
      const { name, description, category, unit, price, costPrice, stock, isActive } = req.body;
      const product = await prisma.product.update({
        where: { id: parseInt(req.params.id) },
        data: { name, description, category, unit, price, costPrice, stock, isActive }
      });
      res.json(product);
    } catch (err) {
      console.error('PUT /api/products/:id error:', err);
      if (err.code === 'P2025') {
        return res.status(404).json({ error: 'Product not found' });
      }
      if (err.code === 'P2002') {
        return res.status(400).json({ error: 'Product with this SKU already exists' });
      }
      res.status(500).json({ error: 'Failed to update product' });
    }
  }
);

// DELETE /api/products/:id - Soft delete (deactivate) product
router.delete('/:id',
  auth,
  authorize('ADMIN', 'MANAGER'),
  activityLogger('Product', 'DELETE'),
  param('id').isInt().withMessage('ID must be a number'),
  validate,
  async (req, res) => {
    try {
      await prisma.product.update({
        where: { id: parseInt(req.params.id) },
        data: { isActive: false }
      });
      res.json({ message: 'Product deactivated successfully' });
    } catch (err) {
      console.error('DELETE /api/products/:id error:', err);
      if (err.code === 'P2025') {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.status(500).json({ error: 'Failed to deactivate product' });
    }
  }
);

module.exports = router;