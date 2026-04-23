const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { auth, authorize } = require('../middleware/auth');
const { paginate, paginatedResponse } = require('../utils/pagination');

// GET /api/audit-logs - List audit logs (Admin only, paginated)
router.get('/', auth, authorize('ADMIN'), async (req, res) => {
  try {
    const { entityType, action, userId, fromDate, toDate, search } = req.query;
    const { page, limit, skip } = paginate(req.query);
    const where = {};

    if (entityType) where.entityType = entityType;
    if (action) where.action = action;
    if (userId) where.userId = parseInt(userId);
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }
    if (search) {
      where.OR = [
        { entityType: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } },
        { changes: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.auditLog.count({ where })
    ]);
    res.json(paginatedResponse(logs, total, page, limit));
  } catch (err) {
    console.error('GET /api/audit-logs error:', err);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

module.exports = router;
