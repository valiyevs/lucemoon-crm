-- ================================================
-- LUCE MOON CRM - Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- ENUMS
-- ================================================
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'SALESMAN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ================================================
-- USERS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS "User" (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  "firstName" VARCHAR(255) NOT NULL,
  "lastName" VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'SALESMAN',
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- ACCOUNTS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS "Account" (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  industry VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(255),
  country VARCHAR(255),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- CONTACTS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS "Contact" (
  id SERIAL PRIMARY KEY,
  "firstName" VARCHAR(255) NOT NULL,
  "lastName" VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  position VARCHAR(255),
  "isPrimary" BOOLEAN DEFAULT false,
  "accountId" INTEGER REFERENCES "Account"(id),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- LEADS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS "Lead" (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  value REAL,
  status VARCHAR(50) DEFAULT 'NEW',
  source VARCHAR(255),
  "userId" INTEGER REFERENCES "User"(id),
  "accountId" INTEGER REFERENCES "Account"(id),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- PRODUCTS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS "Product" (
  id SERIAL PRIMARY KEY,
  sku VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(255) NOT NULL,
  unit VARCHAR(50),
  price REAL NOT NULL,
  "costPrice" REAL,
  stock INTEGER DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- QUOTES TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS "Quote" (
  id SERIAL PRIMARY KEY,
  "quoteNumber" VARCHAR(255) UNIQUE NOT NULL,
  "userId" INTEGER REFERENCES "User"(id),
  "accountId" INTEGER REFERENCES "Account"(id),
  "contactId" INTEGER REFERENCES "Contact"(id),
  "leadId" INTEGER REFERENCES "Lead"(id),
  status VARCHAR(50) DEFAULT 'DRAFT',
  subtotal REAL NOT NULL,
  "taxRate" REAL DEFAULT 0,
  "taxAmount" REAL DEFAULT 0,
  total REAL NOT NULL,
  notes TEXT,
  "validUntil" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- QUOTE ITEMS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS "QuoteItem" (
  id SERIAL PRIMARY KEY,
  "quoteId" INTEGER REFERENCES "Quote"(id),
  "productId" INTEGER REFERENCES "Product"(id),
  quantity INTEGER NOT NULL,
  "unitPrice" REAL NOT NULL,
  total REAL NOT NULL
);

-- ================================================
-- ORDERS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS "Order" (
  id SERIAL PRIMARY KEY,
  "orderNumber" VARCHAR(255) UNIQUE NOT NULL,
  "userId" INTEGER REFERENCES "User"(id),
  "accountId" INTEGER REFERENCES "Account"(id),
  "contactId" INTEGER REFERENCES "Contact"(id),
  "quoteId" INTEGER UNIQUE REFERENCES "Quote"(id),
  status VARCHAR(50) DEFAULT 'PENDING',
  subtotal REAL NOT NULL,
  "taxRate" REAL DEFAULT 0,
  "taxAmount" REAL DEFAULT 0,
  total REAL NOT NULL,
  "shippingAddress" TEXT,
  notes TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- ORDER ITEMS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS "OrderItem" (
  id SERIAL PRIMARY KEY,
  "orderId" INTEGER REFERENCES "Order"(id),
  "productId" INTEGER REFERENCES "Product"(id),
  quantity INTEGER NOT NULL,
  "unitPrice" REAL NOT NULL,
  total REAL NOT NULL
);

-- ================================================
-- INVOICES TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS "Invoice" (
  id SERIAL PRIMARY KEY,
  "invoiceNumber" VARCHAR(255) UNIQUE NOT NULL,
  "orderId" INTEGER REFERENCES "Order"(id),
  status VARCHAR(50) DEFAULT 'DRAFT',
  "issueDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "dueDate" TIMESTAMP,
  subtotal REAL NOT NULL,
  "taxRate" REAL DEFAULT 0,
  "taxAmount" REAL DEFAULT 0,
  total REAL NOT NULL,
  notes TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- SEED DATA - Test Users
-- ================================================
INSERT INTO "User" (email, password, "firstName", "lastName", role) VALUES
  ('admin@lucemoon.az', '$2a$10$abcdefghijklmnopqrstuv', 'Admin', 'User', 'ADMIN'),
  ('sale@lucemoon.az', '$2a$10$abcdefghijklmnopqrstuv', 'Sales', 'Man', 'SALESMAN'),
  ('elvin@lucemoon.az', '$2a$10$abcdefghijklmnopqrstuv', 'Elvin', 'Memmedov', 'SALESMAN')
ON CONFLICT (email) DO NOTHING;

-- ================================================
-- SEED DATA - Sample Products
-- ================================================
INSERT INTO "Product" (sku, name, description, category, unit, price, "costPrice", stock) VALUES
  ('KAB-001', 'NAXŞAMI KABEL 3x1.5', 'Elektrik nağılları üçün', 'Kabellər', 'metr', 2.50, 1.80, 1000),
  ('KAB-002', 'NAXŞAMI KABEL 3x2.5', 'Elektrik nağılları üçün', 'Kabellər', 'metr', 3.80, 2.50, 800),
  ('KON-001', 'AVTOMATİK SİGORTA 16A', 'Elektrik qoruyucu', 'Avtomatlar', 'ədəd', 15.00, 10.00, 200),
  ('KON-002', 'AVTOMATİK SİGORTA 32A', 'Elektrik qoruyucu', 'Avtomatlar', 'ədəd', 22.00, 15.00, 150),
  ('P列-001', 'PANEL KONTAKTOR 25A', 'Elektrik kontaktoru', 'Kontaktorlar', 'ədəd', 45.00, 30.00, 50)
ON CONFLICT (sku) DO NOTHING;

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Contact" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Lead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Quote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "QuoteItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;

-- Public access policies (development mode)
CREATE POLICY "Public access to users" ON "User" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to accounts" ON "Account" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to contacts" ON "Contact" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to leads" ON "Lead" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to products" ON "Product" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to quotes" ON "Quote" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to quoteItems" ON "QuoteItem" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to orders" ON "Order" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to orderItems" ON "OrderItem" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to invoices" ON "Invoice" FOR ALL USING (true) WITH CHECK (true);

-- ================================================
-- NOTES
-- ================================================
-- Test users have dummy password hashes
-- Real hashes will be created when users register
-- Or you can update them manually via SQL:
-- UPDATE "User" SET password = '$2a$10$rIC/iQh1V9ZjRG7cGvTNKe5pK1kqJXhG8XqJ0W9Z3K5mX8n1hQYm.' WHERE email = 'admin@lucemoon.az';