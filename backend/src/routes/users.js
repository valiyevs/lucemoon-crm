const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { auth, authorize } = require('../middleware/auth');
const { body, param, validationResult } = require('express-validator');

const prisma = new PrismaClient();

const VALID_ROLES = ['ADMIN', 'MANAGER', 'SALESMAN'];

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }
  next();
};

// GET /api/users - List all users
router.get('/', auth, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true }
    });
    res.json(users);
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