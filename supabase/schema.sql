-- Supabase Schema for Lucemoon CRM
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT DEFAULT 'SALESMAN' CHECK (role IN ('ADMIN', 'MANAGER', 'SALESMAN')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Accounts table
CREATE TABLE public.accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Company', 'Individual')),
  industry TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contacts table
CREATE TABLE public.contacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  position TEXT,
  is_primary BOOLEAN DEFAULT false,
  account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads table
CREATE TABLE public.leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  value DOUBLE PRECISION,
  status TEXT DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST')),
  source TEXT,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE public.products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  cost_price DOUBLE PRECISION,
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quotes table
CREATE TABLE public.quotes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quote_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED')),
  subtotal DOUBLE PRECISION DEFAULT 0,
  tax_rate DOUBLE PRECISION DEFAULT 0,
  tax_amount DOUBLE PRECISION DEFAULT 0,
  total DOUBLE PRECISION DEFAULT 0,
  notes TEXT,
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quote Items table
CREATE TABLE public.quote_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  unit_price DOUBLE PRECISION NOT NULL,
  total DOUBLE PRECISION NOT NULL
);

-- Orders table
CREATE TABLE public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  quote_id UUID UNIQUE REFERENCES public.quotes(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
  subtotal DOUBLE PRECISION DEFAULT 0,
  tax_rate DOUBLE PRECISION DEFAULT 0,
  tax_amount DOUBLE PRECISION DEFAULT 0,
  total DOUBLE PRECISION DEFAULT 0,
  shipping_address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items table
CREATE TABLE public.order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  unit_price DOUBLE PRECISION NOT NULL,
  total DOUBLE PRECISION NOT NULL
);

-- Invoices table
CREATE TABLE public.invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED')),
  issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE,
  subtotal DOUBLE PRECISION DEFAULT 0,
  tax_rate DOUBLE PRECISION DEFAULT 0,
  tax_amount DOUBLE PRECISION DEFAULT 0,
  total DOUBLE PRECISION DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  due_date TIMESTAMP WITH TIME ZONE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Audit Logs table
CREATE TABLE public.audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  changes JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) - Enable for all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow authenticated users to read all
-- Users can read all data but only admins can modify users table
CREATE POLICY "Allow authenticated users to read users" ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read accounts" ON public.accounts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read contacts" ON public.contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read leads" ON public.leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read quotes" ON public.quotes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read quote_items" ON public.quote_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read orders" ON public.orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read order_items" ON public.order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read invoices" ON public.invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read tasks" ON public.tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to read audit_logs" ON public.audit_logs FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to insert/update/delete (you can restrict this later based on role)
CREATE POLICY "Allow authenticated users to insert accounts" ON public.accounts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update accounts" ON public.accounts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete accounts" ON public.accounts FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert contacts" ON public.contacts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update contacts" ON public.contacts FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete contacts" ON public.contacts FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert leads" ON public.leads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update leads" ON public.leads FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete leads" ON public.leads FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert products" ON public.products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update products" ON public.products FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete products" ON public.products FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert quotes" ON public.quotes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update quotes" ON public.quotes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete quotes" ON public.quotes FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert quote_items" ON public.quote_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update quote_items" ON public.quote_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete quote_items" ON public.quote_items FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update orders" ON public.orders FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete orders" ON public.orders FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert order_items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update order_items" ON public.order_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete order_items" ON public.order_items FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert invoices" ON public.invoices FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update invoices" ON public.invoices FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete invoices" ON public.invoices FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert tasks" ON public.tasks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update tasks" ON public.tasks FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to delete tasks" ON public.tasks FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert audit_logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for better performance
CREATE INDEX idx_leads_user_id ON public.leads(user_id);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_account_id ON public.leads(account_id);
CREATE INDEX idx_quotes_user_id ON public.quotes(user_id);
CREATE INDEX idx_quotes_status ON public.quotes(status);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_account_id ON public.orders(account_id);
CREATE INDEX idx_invoices_order_id ON public.invoices(order_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

-- Seed data for initial users
-- Note: Auth users are created via Supabase Auth, these are profile records
-- INSERT INTO public.users (id, email, first_name, last_name, role) VALUES
--   ('your-auth-user-id-1', 'admin@lucemoon.az', 'Admin', 'User', 'ADMIN'),
--   ('your-auth-user-id-2', 'sale@lucemoon.az', 'Sale', 'User', 'SALESMAN');
