# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyek Haqqında

B2B Elektrik mallari satisi ucun CRM sistemi. MERN stack (SQLite, Express, React, Node.js) ile qurulub. Sistem Lead-den sifaris ve catdirilmaya qeder tam satis axinini idare edir.

## Tech Stack

- **Backend**: Node.js + Express + Prisma ORM + SQLite (local) / PostgreSQL (production)
- **Frontend**: React 18 + Vite + Tailwind CSS + React Router v6 + Recharts
- **Auth**: JWT token-based authentication
- **Drag & Drop**: @dnd-kit/core + @dnd-kit/sortable (satış pipelini ucun)

## Layihe Strukturu

```
lucemoon-crm/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma   # Database models
│   │   └── seed.js         # Test data seeder
│   └── src/
│       ├── index.js        # Express app entry
│       ├── routes/         # API endpoints
│       ├── controllers/    # Business logic
│       └── middleware/     # JWT auth middleware
├── frontend/
│   └── src/
│       ├── api/            # Axios instance
│       ├── components/     # Layout, UI components
│       ├── context/        # AuthContext
│       └── pages/          # Route pages (13 page)
```

## Bashliq Emrler

### Backend
```bash
cd backend
npm install
npm run dev          # Development server (port 5000)
npm run db:push      # Push schema to database
npm run db:studio    # Prisma Studio GUI
node prisma/seed.js  # Test datalari ile doldur
```

### Frontend
```bash
cd frontend
npm install
npm run dev          # Vite dev server (port 3000)
npm run build        # Production build
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Yeni istifadeci qeydiyyati |
| POST | /api/auth/login | Girish, JWT qaytarir |
| GET | /api/auth/me | Cari istifadeci melumati |
| GET/POST | /api/leads | Lead siyahisi/yaratma |
| GET/PUT/DELETE | /api/leads/:id | Lead CRUD |
| PUT | /api/leads/:id | Lead statusunu deyisdir (pipeline ucun) |
| GET/POST | /api/accounts | Account siyahisi/yaratma |
| GET/POST | /api/contacts | Contact siyahisi/yaratma |
| GET/POST | /api/products | Mehsul siyahisi/yaratma |
| GET | /api/products/categories | Kategoriyalar |
| GET/POST | /api/quotes | Quote siyahisi/yaratma |
| GET/POST | /api/orders | Order siyahisi/yaratma |
| GET/POST | /api/invoices | Invoice siyahisi/yaratma |
| GET | /api/users | İstifadeci idareetmesi (Admin) |
| PUT | /api/users/:id | İstifadeci status deyisdirme |

## Authentication

JWT token localStorage-de saxlanilir. API sorgularinda `x-auth-token` header olmalidir. Admin rollu istifadeciler /users ve /settings sehifelerine gire biler.

## Database Setup (SQLite - Development)

```bash
cd backend
npx prisma db push          # Schema-ni database-e at
node prisma/seed.js         # Test datalarini elave et
```

## Pages

1. **Dashboard** - Statistik, chartlar, son leadler, suretli emeliyyatlar
2. **Pipeline** - Kanban-style drag-drop lead idareetmesi (7 stage)
3. **Leads** - Lead siyahisi cedvel formatinda
4. **LeadDetail** - Lead detallari, redakte
5. **Accounts** - Musteri/Musteri siyahisi (card formatinda)
6. **Contacts** - Kontakt siyahisi
7. **Products** - Mehsul kataloqu, kategoriyalar
8. **Quotes** - Teklif siyahisi
9. **QuoteDetail** - Teklif detallari, status deyisdirme
10. **Orders** - Sifaris siyahisi
11. **OrderDetail** - Sifaris detallari, status, invoice yaradilma
12. **Invoices** - Faktura siyahisi
13. **Users** - İstifadeci idareetmesi (Admin only)
14. **Settings** - Sistem ayarlari

## Lead Stages (Pipeline)

Yeni → Əlaqə qurulub → Keyfiyyətli → Təklif verilib → Danışıqda → Qazanan / İtirilib

## Test Hesablari

| Email | Sifre | Role |
|-------|-------|------|
| admin@lucemoon.az | admin123 | ADMIN |
| sale@lucemoon.az | admin123 | SALESMAN |
| elvin@lucemoon.az | admin123 | SALESMAN |