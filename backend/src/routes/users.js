const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { auth, authorize } = require('../middleware/auth');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { paginate, paginatedResponse } = require('../utils/pagination');

const VALID_ROLES = ['ADMIN', 'MANAGER', 'SALESMAN'];

// GET /api/users - List all users (Admin only, paginated)
router.get('/', auth, authorize('ADMIN'), async (req, res) => {
  try {
    const { search } = req.query;
    const { page, limit, skip } = paginate(req.query);
    const where = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ]);
    res.json(paginatedResponse(users, total, page, limit));
  } catch (err) {
    console.error('GET /api/users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/users/:id - Get single user
router.get('/:id',
  auth,
  param('id').isInt().withMessage('ID must be a number'),
  validate,
  async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(req.params.id) },
        select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true }
      });
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (err) {
      console.error('GET /api/users/:id error:', err);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }
);

// PUT /api/users/:id - Update user (Admin only)
router.put('/:id',
  auth,
  authorize('ADMIN'),
  param('id').isInt().withMessage('ID must be a number'),
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty'),
  body('role').optional().isIn(VALID_ROLES).withMessage('Invalid role'),
  validate,
  async (req, res) => {
    try {
      const { firstName, lastName, role, isActive } = req.body;
      const user = await prisma.user.update({
        where: { id: parseInt(req.params.id) },
        data: { firstName, lastName, role, isActive }
      });
      res.json(user);
    } catch (err) {
      console.error('PUT /api/users/:id error:', err);
      if (err.code === 'P2025') {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(500).json({ error: 'Failed to update user' });
    }
  }
);

module.exports = router;