import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import routes from '../routes/index.js';
import ErrorHandler from '../middleware/error.js';

const app = express();

// ==============================================================================
// 0. TRUST PROXY (SANGAT KRUSIAL UNTUK VPS + DOCKER / NGINX)
// Supaya Rate Limiter dan sistem membaca IP asli user, bukan IP internal Docker
// ==============================================================================
app.set('trust proxy', 1);

// 1. Helmet: Mengamankan HTTP headers
app.use(helmet());

// 2. CORS (Dinamis dari .env)
// Baca dari .env, pisahkan dengan koma jika lebih dari satu.
// Contoh di file .env: ALLOWED_ORIGINS=http://localhost:5173,http://145.79.12.168
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost', 'http://localhost:5173', 'http://145.79.12.168', 'https://nutricca.vercel.app']; // Fallback aman jika .env belum di-set

app.use(
  cors({
    origin: function (origin, callback) {
      // Izinkan request jika origin terdaftar ATAU jika tidak ada origin
      // (Bypass no origin penting untuk testing via Postman/cURL di server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS policy'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
);

// 3. Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // FIX: 15 menit (15 * 60 * 1000)
  max: 200, // Dinaikkan ke 200 agar user tidak mudah kena limit saat navigasi halaman
  message: {
    status: 'fail',
    message:
      'Too many requests from this IP, please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Terapkan limit ini ke semua rute yang berawalan /api
app.use('/api', apiLimiter);

// 4. Built-in Middleware (Parsing JSON body)
app.use(express.json());

// 5. Routes Utama
app.use(routes);

// 6. Error Handler (Harus selalu berada di urutan paling bawah!)
app.use(ErrorHandler);

export default app;
