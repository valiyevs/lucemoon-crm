const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');
const { body, param, validationResult } = require('express-validator');

const prisma = new PrismaClient();

const VALID_STATUSES = ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED'];

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }
  next();
};

// GET /api/quotes - List all quotes
router.get('/', auth, async (req, res) => {
  try {
    const { status, userId, search } = req.query;
    const where = {};

    if (status) where.status = status;
    if (userId) where.userId = parseInt(userId);
    if (search) {
      where.OR = [
        { quoteNumber: { contains: search, mode: 'insensitive' } },
        { account: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const quotes = await prisma.quote.findMany({
      where,
      include: {
        account: true,
        contact: true,
        lead: true,
        user: { select: { id: true, firstName: true, lastName: true } },
        items: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(quotes);
  } catch (err) {
    console.error('GET /api/quotes error:', err);
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

// GET /api/quotes/:id - Get single quote
router.get('/:id',
  auth,
  param('id').isInt().withMessage('ID must be a number'),
  validate,
  async (req, res) => {
    try {
      const quote = await prisma.quote.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          account: true,
          contact: true,
          lead: true,
          user: true,
          items: { include: { product: true } }
        }
      });
      if (!quote) return res.status(404).json({ error: 'Quote not found' });
      res.json(quote);
    } catch (err) {
      console.error('GET /api/quotes/:id error:', err);
      res.status(500).json({ error: 'Failed to fetch quote' });
    }
  }
);

// POST /api/quotes - Create quote
router.post('/',
  auth,
  body('accountId').optional({ nullable: true }).isInt().withMessage('Account ID must be a number'),
  body('status').optional().isIn(VALID_STATUSES),
  validate,
  async (req, res) => {
    try {
      const { items, ...quoteData } = req.body;

      // Handle empty accountId
      if (quoteData.accountId === '' || quoteData.accountId === null) {
        quoteData.accountId = null;
      }

      // Calculate totals
      const calculatedItems = items.map(item => ({
        ...item,
        total: item.quantity * item.unitPrice
      }));
      const subtotal = calculatedItems.reduce((sum, item) => sum + item.total, 0);
      const taxAmount = subtotal * (quoteData.taxRate || 0);

      // Generate quote number
      const count = await prisma.quote.count();
      const quoteNumber = `Q-${Date.now().toString(36).toUpperCase()}-${count + 1}`;

      const quote = await prisma.quote.create({
        data: {
          ...quoteData,
          quoteNumber,
          userId: req.user.id,
          subtotal,
          taxAmount,
          total: subtotal + taxAmount,
          items: {
            create: calculatedItems
          }
        },
        include: {
          items: { include: { product: true } },
          account: true
        }
      });
      res.status(201).json(quote);
    } catch (err) {
      console.error('POST /api/quotes error:', err);
      if (err.code === 'P2003') {
        return res.status(400).json({ error: 'Invalid account or product ID' });
      }
      res.status(500).json({ error: 'Failed to create quote' });
    }
  }
);

// PUT /api/quotes/:id - Update quote
router.put('/:id',
  auth,
  param('id').isInt().withMessage('ID must be a number'),
  body('status').optional().isIn(VALID_STATUSES),
  validate,
  async (req, res) => {
    try {
      const { items, ...quoteData } = req.body;

      // Delete old items and recreate
      await prisma.quoteItem.deleteMany({ where: { quoteId: parseInt(req.params.id) } });

      const calculatedItems = items.map(item => ({
        ...item,
        total: item.quantity * item.unitPrice
      }));
      const subtotal = calculatedItems.reduce((sum, item) => sum + item.total, 0);
      const taxAmount = subtotal * (quoteData.taxRate || 0);

      const quote = await prisma.quote.update({
        where: { id: parseInt(req.params.id) },
        data: {
          ...quoteData,
          subtotal,
          taxAmount,
          total: subtotal + taxAmount,
          items: {
            create: calculatedItems
          }
        },
        include: {
          items: { include: { product: true } },
          account: true
        }
      });
      res.json(quote);
    } catch (err) {
      console.error('PUT /api/quotes/:id error:', err);
      if (err.code === 'P2025') {
        return res.status(404).json({ error: 'Quote not found' });
      }
      res.status(500).json({ error: 'Failed to update quote' });
    }
  }
);

// DELETE /api/quotes/:id - Delete quote
router.delete('/:id',
  auth,
  param('id').isInt().withMessage('ID must be a number'),
  validate,
  async (req, res) => {
    try {
      await prisma.quote.delete({ where: { id: parseInt(req.params.id) } });
      res.json({ message: 'Quote deleted successfully' });
    } catch (err) {
      console.error('DELETE /api/quotes/:id error:', err);
      if (err.code === 'P2025') {
        return res.status(404).json({ error: 'Quote not found' });
      }
      if (err.code === 'P2003') {
        return res.status(400).json({ error: 'Cannot delete quote with related records' });
      }
      res.status(500).json({ error: 'Failed to delete quote' });
    }
  }
);

module.exports = router;