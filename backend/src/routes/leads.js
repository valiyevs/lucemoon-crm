const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { auth, authorize } = require('../middleware/auth');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const activityLogger = require('../middleware/activityLogger');
const { paginate, paginatedResponse } = require('../utils/pagination');

const VALID_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST'];

// GET /api/leads - List all leads (paginated)
router.get('/', auth, async (req, res) => {
  try {
    const { status, userId, search } = req.query;
    const { page, limit, skip } = paginate(req.query);
    const where = {};

    if (status) where.status = status;
    if (userId) where.userId = parseInt(userId);
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          account: true,
          user: { select: { id: true, firstName: true, lastName: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.lead.count({ where })
    ]);
    res.json(paginatedResponse(leads, total, page, limit));
  } catch (err) {
    console.error('GET /api/leads error:', err);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// GET /api/leads/:id - Get single lead
router.get('/:id',
  auth,
  param('id').isInt().withMessage('ID must be a number'),
  validate,
  async (req, res) => {
    try {
      const lead = await prisma.lead.findUnique({
        where: { id: parseInt(req.params.id) },
        include: {
          account: true,
          user: true,
          quotes: { include: { items: true } }
        }
      });
      if (!lead) return res.status(404).json({ error: 'Lead not found' });
      res.json(lead);
    } catch (err) {
      console.error('GET /api/leads/:id error:', err);
      res.status(500).json({ error: 'Failed to fetch lead' });
    }
  }
);

// POST /api/leads - Create lead
router.post('/',
  auth,
  activityLogger('Lead', 'CREATE'),
  body('title').notEmpty().withMessage('Title is required'),
  body('status').optional().isIn(VALID_STATUSES),
  body('value').optional().isFloat({ min: 0 }).withMessage('Value must be a positive number'),
  body('accountId').optional().isInt().withMessage('Account ID must be a number'),
  validate,
  async (req, res) => {
    try {
      const { title, description, value, status, source, accountId } = req.body;
      const lead = await prisma.lead.create({
        data: { title, description, value, status, source, accountId, userId: req.user.id },
        include: { account: true, user: true }
      });
      res.status(201).json(lead);
    } catch (err) {
      console.error('POST /api/leads error:', err);
      if (err.code === 'P2003') {
        return res.status(400).json({ error: 'Invalid user or account ID' });
      }
      res.status(500).json({ error: 'Failed to create lead' });
    }
  }
);

// PUT /api/leads/:id - Update lead
router.put('/:id',
  auth,
  activityLogger('Lead', 'UPDATE'),
  param('id').isInt().withMessage('ID must be a number'),
  body('status').optional().isIn(VALID_STATUSES),
  body('value').optional().isFloat({ min: 0 }).withMessage('Value must be a positive number'),
  body('accountId').optional().isInt().withMessage('Account ID must be a number'),
  validate,
  async (req, res) => {
    try {
      const { title, description, value, status, source, accountId } = req.body;
      const lead = await prisma.lead.update({
        where: { id: parseInt(req.params.id) },
        data: { title, description, value, status, source, accountId },
        include: { account: true, user: true }
      });
      res.json(lead);
    } catch (err) {
      console.error('PUT /api/leads/:id error:', err);
      if (err.code === 'P2025') {
        return res.status(404).json({ error: 'Lead not found' });
      }
      if (err.code === 'P2003') {
        return res.status(400).json({ error: 'Invalid user or account ID' });
      }
      res.status(500).json({ error: 'Failed to update lead' });
    }
  }
);

// DELETE /api/leads/:id - Delete lead
router.delete('/:id',
  auth,
  authorize('ADMIN', 'MANAGER'),
  activityLogger('Lead', 'DELETE'),
  param('id').isInt().withMessage('ID must be a number'),
  validate,
  async (req, res) => {
    try {
      await prisma.lead.delete({ where: { id: parseInt(req.params.id) } });
      res.json({ message: 'Lead deleted successfully' });
    } catch (err) {
      console.error('DELETE /api/leads/:id error:', err);
      if (err.code === 'P2025') {
        return res.status(404).json({ error: 'Lead not found' });
      }
      res.status(500).json({ error: 'Failed to delete lead' });
    }
  }
);

// GET /api/leads/stats/summary - Get lead statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const [total, byStatus] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.groupBy({
        by: ['status'],
        _count: true,
      })
    ]);

    const totalValue = await prisma.lead.aggregate({
      _sum: { value: true },
      where: { status: 'WON' }
    });

    res.json({
      total,
      totalValue: totalValue._sum.value || 0,
      byStatus: byStatus.map(s => ({ status: s.status, count: s._count }))
    });
  } catch (err) {
    console.error('GET /api/leads/stats/summary error:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;