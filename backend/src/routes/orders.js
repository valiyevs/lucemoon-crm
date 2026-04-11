const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};

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
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
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
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { items, ...orderData } = req.body;

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
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
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
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;