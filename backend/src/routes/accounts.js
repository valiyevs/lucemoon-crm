const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { auth, authorize } = require('../middleware/auth');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const activityLogger = require('../middleware/activityLogger');
const { paginate, paginatedResponse } = require('../utils/pagination');

// GET /api/accounts - List all accounts (paginated)
router.get('/', auth, async (req, res) => {
  try {
    const { search, industry } = req.query;
    const { page, limit, skip } = paginate(req.query);
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (industry) where.industry = industry;

    const [accounts, total] = await Promise.all([
      prisma.account.findMany({
        where,
        include: { _count: { select: { contacts: true, leads: true, quotes: true, orders: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.account.count({ where })
    ]);
    res.json(paginatedResponse(accounts, total, page, limit));
  } catch (err) {
    console.error('GET /api/accounts error:', err);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// GET /api/accounts/:id - Get single account
router.get('/:id',
  auth,
  param('id').isInt().withMessage('ID must be a number'),
  validate,
  async (req, res) => {
    try {
      const account = await prisma.account.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          contacts: true,
          leads: true,
          quotes: true,
          orders: true
        }
      });
      if (!account) return res.status(404).json({ error: 'Account not found' });
      res.json(account);
    } catch (err) {
      console.error('GET /api/accounts/:id error:', err);
      res.status(500).json({ error: 'Failed to fetch account' });
    }
  }
);

// POST /api/accounts - Create account
router.post('/',
  auth,
  activityLogger('Account', 'CREATE'),
  body('name').notEmpty().withMessage('Name is required'),
  body('type').optional().isIn(['Company', 'Individual']),
  body('email').optional().isEmail().withMessage('Invalid email'),
  validate,
  async (req, res) => {
    try {
      const { name, type, email, phone, address, website, industry, notes } = req.body;
      const account = await prisma.account.create({
        data: { name, type, email, phone, address, website, industry, notes }
      });
      res.status(201).json(account);
    } catch (err) {
      console.error('POST /api/accounts error:', err);
      if (err.code === 'P2002') {
        return res.status(400).json({ error: 'Account with this name already exists' });
      }
      res.status(500).json({ error: 'Failed to create account' });
    }
  }
);

// PUT /api/accounts/:id - Update account
router.put('/:id',
  auth,
  activityLogger('Account', 'UPDATE'),
  param('id').isInt().withMessage('ID must be a number'),
  body('email').optional().isEmail().withMessage('Invalid email'),
  validate,
  async (req, res) => {
    try {
      const { name, type, email, phone, address, website, industry, notes } = req.body;
      const account = await prisma.account.update({
        where: { id: parseInt(req.params.id) },
        data: { name, type, email, phone, address, website, industry, notes }
      });
      res.json(account);
    } catch (err) {
      console.error('PUT /api/accounts/:id error:', err);
      if (err.code === 'P2025') {
        return res.status(404).json({ error: 'Account not found' });
      }
      res.status(500).json({ error: 'Failed to update account' });
    }
  }
);

// DELETE /api/accounts/:id - Delete account
router.delete('/:id',
  auth,
  authorize('ADMIN', 'MANAGER'),
  activityLogger('Account', 'DELETE'),
  param('id').isInt().withMessage('ID must be a number'),
  validate,
  async (req, res) => {
    try {
      await prisma.account.delete({ where: { id: parseInt(req.params.id) } });
      res.json({ message: 'Account deleted successfully' });
    } catch (err) {
      console.error('DELETE /api/accounts/:id error:', err);
      if (err.code === 'P2025') {
        return res.status(404).json({ error: 'Account not found' });
      }
      if (err.code === 'P2003') {
        return res.status(400).json({ error: 'Cannot delete account with related records' });
      }
      res.status(500).json({ error: 'Failed to delete account' });
    }
  }
);

module.exports = router;