# HealthPlan Frontend - Setup & Deployment Guide

## 📋 Prerequisites

Pastikan Anda sudah menginstall:
- Node.js v16+ (https://nodejs.org)
- npm v8+ atau yarn v1.22+
- Git

Verifikasi instalasi:
```bash
node --version
npm --version
```

## 🚀 Quick Start

### 1. Persiapan Awal

```bash
# Masuk ke folder project
cd front-end

# Install dependencies (jika belum, karena disk space issue)
# npm install
# Jika ada error disk space, coba:
npm install --legacy-peer-deps
```

### 2. Konfigurasi Environment

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local sesuai konfigurasi lokal
# Update VITE_API_URL dengan backend URL Anda
```

Contoh `.env.local`:
```
VITE_API_URL=http://localhost:5000/api
VITE_AI_API_URL=http://localhost:8000/api
VITE_APP_NAME=HealthPlan
VITE_ENV=development
```

### 3. Jalankan Development Server

```bash
npm run dev
```

Server akan berjalan di: `http://localhost:3000`

Fitur yang tersedia:
- Hot Module Replacement (HMR) untuk live reload
- Automatic browser opening

### 4. Build untuk Production

```bash
npm run build
```

Output akan tersimpan di folder `dist/` dan siap untuk deployment.

## 📁 File Structure Overview

```
front-end/
├── src/
│   ├── pages/              # 6 halaman utama
│   ├── components/         # 7 komponen reusable
│   ├── context/            # Global state management
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API client
│   ├── utils/              # Helper functions
│   └── App.jsx             # Main app component
├── public/                 # Static assets
├── index.html              # HTML entry
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS config
└── README.md               # Documentation
```

## 🎯 Available Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | Dashboard | Overview kesehatan harian |
| `/kebiasaan` | Kebiasaan | Habit tracking & checklist |
| `/rekomendasi` | Rekomendasi | AI recommendations |
| `/progress` | Progress | Progress tracking & achievements |
| `/profil` | Profil | User profile management |
| `/notifikasi` | Notifikasi | Notification center |

## 🔌 API Integration Guide

### Setup API Client

File: `src/services/api.js` sudah tersedia dengan struktur siap pakai.

```javascript
// Import API functions
import { 
  getUserProfile, 
  getRecommendations, 
  getHabits 
} from '@/services/api'

// Gunakan dalam component
useEffect(() => {
  getUserProfile(userId)
    .then(data => setUser(data))
    .catch(err => console.error(err))
}, [])
```

### Backend API Endpoints yang Diperlukan

```
GET    /api/users/:id                 # Get user profile
PUT    /api/users/:id                 # Update user profile
GET    /api/daily-health/:id          # Get daily health data
PUT    /api/daily-health/:id          # Update daily health
GET    /api/habits/:id                # Get user habits
POST   /api/habits/:id                # Create habit
PUT    /api/habits/:id                # Update habit
DELETE /api/habits/:id                # Delete habit
GET    /api/recommendations/:id       # Get recommendations
POST   /api/recommendations/:id/generate  # Generate new recommendations
GET    /api/progress/:id              # Get progress data
GET    /api/notifications/:id         # Get notifications
```

## 📦 NPM Scripts

```bash
npm run dev       # Jalankan development server
npm run build     # Build untuk production
npm run preview   # Preview production build
npm run lint      # Run ESLint
```

### Membuat Component Baru

Template:
```jsx
export const MyComponent = ({ prop1, prop2 }) => {
  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Title</h2>
      {/* Content */}
    </div>
  )
}
```

## 🐛 Troubleshooting

### Port 3000 sudah terpakai
```bash
# Ganti port di vite.config.js atau jalankan dengan port berbeda
npm run dev -- --port 3001
```

### Dependencies error
```bash
# Clear node_modules dan install kembali
rm -r node_modules package-lock.json
npm install
```

### Tailwind CSS tidak apply
```bash
# Pastikan index.css terimport di main.jsx
import './index.css'

# Rebuild tailwind cache
npm run build
```

### Module not found errors
- Pastikan path relatif benar
- Gunakan `@` alias jika dikonfigurasi (saat ini belum)
- Cek file extension (`.js`, `.jsx`, dll)

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)
```bash
# Install vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Option 2: Netlify
```bash
# Build dulu
npm run build

# Drag & drop folder dist/ ke Netlify
```

### Option 3: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### Option 4: Traditional Server
```bash
# Build
npm run build

# Upload folder dist/ ke server
# Configure web server (nginx/apache) untuk serve static files
```

## 📊 Performance Optimization

1. **Code Splitting** - React Router sudah handle automatic code splitting
2. **Image Optimization** - Gunakan WebP format untuk images
3. **Lazy Loading** - Implementasi React.lazy untuk components
4. **Bundle Analysis** - Gunakan `npm run build -- --analyze` jika tersedia

## 🔒 Security Checklist

- [ ] Setup HTTPS untuk production
- [ ] Implement authentication (JWT/OAuth)
- [ ] Sanitize user input
- [ ] Implement rate limiting untuk API
- [ ] Setup CORS dengan benar
- [ ] Use environment variables untuk sensitive data
- [ ] Regular dependency updates: `npm audit fix`

## 📝 Git Workflow

```bash
# Clone repository
git clone <repo-url>
cd front-end

# Buat branch untuk fitur baru
git checkout -b feature/nama-fitur

# Commit changes
git add .
git commit -m "feat: deskripsi singkat"

# Push ke repository
git push origin feature/nama-fitur

# Buat Pull Request
```

## 📚 Dokumentasi Tambahan

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vite.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [Recharts](https://recharts.org)

## 🆘 Support & Kontak

Untuk pertanyaan atau issue:
1. Cek dokumentasi di README.md dan PROJECT_STRUCTURE.md
2. Search di GitHub issues
3. Hubungi tim development

## 📋 Checklist sebelum Production

- [ ] Environment variables sudah di-setup
- [ ] Build sukses tanpa error: `npm run build`
- [ ] Testing sudah dilakukan
- [ ] Performance sudah dioptimasi
- [ ] Security checklist sudah dikerjakan
- [ ] API endpoints sudah terintegrasi
- [ ] Authentication sudah implemented
- [ ] Error handling sudah implemented
- [ ] Loading states sudah implemented
- [ ] Mobile responsive sudah dicek

---

**Last Updated**: May 8, 2026
**Version**: 1.0.0
**Author**: GitHub Copilot
