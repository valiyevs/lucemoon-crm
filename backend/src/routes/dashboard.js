const express = require('express');
const router = express.Router();
const prisma = require('../utils/prisma');
const { auth } = require('../middleware/auth');

// GET /api/dashboard/stats - Dashboard statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      totalLeads,
      activeLeads,
      wonLeads,
      lostLeads,
      totalAccounts,
      totalContacts,
      totalProducts,
      totalQuotes,
      pendingQuotes,
      totalOrders,
      activeOrders,
      totalInvoices,
      paidInvoices,
      revenueResult,
      monthlyLeads,
      monthlyRevenue,
      topSalesmen,
      leadsBySource,
      recentActivity
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: { notIn: ['WON', 'LOST'] } } }),
      prisma.lead.count({ where: { status: 'WON' } }),
      prisma.lead.count({ where: { status: 'LOST' } }),
      prisma.account.count(),
      prisma.contact.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.quote.count(),
      prisma.quote.count({ where: { status: { in: ['DRAFT', 'SENT'] } } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: { notIn: ['DELIVERED', 'CANCELLED'] } } }),
      prisma.invoice.count(),
      prisma.invoice.count({ where: { status: 'PAID' } }),
      prisma.invoice.aggregate({ _sum: { total: true }, where: { status: 'PAID' } }),
      prisma.lead.groupBy({ by: ['createdAt'], _count: true, where: { createdAt: { gte: startOfMonth } } }),
      prisma.invoice.aggregate({ _sum: { total: true }, where: { status: 'PAID', createdAt: { gte: startOfMonth } } }),
      prisma.lead.groupBy({ by: ['userId'], _count: true, where: { status: 'WON' } }),
      prisma.lead.groupBy({ by: ['source'], _count: true }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true } } }
      })
    ]);

    // Get user names for top salesmen
    const userIds = topSalesmen.map(s => s.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true }
    });
    const userMap = Object.fromEntries(users.map(u => [u.id, u]));

    // Pipeline distribution
    const pipeline = await prisma.lead.groupBy({
      by: ['status'],
      _count: true,
      _sum: { value: true }
    });

    // Conversion rate
    const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : 0;

    res.json({
      overview: {
        totalLeads,
        activeLeads,
        wonLeads,
        lostLeads,
        totalAccounts,
        totalContacts,
        totalProducts,
        totalQuotes,
        pendingQuotes,
        totalOrders,
        activeOrders,
        totalInvoices,
        paidInvoices,
        totalRevenue: revenueResult._sum.total || 0,
        monthlyRevenue: monthlyRevenue._sum.total || 0,
        conversionRate: parseFloat(conversionRate)
      },
      pipeline: pipeline.map(p => ({
        status: p.status,
        count: p._count,
        value: p._sum.value || 0
      })),
      topSalesmen: topSalesmen.map(s => ({
        userId: s.userId,
        count: s._count,
        name: userMap[s.userId] ? `${userMap[s.userId].firstName} ${userMap[s.userId].lastName}` : 'Unknown'
      })),
      leadsBySource: leadsBySource.map(s => ({
        source: s.source || 'Unknown',
        count: s._count
      })),
      recentActivity: recentActivity.map(a => ({
        id: a.id,
        action: a.action,
        entityType: a.entityType,
        entityId: a.entityId,
        user: a.user ? `${a.user.firstName} ${a.user.lastName}` : 'System',
        createdAt: a.createdAt
      }))
    });
  } catch (err) {
    console.error('GET /api/dashboard/stats error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// GET /api/dashboard/revenue-monthly - Monthly revenue for last 12 months
router.get('/revenue-monthly', auth, async (req, res) => {
  try {
    const now = new Date();
    const months = [];

    for (let i = 11; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const result = await prisma.invoice.aggregate({
        _sum: { total: true },
        where: { status: 'PAID', createdAt: { gte: start, lte: end } }
      });

      months.push({
        month: start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: result._sum.total || 0
      });
    }

    res.json(months);
  } catch (err) {
    console.error('GET /api/dashboard/revenue-monthly error:', err);
    res.status(500).json({ error: 'Failed to fetch revenue data' });
  }
});

// GET /api/dashboard/sales-by-category - Sales by product category
router.get('/sales-by-category', auth, async (req, res) => {
  try {
    const orderItems = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { total: true, quantity: true }
    });

    const productIds = orderItems.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, category: true }
    });
    const productMap = Object.fromEntries(products.map(p => [p.id, p.category]));

    const categoryMap = {};
    orderItems.forEach(item => {
      const category = productMap[item.productId] || 'Other';
      if (!categoryMap[category]) {
        categoryMap[category] = { category, total: 0, quantity: 0 };
      }
      categoryMap[category].total += item._sum.total || 0;
      categoryMap[category].quantity += item._sum.quantity || 0;
    });

    res.json(Object.values(categoryMap).sort((a, b) => b.total - a.total));
  } catch (err) {
    console.error('GET /api/dashboard/sales-by-category error:', err);
    res.status(500).json({ error: 'Failed to fetch sales by category' });
  }
});

module.exports = router;
