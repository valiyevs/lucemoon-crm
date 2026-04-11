# Lucemoon CRM

B2B Elektrik mallari satisi ucun CRM sistemi.

## Tech Stack

- Backend: Node.js + Express + Prisma + PostgreSQL
- Frontend: React 18 + Vite + Tailwind CSS

## Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env  # Edit with your PostgreSQL credentials
npx prisma db push
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Funksionalliq

- Lead menecmenti (NEW → CONTACTED → QUALIFIED → PROPOSAL → NEGOTIATION → WON/LOST)
- Account ve Contact idareetmesi
- Mehsul kataloqu (kablolar, pəncərə, şöförler, avadanlıqlar)
- Quote (teklif) yaradilmasi ve redaktesi
- Order (sifaris) izleme ve status yenileme
- Invoice (faktura) yaradilmasi

## Environment Variables

Backend `.env` faylinda:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT token secret
- `PORT` - Server port (default: 5000)