const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/', auth, async (req, res) => {
  try {
    const { status, userId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (userId) where.userId = parseInt(userId);

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
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
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
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { items, ...quoteData } = req.body;

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
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
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
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await prisma.quote.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Quote deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;