const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');
const { body, param, validationResult } = require('express-validator');

const prisma = new PrismaClient();

const VALID_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }
  next();
};

// GET /api/orders - List all orders
router.get('/', auth, async (req, res) => {
  try {
    const { status, search } = req.query;
    const where = {};

    if (status) where.status = status;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { account: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        account: true,
        contact: true,
        user: { select: { id: true, firstName: true, lastName: true } },
        items: { include: { product: true } },
        invoices: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (err) {
    console.error('GET /api/orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id - Get single order
router.get('/:id',
  auth,
  param('id').isInt().withMessage('ID must be a number'),
  validate,
  async (req, res) => {
    try {
      const order = await prisma.order.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          account: true,
          contact: true,
          user: true,
          quote: true,
          items: { include: { product: true } },
          invoices: true
        }
      });
      if (!order) return res.status(404).json({ error: 'Order not found' });
      res.json(order);
    } catch (err) {
      console.error('GET /api/orders/:id error:', err);
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  }
);

// POST /api/orders - Create order
router.post('/',
  auth,
  body('accountId').isInt().withMessage('Account ID is required'),
  body('status').optional().isIn(VALID_STATUSES),
  validate,
  async (req, res) => {
    try {
      const { items, ...orderData } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({ error: 'At least one item is required' });
      }

      const calculatedItems = items.map(item => ({
        ...item,
        total: item.quantity * item.unitPrice
      }));
      const subtotal = calculatedItems.reduce((sum, item) => sum + item.total, 0);
      const taxAmount = subtotal * (orderData.taxRate || 0);

      const count = await prisma.order.count();
      const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${count + 1}`;

      const order = await prisma.order.create({
        data: {
          ...orderData,
          orderNumber,
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
      res.status(201).json(order);
    } catch (err) {
      console.error('POST /api/orders error:', err);
      if (err.code === 'P2003') {
        return res.status(400).json({ error: 'Invalid account or product ID' });
      }
      res.status(500).json({ error: 'Failed to create order' });
    }
  }
);

// PUT /api/orders/:id - Update order
router.put('/:id',
  auth,
  param('id').isInt().withMessage('ID must be a number'),
  body('status').optional().isIn(VALID_STATUSES),
  validate,
  async (req, res) => {
    try {
      const { items, ...orderData } = req.body;

      if (items) {
        await prisma.orderItem.deleteMany({ where: { orderId: parseInt(req.params.id) } });
        const calculatedItems = items.map(item => ({
          ...item,
          total: item.quantity * item.unitPrice
        }));
        const subtotal = calculatedItems.reduce((sum, item) => sum + item.total, 0);
        const taxAmount = subtotal * (orderData.taxRate || 0);

        const order = await prisma.order.update({
          where: { id: parseInt(req.params.id) },
          data: {
            ...orderData,
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
        res.json(order);
      } else {
        const order = await prisma.order.update({
          where: { id: parseInt(req.params.id) },
          data: orderData,
          include: {
            items: { include: { product: true } },
            account: true
          }
        });
        res.json(order);
      }
    } catch (err) {
      console.error('PUT /api/orders/:id error:', err);
      if (err.code === 'P2025') {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.status(500).json({ error: 'Failed to update order' });
    }
  }
);

module.exports = router;