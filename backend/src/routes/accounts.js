const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');
const { body, param, validationResult } = require('express-validator');

const prisma = new PrismaClient();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }
  next();
};

// GET /api/accounts - List all accounts
router.get('/', auth, async (req, res) => {
  try {
    const { search, industry } = req.query;
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (industry) where.industry = industry;

    const accounts = await prisma.account.findMany({
      where,
      include: { _count: { select: { contacts: true, leads: true, quotes: true, orders: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(accounts);
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
  body('name').notEmpty().withMessage('Name is required'),
  body('type').optional().isIn(['Company', 'Individual']),
  body('email').optional().isEmail().withMessage('Invalid email'),
  validate,
  async (req, res) => {
    try {
      const account = await prisma.account.create({ data: req.body });
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
  param('id').isInt().withMessage('ID must be a number'),
  body('email').optional().isEmail().withMessage('Invalid email'),
  validate,
  async (req, res) => {
    try {
      const account = await prisma.account.update({
        where: { id: parseInt(req.params.id) },
        data: req.body
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