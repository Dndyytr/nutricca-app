# Nutricca Frontend - Project Structure

Struktur project frontend yang sudah dibuat untuk HealthPlan Platform.

## 📁 Directory Tree

```
front-end/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx              # Sidebar navigation component
│   │   ├── Layout.jsx               # Main layout wrapper dengan Sidebar + Outlet
│   │   └── index.jsx                # Exported components (StatCard, ProgressBar, etc)
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx            # Halaman dashboard utama
│   │   ├── Kebiasaan.jsx           # Halaman habit tracking
│   │   ├── Rekomendasi.jsx         # Halaman AI recommendations
│   │   ├── Progress.jsx             # Halaman progress & achievements
│   │   ├── Profil.jsx              # Halaman user profile
│   │   └── Notifikasi.jsx          # Halaman notifications
│   │
│   ├── context/
│   │   └── AppContext.jsx           # Global state management dengan React Context
│   │
│   ├── hooks/
│   │   └── useApp.js               # Custom hook untuk mengakses AppContext
│   │
│   ├── services/
│   │   └── api.js                  # API client configuration (Axios)
│   │
│   ├── utils/
│   │   └── helpers.js              # Utility functions (BMI calc, date format, etc)
│   │
│   ├── App.jsx                     # Main App component dengan routing
│   ├── main.jsx                    # Entry point React
│   ├── index.css                   # Global Tailwind styles
│   └── App.css                     # Additional app styles
│
├── public/                         # Static assets folder
├── index.html                      # HTML entry point
├── package.json                    # Dependencies configuration
├── vite.config.js                  # Vite configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── postcss.config.js               # PostCSS configuration
├── .env.example                    # Environment variables template
├── .gitignore                      # Git ignore rules
├── .eslintignore                   # ESLint ignore rules
├── .eslintrc.cjs                   # ESLint configuration
└── README.md                       # Project documentation
```

## 🎯 Komponen yang Sudah Dibuat

### Components (`src/components/`)

1. **Sidebar** - Navigation sidebar dengan menu items dan user profile
2. **Layout** - Main layout dengan Sidebar + Outlet untuk routing
3. **StatCard** - Card untuk menampilkan statistik kesehatan
4. **ProgressBar** - Progress bar dengan label dan percentage
5. **HabitCheckbox** - Checkbox untuk habit tracking
6. **RecommendationCard** - Card untuk rekomendasi AI
7. **NotificationItem** - Item notifikasi dengan tipe dan waktu

### Pages (`src/pages/`)

1. **Dashboard** 
   - Statistik kesehatan harian (berat badan, kalori, air, aktivitas)
   - Grafik trend berat badan (7 hari)
   - Progress bar nutrisi harian
   - Habit completion status

2. **Kebiasaan**
   - Checklist kebiasaan harian dengan filter kategori
   - Input form untuk mencatat air minum, olahraga, kalori
   - kategori: Makanan, Air, Olahraga, Tidur

3. **Rekomendasi**
   - Rekomendasi AI untuk nutrisi dan aktivitas
   - Detail nutrisi (kalori, protein, carbs, fat)
   - Model accuracy dan trend stats
   - Tab navigation untuk berbagai jenis rekomendasi

4. **Progress**
   - Grafik trend berat badan interactive
   - Pencapaian nutrisi (progress bars)
   - Streak tracking & achievement badges
   - Stats untuk weight, progress, target

5. **Profil**
   - Edit user data (nama, email, umur, dll)
   - Data kesehatan (berat badan, tinggi, target)
   - Pengaturan notifikasi
   - BMI calculator & visualization
   - Zona bahaya (delete account)

6. **Notifikasi**
   - Daftar seluruh notifikasi
   - Filter berdasarkan tipe (reminder, achievement, dll)
   - Mark as read functionality

## 🛠️ State Management

Menggunakan **React Context API**:

```javascript
export const AppContext = createContext()

AppContext menyediakan:
- user                      // Data user profile
- setUser                   // Update user
- dailyHealth              // Data kesehatan harian
- updateDailyHealth        // Update kesehatan harian
- habits                   // List kebiasaan
- toggleHabit              // Toggle completion status
- recommendations          // Rekomendasi AI
- progressData             // Data progress & achievements
- notifications            // Notifikasi user
- addNotification          // Add notifikasi baru
```

## 📦 Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.2",
    "recharts": "^2.10.3"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8",
    "tailwindcss": "^3.3.6",
    "postcss": "^8.4.31",
    "autoprefixer": "^10.4.16"
  }
}
```

## 🎨 Tema & Styling

**Tailwind CSS** dengan custom theme colors:

```javascript
colors: {
  dark: '#1a1a1a'          // Background utama
  'dark-card': '#2a2a2a'   // Background card
  'dark-input': '#3a3a3a'  // Background input
  primary: '#6366f1'       // Primary color (indigo)
  success: '#10b981'       // Success (green)
  warning: '#f59e0b'       // Warning (amber)
  danger: '#ef4444'        // Danger (red)
}
```

Responsive breakpoints:
- Mobile-first approach
- md: 768px (tablet)
- lg: 1024px (desktop)

## 🔀 Routing Structure

```
/                    → Dashboard
/kebiasaan          → Habit Tracking
/rekomendasi        → AI Recommendations
/progress           → Progress & Achievements
/profil             → User Profile
/notifikasi         → Notifications
```

## 📊 Chart Visualization

Menggunakan **Recharts** untuk:
- LineChart - Trend berat badan
- BarChart - Nutrisi harian (optional)
- PieChart - Nutrisi breakdown (optional)

## 🔌 API Ready

Service API sudah siap di `src/services/api.js`:
- User CRUD operations
- Daily health tracking
- Habit management
- Recommendations fetching
- Progress data retrieval
- Notifications management

## 💡 Mock Data

Semua halaman menggunakan mock data dari `AppContext` untuk development. Data dapat dengan mudah diganti dengan API calls.

## 🚀 Next Steps untuk Production

1. **Backend Integration**
   - Update API calls di `src/services/api.js`
   - Setup .env.local dengan API URL yang benar
   - Implementasi authentication (JWT/token)

2. **API Deployment**
   - Deploy backend API
   - Deploy AI service untuk recommendations
   - Setup database

3. **Frontend Deployment**
   - Build: `npm run build`
   - Deploy ke Vercel, Netlify, atau server lain
   - Setup CI/CD pipeline

4. **Enhancement**
   - Setup error boundaries
   - Implementasi loading states
   - Add form validation
   - Setup logging dan monitoring

## 📝 Catatan Penting

- Semua komponen menggunakan Tailwind CSS untuk styling
- Responsive design sudah implemented
- Mock data dapat diubah dengan mengedit AppContext
- API client (Axios) sudah siap untuk backend integration
- Dark theme applied untuk pengalaman yang lebih baik

## Generated By

GitHub Copilot
Project: HealthPlan (CC26-PRU427)
Date: May 8, 2026
