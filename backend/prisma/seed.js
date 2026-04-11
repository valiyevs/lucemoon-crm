const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function seed() {
  console.log('Seeding database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@lucemoon.az',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN'
    }
  })

  const salesman1 = await prisma.user.create({
    data: {
      email: 'sale@lucemoon.az',
      password: hashedPassword,
      firstName: 'Nihat',
      lastName: 'Huseynov',
      role: 'SALESMAN'
    }
  })

  const salesman2 = await prisma.user.create({
    data: {
      email: 'elvin@lucemoon.az',
      password: hashedPassword,
      firstName: 'Elvin',
      lastName: 'Memmedov',
      role: 'SALESMAN'
    }
  })

  console.log('Users created')

  // Create accounts
  const account1 = await prisma.account.create({
    data: {
      name: 'Azerishiq MMC',
      type: 'Company',
      industry: 'Elektrik',
      phone: '+994505123456',
      email: 'info@azerishiq.az',
      address: 'Nizami kuc. 105',
      city: 'Baku'
    }
  })

  const account2 = await prisma.account.create({
    data: {
      name: 'Baku Elektrik',
      type: 'Company',
      industry: 'Tikinti',
      phone: '+994502234567',
      email: 'baku.elektrik@mail.az',
      address: 'Azadlig prospekti 88',
      city: 'Baku'
    }
  })

  const account3 = await prisma.account.create({
    data: {
      name: 'Sumqayit Tikinti',
      type: 'Company',
      industry: 'Tikinti',
      phone: '+994505345678',
      email: 'info@sumtik.az',
      address: '1st Industrial zone',
      city: 'Sumqayit'
    }
  })

  const account4 = await prisma.account.create({
    data: {
      name: 'Ganja Agirliq',
      type: 'Company',
      industry: 'Sənaye',
      phone: '+994503456789',
      email: 'ganja.agirliq@mail.az',
      address: 'Ziya Bunyadov kuc. 45',
      city: 'Ganja'
    }
  })

  const account5 = await prisma.account.create({
    data: {
      name: 'Naxcivan ENERJİ',
      type: 'Company',
      industry: 'Enerji',
      phone: '+994502567890',
      email: 'nakhchivan.enerji@mail.az',
      address: 'Heydar Aliyev prospekti',
      city: 'Nakhchivan'
    }
  })

  console.log('Accounts created')

  // Create contacts
  const contact1 = await prisma.contact.create({
    data: {
      firstName: 'Emil',
      lastName: 'Aliyev',
      email: 'emil@azerishiq.az',
      phone: '+994505111222',
      position: 'Baş mühəndis',
      isPrimary: true,
      accountId: account1.id
    }
  })

  const contact2 = await prisma.contact.create({
    data: {
      firstName: 'Sevda',
      lastName: 'Hüseynova',
      email: 'sevda@azerishiq.az',
      phone: '+994505222333',
      position: 'Satınalma müdiri',
      isPrimary: false,
      accountId: account1.id
    }
  })

  const contact3 = await prisma.contact.create({
    data: {
      firstName: 'Rashid',
      lastName: 'Mammadov',
      email: 'rashid@baku-elektrik.az',
      phone: '+994502333444',
      position: 'Texniki direktor',
      isPrimary: true,
      accountId: account2.id
    }
  })

  await prisma.contact.create({
    data: {
      firstName: 'Aynur',
      lastName: 'Quliyeva',
      email: 'aynur@sumtik.az',
      phone: '+994505444555',
      position: 'Layihə rəhbəri',
      isPrimary: true,
      accountId: account3.id
    }
  })

  await prisma.contact.create({
    data: {
      firstName: 'Vladimir',
      lastName: 'Ivanov',
      email: 'vladimir@ganja-agirliq.az',
      phone: '+994503555666',
      position: 'Enerji mühəndisi',
      isPrimary: true,
      accountId: account4.id
    }
  })

  console.log('Contacts created')

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        sku: 'CABLE-001',
        name: 'NYM 3x2.5 mm² Kablo',
        description: 'Yer altı elektrik kabeli, mis nüvə',
        category: 'Kablolar',
        unit: 'metr',
        price: 2.50,
        costPrice: 1.80,
        stock: 5000
      }
    }),
    prisma.product.create({
      data: {
        sku: 'CABLE-002',
        name: 'VVG 3x4 mm² Kablo',
        description: 'Qapalı məkanda istifadə üçün',
        category: 'Kablolar',
        unit: 'metr',
        price: 3.80,
        costPrice: 2.90,
        stock: 3500
      }
    }),
    prisma.product.create({
      data: {
        sku: 'PANEL-001',
        name: 'Avadanliq paneli 24 modul',
        description: 'Standart elektrik paneli',
        category: 'Avadanlıqlar',
        unit: 'ədəd',
        price: 85.00,
        costPrice: 65.00,
        stock: 150
      }
    }),
    prisma.product.create({
      data: {
        sku: 'SWITCH-001',
        name: 'Aşaqı dartma 10A',
        description: 'Yerli istehsal, yüksək keyfiyyat',
        category: 'Pəncərə',
        unit: 'ədəd',
        price: 12.00,
        costPrice: 8.50,
        stock: 800
      }
    }),
    prisma.product.create({
      data: {
        sku: 'SWITCH-002',
        name: 'Xususi qoruyucu 16A',
        description: 'Qısa qapanmaya qarşı',
        category: 'Pəncərə',
        unit: 'ədəd',
        price: 18.00,
        costPrice: 13.00,
        stock: 600
      }
    }),
    prisma.product.create({
      data: {
        sku: 'TRANS-001',
        name: 'Transformator 100kVA',
        description: 'Elektrik transformatoru',
        category: 'Avadanlıqlar',
        unit: 'ədəd',
        price: 2500.00,
        costPrice: 1950.00,
        stock: 20
      }
    }),
    prisma.product.create({
      data: {
        sku: 'LED-001',
        name: 'LED lampa 50W',
        description: 'Enerjiyə qənaətcil LED lampa',
        category: 'Şöförler',
        unit: 'ədəd',
        price: 35.00,
        costPrice: 25.00,
        stock: 500
      }
    }),
    prisma.product.create({
      data: {
        sku: 'CABLE-003',
        name: 'Optik fiber kabel',
        description: 'Telekommunikasiya üçün',
        category: 'Kablolar',
        unit: 'metr',
        price: 5.50,
        costPrice: 4.00,
        stock: 2000
      }
    })
  ])

  console.log('Products created')

  // Create leads
  const leads = await Promise.all([
    prisma.lead.create({
      data: {
        title: 'Azerishiq MMC - Yeni ofis elektrifikasiya',
        description: 'Yeni tikilən ofis binası üçün tam elektrik quraşdırma',
        value: 45000,
        status: 'QUALIFIED',
        source: 'Website',
        userId: admin.id,
        accountId: account1.id
      }
    }),
    prisma.lead.create({
      data: {
        title: 'Baku Elektrik - Magistral xett',
        description: '2km yeni elektrik xətti çəkilişi',
        value: 120000,
        status: 'PROPOSAL',
        source: 'Campaign',
        userId: salesman1.id,
        accountId: account2.id
      }
    }),
    prisma.lead.create({
      data: {
        title: 'Sumqayit Tikinti - Yasayış kompleksi',
        description: '500 mənzilli kompleks üçün elektrik',
        value: 85000,
        status: 'NEGOTIATION',
        source: 'Referral',
        userId: salesman1.id,
        accountId: account3.id
      }
    }),
    prisma.lead.create({
      data: {
        title: 'Ganja Agirliq - Zavod modernizasiya',
        description: 'Köhnə avadanlıqların yenisi ile evez olunmasi',
        value: 200000,
        status: 'NEW',
        source: 'Website',
        userId: salesman2.id,
        accountId: account4.id
      }
    }),
    prisma.lead.create({
      data: {
        title: 'Naxcivan ENERJİ - Subaycilliq',
        description: 'Yeni elektrik subaycilliq sistemi',
        value: 75000,
        status: 'WON',
        source: 'Campaign',
        userId: admin.id,
        accountId: account5.id
      }
    }),
    prisma.lead.create({
      data: {
        title: 'Semedov Holding - Merkezi ofis',
        description: '5 mərtəbəli ofis binası',
        value: 95000,
        status: 'CONTACTED',
        source: 'Website',
        userId: salesman2.id,
        accountId: account2.id
      }
    })
  ])

  console.log('Leads created')

  // Create quotes
  const quote1 = await prisma.quote.create({
    data: {
      quoteNumber: 'Q-2024-001',
      userId: admin.id,
      accountId: account1.id,
      contactId: contact1.id,
      leadId: leads[0].id,
      status: 'SENT',
      subtotal: 12500,
      taxRate: 0.18,
      taxAmount: 2250,
      total: 14750,
      validUntil: new Date('2026-05-01')
    }
  })

  await prisma.quoteItem.create({
    data: {
      quoteId: quote1.id,
      productId: products[0].id,
      quantity: 2000,
      unitPrice: 2.50,
      total: 5000
    }
  })

  await prisma.quoteItem.create({
    data: {
      quoteId: quote1.id,
      productId: products[2].id,
      quantity: 50,
      unitPrice: 85.00,
      total: 4250
    }
  })

  await prisma.quoteItem.create({
    data: {
      quoteId: quote1.id,
      productId: products[3].id,
      quantity: 100,
      unitPrice: 12.00,
      total: 1200
    }
  })

  const quote2 = await prisma.quote.create({
    data: {
      quoteNumber: 'Q-2024-002',
      userId: salesman1.id,
      accountId: account2.id,
      leadId: leads[1].id,
      status: 'ACCEPTED',
      subtotal: 85000,
      taxRate: 0.18,
      taxAmount: 15300,
      total: 100300
    }
  })

  await prisma.quoteItem.create({
    data: {
      quoteId: quote2.id,
      productId: products[5].id,
      quantity: 40,
      unitPrice: 2500.00,
      total: 100000
    }
  })

  console.log('Quotes created')

  // Create orders
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2024-001',
      userId: admin.id,
      accountId: account5.id,
      quoteId: quote2.id,
      status: 'DELIVERED',
      subtotal: 85000,
      taxRate: 0.18,
      taxAmount: 15300,
      total: 100300,
      shippingAddress: 'Nakhchivan, Heydar Aliyev prospekti'
    }
  })

  await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      productId: products[5].id,
      quantity: 40,
      unitPrice: 2500.00,
      total: 100000
    }
  })

  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2024-002',
      userId: salesman1.id,
      accountId: account3.id,
      status: 'PROCESSING',
      subtotal: 15750,
      taxRate: 0.18,
      taxAmount: 2835,
      total: 18585
    }
  })

  await prisma.orderItem.create({
    data: {
      orderId: order2.id,
      productId: products[0].id,
      quantity: 3000,
      unitPrice: 2.50,
      total: 7500
    }
  })

  await prisma.orderItem.create({
    data: {
      orderId: order2.id,
      productId: products[1].id,
      quantity: 1500,
      unitPrice: 3.80,
      total: 5700
    }
  })

  await prisma.orderItem.create({
    data: {
      orderId: order2.id,
      productId: products[6].id,
      quantity: 50,
      unitPrice: 35.00,
      total: 1750
    }
  })

  await prisma.orderItem.create({
    data: {
      orderId: order2.id,
      productId: products[4].id,
      quantity: 50,
      unitPrice: 18.00,
      total: 900
    }
  })

  console.log('Orders created')

  // Create invoices
  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2024-001',
      orderId: order1.id,
      status: 'PAID',
      subtotal: 85000,
      taxRate: 0.18,
      taxAmount: 15300,
      total: 100300,
      issueDate: new Date('2026-03-01'),
      dueDate: new Date('2026-04-01')
    }
  })

  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2024-002',
      orderId: order2.id,
      status: 'SENT',
      subtotal: 15750,
      taxRate: 0.18,
      taxAmount: 2835,
      total: 18585,
      issueDate: new Date('2026-04-05'),
      dueDate: new Date('2026-05-05')
    }
  })

  console.log('Invoices created')
  console.log('Seeding completed!')
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect())