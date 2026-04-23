const express = require('express')
const router = express.Router()
const prisma = require('../utils/prisma')
const { auth } = require('../middleware/auth')

// Global search across all entities
router.get('/', auth, async (req, res) => {
  try {
    const { q, type } = req.query

    if (!q || q.trim().length < 2) {
      return res.json([])
    }

    const searchTerm = q.trim()
    const results = {
      leads: [],
      accounts: [],
      contacts: [],
      products: [],
      quotes: [],
      orders: [],
      invoices: []
    }

    // Search Leads
    if (!type || type === 'leads') {
      const leads = await prisma.lead.findMany({
        where: {
          OR: [
            { title: { contains: searchTerm } },
            { description: { contains: searchTerm } },
            { source: { contains: searchTerm } }
          ]
        },
        include: {
          account: { select: { id: true, name: true } },
          user: { select: { id: true, firstName: true, lastName: true } }
        },
        take: 5
      })
      results.leads = leads.map(l => ({
        ...l,
        type: 'lead',
        displayName: l.title,
        subtext: l.account?.name || 'Account yoxdur'
      }))
    }

    // Search Accounts
    if (!type || type === 'accounts') {
      const accounts = await prisma.account.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm } },
            { email: { contains: searchTerm } },
            { phone: { contains: searchTerm } },
            { city: { contains: searchTerm } }
          ]
        },
        take: 5
      })
      results.accounts = accounts.map(a => ({
        ...a,
        type: 'account',
        displayName: a.name,
        subtext: a.email || a.phone || a.city || ''
      }))
    }

    // Search Contacts
    if (!type || type === 'contacts') {
      const contacts = await prisma.contact.findMany({
        where: {
          OR: [
            { firstName: { contains: searchTerm } },
            { lastName: { contains: searchTerm } },
            { email: { contains: searchTerm } },
            { phone: { contains: searchTerm } }
          ]
        },
        include: {
          account: { select: { id: true, name: true } }
        },
        take: 5
      })
      results.contacts = contacts.map(c => ({
        ...c,
        type: 'contact',
        displayName: `${c.firstName} ${c.lastName}`,
        subtext: c.account?.name || c.email || ''
      }))
    }

    // Search Products
    if (!type || type === 'products') {
      const products = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm } },
            { sku: { contains: searchTerm } },
            { description: { contains: searchTerm } },
            { category: { contains: searchTerm } }
          ]
        },
        take: 5
      })
      results.products = products.map(p => ({
        ...p,
        type: 'product',
        displayName: p.name,
        subtext: `${p.sku} • ${p.price} ₼`
      }))
    }

    // Search Quotes
    if (!type || type === 'quotes') {
      const quotes = await prisma.quote.findMany({
        where: {
          OR: [
            { quoteNumber: { contains: searchTerm } },
            { notes: { contains: searchTerm } }
          ]
        },
        include: {
          account: { select: { id: true, name: true } }
        },
        take: 5
      })
      results.quotes = quotes.map(q => ({
        ...q,
        type: 'quote',
        displayName: q.quoteNumber,
        subtext: q.account?.name || ''
      }))
    }

    // Search Orders
    if (!type || type === 'orders') {
      const orders = await prisma.order.findMany({
        where: {
          OR: [
            { orderNumber: { contains: searchTerm } },
            { notes: { contains: searchTerm } }
          ]
        },
        include: {
          account: { select: { id: true, name: true } }
        },
        take: 5
      })
      results.orders = orders.map(o => ({
        ...o,
        type: 'order',
        displayName: o.orderNumber,
        subtext: o.account?.name || ''
      }))
    }

    // Search Invoices
    if (!type || type === 'invoices') {
      const invoices = await prisma.invoice.findMany({
        where: {
          OR: [
            { invoiceNumber: { contains: searchTerm } },
            { notes: { contains: searchTerm } }
          ]
        },
        include: {
          order: {
            include: {
              account: { select: { id: true, name: true } }
            }
          }
        },
        take: 5
      })
      results.invoices = invoices.map(i => ({
        ...i,
        type: 'invoice',
        displayName: i.invoiceNumber,
        subtext: i.order?.account?.name || ''
      }))
    }

    // Flatten results for easier display
    const flattened = [
      ...results.leads,
      ...results.accounts,
      ...results.contacts,
      ...results.products,
      ...results.quotes,
      ...results.orders,
      ...results.invoices
    ]

    res.json(flattened)
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({ error: 'Search failed' })
  }
})

module.exports = router
