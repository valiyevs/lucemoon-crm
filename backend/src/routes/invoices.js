const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { auth, authorize } = require('../middleware/auth');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const activityLogger = require('../middleware/activityLogger');
const { paginate, paginatedResponse } = require('../utils/pagination');

const VALID_STATUSES = ['DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'];

// GET /api/invoices - List all invoices (paginated)
router.get('/', auth, async (req, res) => {
  try {
    const { status, search } = req.query;
    const { page, limit, skip } = paginate(req.query);
    const where = {};

    if (status) where.status = status;
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { order: { account: { name: { contains: search, mode: 'insensitive' } } } }
      ];
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          order: {
            include: {
              account: true,
              contact: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.invoice.count({ where })
    ]);
    res.json(paginatedResponse(invoices, total, page, limit));
  } catch (err) {
    console.error('GET /api/invoices error:', err);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// GET /api/invoices/:id - Get single invoice
router.get('/:id',
  auth,
  param('id').isInt().withMessage('ID must be a number'),
  validate,
  async (req, res) => {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          order: {
            include: {
              account: true,
              contact: true,
              items: { include: { product: true } }
            }
          }
        }
      });
      if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
      res.json(invoice);
    } catch (err) {
      console.error('GET /api/invoices/:id error:', err);
      res.status(500).json({ error: 'Failed to fetch invoice' });
    }
  }
);

// POST /api/invoices - Create invoice
router.post('/',
  auth,
  activityLogger('Invoice', 'CREATE'),
  body('orderId').isInt().withMessage('Order ID is required'),
  validate,
  async (req, res) => {
    try {
      const { orderId, notes, dueDate } = req.body;

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: true } } }
      });

      if (!order) return res.status(404).json({ error: 'Order not found' });

      const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const invoice = await prisma.invoice.create({
        data: {
          notes,
          dueDate: dueDate ? new Date(dueDate) : null,
          invoiceNumber,
          orderId,
          subtotal: order.subtotal,
          taxRate: order.taxRate,
          taxAmount: order.taxAmount,
          total: order.total
        }
      });
      res.status(201).json(invoice);
    } catch (err) {
      console.error('POST /api/invoices error:', err);
      if (err.code === 'P2003') {
        return res.status(400).json({ error: 'Invalid order ID' });
      }
      res.status(500).json({ error: 'Failed to create invoice' });
    }
  }
);

// PUT /api/invoices/:id - Update invoice
router.put('/:id',
  auth,
  activityLogger('Invoice', 'UPDATE'),
  param('id').isInt().withMessage('ID must be a number'),
  body('status').optional().isIn(VALID_STATUSES),
  validate,
  async (req, res) => {
    try {
      const { status, notes, dueDate } = req.body;
      const invoice = await prisma.invoice.update({
        where: { id: parseInt(req.params.id) },
        data: { status, notes, dueDate }
      });
      res.json(invoice);
    } catch (err) {
      console.error('PUT /api/invoices/:id error:', err);
      if (err.code === 'P2025') {
        return res.status(404).json({ error: 'Invoice not found' });
      }
      res.status(500).json({ error: 'Failed to update invoice' });
    }
  }
);

module.exports = router;