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

// GET /api/contacts - List all contacts
router.get('/', auth, async (req, res) => {
  try {
    const { accountId, search } = req.query;
    const where = {};

    if (accountId) where.accountId = parseInt(accountId);
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const contacts = await prisma.contact.findMany({
      where,
      include: { account: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(contacts);
  } catch (err) {
    console.error('GET /api/contacts error:', err);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// GET /api/contacts/:id - Get single contact
router.get('/:id',
  auth,
  param('id').isInt().withMessage('ID must be a number'),
  validate,
  async (req, res) => {
    try {
      const contact = await prisma.contact.findUnique({
        where: { id: parseInt(req.params.id) },
        include: { account: true }
      });
      if (!contact) return res.status(404).json({ error: 'Contact not found' });
      res.json(contact);
    } catch (err) {
      console.error('GET /api/contacts/:id error:', err);
      res.status(500).json({ error: 'Failed to fetch contact' });
    }
  }
);

// POST /api/contacts - Create contact
router.post('/',
  auth,
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('accountId').optional().isInt().withMessage('Account ID must be a number'),
  validate,
  async (req, res) => {
    try {
      const contact = await prisma.contact.create({ data: req.body });
      res.status(201).json(contact);
    } catch (err) {
      console.error('POST /api/contacts error:', err);
      if (err.code === 'P2003') {
        return res.status(400).json({ error: 'Invalid account ID' });
      }
      res.status(500).json({ error: 'Failed to create contact' });
    }
  }
);

// PUT /api/contacts/:id - Update contact
router.put('/:id',
  auth,
  param('id').isInt().withMessage('ID must be a number'),
  body('email').optional().isEmail().withMessage('Invalid email'),
  body('accountId').optional().isInt().withMessage('Account ID must be a number'),
  validate,
  async (req, res) => {
    try {
      const contact = await prisma.contact.update({
        where: { id: parseInt(req.params.id) },
        data: req.body
      });
      res.json(contact);
    } catch (err) {
      console.error('PUT /api/contacts/:id error:', err);
      if (err.code === 'P2025') {
        return res.status(404).json({ error: 'Contact not found' });
      }
      if (err.code === 'P2003') {
        return res.status(400).json({ error: 'Invalid account ID' });
      }
      res.status(500).json({ error: 'Failed to update contact' });
    }
  }
);

// DELETE /api/contacts/:id - Delete contact
router.delete('/:id',
  auth,
  param('id').isInt().withMessage('ID must be a number'),
  validate,
  async (req, res) => {
    try {
      await prisma.contact.delete({ where: { id: parseInt(req.params.id) } });
      res.json({ message: 'Contact deleted successfully' });
    } catch (err) {
      console.error('DELETE /api/contacts/:id error:', err);
      if (err.code === 'P2025') {
        return res.status(404).json({ error: 'Contact not found' });
      }
      if (err.code === 'P2003') {
        return res.status(400).json({ error: 'Cannot delete contact with related records' });
      }
      res.status(500).json({ error: 'Failed to delete contact' });
    }
  }
);

module.exports = router;