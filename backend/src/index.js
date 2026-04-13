const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Security Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://lucemoon-crm.netlify.app', 'http://localhost:5173', 'http://localhost:3000']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Request logging (development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/accounts', require('./routes/accounts'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/leads', require('./routes/leads'));
app.use('/api/products', require('./routes/products'));
app.use('/api/quotes', require('./routes/quotes'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/audit-logs', require('./routes/auditLogs'));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(400).json({ error: 'Bu məlumat artıq mövcuddur' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Məlumat tapılmadı' });
  }
  if (err.code === 'P2003') {
    return res.status(400).json({ error: 'İli silmək mümkün deyil - digər məlumatlarla əlaqəlidir' });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Keçərsiz token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token vaxtı keçib' });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  // Default error
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Server xətası baş verdi'
      : err.message
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});