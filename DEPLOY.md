# Supabase Quraşdırma Təlimatı

## Addım 1: Supabase Layihəsi Yarat

1. [supabase.com](https://supabase.com) saytına gedin
2. "New Project" düyməsinə basın
3. Yeni layihə yaradın:
   - **Organization**: Şirkətiniz və ya şəxsi
   - **Name**: `lucemoon-crm`
   - **Database Password**: Güclü parol yaradın və YADDAN SAXLAYIN
   - **Region**: `EU-West-1` (və ya sizə yaxın olan)

4. Layihə yarandıqdan sonra **Settings > API** bölməsinə gedin
5. Buradan aşağıdakı məlumatları kopyalayın:
   - `Project URL`: `https://xxxxx.supabase.co`
   - `anon/public` key: `eyJhbGc...`

## Addım 2: Database Schema-nı Quraşdır

1. Supabase dashboard-da **SQL Editor** açın
2. Aşağıdakı SQL script-i yapışdırın və **Run** basın:

```sql
-- Users table
CREATE TABLE users (
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

-- Accounts table
CREATE TABLE accounts (
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

-- Contacts table
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  "firstName" VARCHAR(255) NOT NULL,
  "lastName" VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  position VARCHAR(255),
  "isPrimary" BOOLEAN DEFAULT false,
  "accountId" INTEGER REFERENCES accounts(id),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leads table
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  value REAL,
  status VARCHAR(50) DEFAULT 'NEW',
  source VARCHAR(255),
  "userId" INTEGER REFERENCES users(id),
  "accountId" INTEGER REFERENCES accounts(id),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
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

-- Quotes table
CREATE TABLE quotes (
  id SERIAL PRIMARY KEY,
  "quoteNumber" VARCHAR(255) UNIQUE NOT NULL,
  "userId" INTEGER REFERENCES users(id),
  "accountId" INTEGER REFERENCES accounts(id),
  "contactId" INTEGER REFERENCES contacts(id),
  "leadId" INTEGER REFERENCES leads(id),
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

-- Quote Items table
CREATE TABLE "quoteItems" (
  id SERIAL PRIMARY KEY,
  "quoteId" INTEGER REFERENCES quotes(id),
  "productId" INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  "unitPrice" REAL NOT NULL,
  total REAL NOT NULL
);

-- Orders table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  "orderNumber" VARCHAR(255) UNIQUE NOT NULL,
  "userId" INTEGER REFERENCES users(id),
  "accountId" INTEGER REFERENCES accounts(id),
  "contactId" INTEGER REFERENCES contacts(id),
  "quoteId" INTEGER UNIQUE REFERENCES quotes(id),
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

-- Order Items table
CREATE TABLE "orderItems" (
  id SERIAL PRIMARY KEY,
  "orderId" INTEGER REFERENCES orders(id),
  "productId" INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  "unitPrice" REAL NOT NULL,
  total REAL NOT NULL
);

-- Invoices table
CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  "invoiceNumber" VARCHAR(255) UNIQUE NOT NULL,
  "orderId" INTEGER REFERENCES orders(id),
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

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE "quoteItems" ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE "orderItems" ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (for development)
CREATE POLICY "Public access to users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to accounts" ON accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to contacts" ON contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to leads" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to quotes" ON quotes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to quoteItems" ON "quoteItems" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to orders" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to orderItems" ON "orderItems" FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to invoices" ON invoices FOR ALL USING (true) WITH CHECK (true);
```

## Addım 3: Backend-i Supabase-e Bağla

`.env` faylını yeniləyin:

```
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=5000
NODE_ENV=production
```

## Addım 4: Test Data Yüklə

Supabase SQL Editor-də seed data yükləyin (admin user yaradın).

## Addım 5: Backend-i Deploy Edin

**Render.com istifadə edin:**

1. [render.com](https://render.com) saytına gedin
2. "New Web Service" yaradın
3. GitHub repository-nizi bağlayın
4. Settings:
   - **Root Directory**: `backend` (yoxsa `./backend` deyil)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Environment Variables əlavə edin:
   - `DATABASE_URL`: Supabase connection string (postgresql://...)
   - `JWT_SECRET`: JWT secret (güclü parol)
   - `NODE_ENV`: `production`

## Addım 6: Netlify Deploy

1. [netlify.com](https://netlify.com) saytına gedin
2. "Add new site" > "Import an existing project"
3. GitHub repository-nizi bağlayın
4. Build settings:
   - **Base directory**: `frontend` (seçin)
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `dist`
5. Environment Variables:
   - `VITE_API_URL`: Backend-in URL-i (məsələn: `https://your-backend.onrender.com/api`)
   - **IMPORTANT**: VITE_API_URL sonunda `/api` ilə bitməlidir!

---

**QEYD**: Əgər daha professional deploy istəyirsinizsə, backend-i də Netlify Functions və ya Vercel ilə deploy edə bilərsiniz (Express üçün serverless uyğun deyil, Render və ya Railway tövsiyə olunur).