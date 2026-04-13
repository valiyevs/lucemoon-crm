const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { auth, authorize } = require('../middleware/auth');

const prisma = new PrismaClient();

// GET /api/audit-logs - List audit logs (Admin only)
router.get('/', auth, authorize('ADMIN'), async (req, res) => {
  try {
    const { entityType, action, userId, fromDate, toDate } = req.query;
    const where = {};

    if (entityType) where.entityType = entityType;
    if (action) where.action = action;
    if (userId) where.userId = parseInt(userId);
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 500
    });
    res.json(logs);
  } catch (err) {
    console.error('GET /api/audit-logs error:', err);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

module.exports = router;
