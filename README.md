# 🌿 Nutricca App

Nutricca App adalah aplikasi berbasis AI yang dirancang untuk membantu pengguna merencanakan dan mengelola gaya hidup sehat secara personal. Aplikasi ini mengintegrasikan kecerdasan buatan untuk memberikan rekomendasi kesehatan yang disesuaikan dengan kebutuhan, kondisi, dan tujuan masing-masing pengguna.

---

## 🏗️ Arsitektur Aplikasi

```
health-plan-app/
├── frontend/        # React + Vite
├── backend/         # Node.js + Express + PostgreSQL
└── ai-api/          # FastAPI (Python)
```

---

## ⚙️ Tech Stack

| Layer      | Teknologi                                |
|------------|------------------------------------------|
| Frontend   | React, Vite                              |
| Backend    | Node.js, Express, PostgreSQL, Docker     |
| AI API     | Python, FastAPI, Docker                  |

---

## 🚀 Setup & Instalasi

### Prasyarat

Pastikan kamu sudah menginstal tools berikut sebelum memulai:

- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (v3.10+)
- [PostgreSQL](https://www.postgresql.org/) (v14+)
- [Git](https://git-scm.com/)

---

### 1. Clone Repository

```bash
git clone https://github.com/Dndyytr/nutricca-app.git
cd nutricca-app
```

---

### 2. Setup Frontend (React + Vite)

```bash
cd front-end
```

Install dependencies:

```bash
npm install
```

Buat file environment:

```bash
cp .env.example .env
```

Isi variabel berikut di file `.env`:

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_AI_API_URL=http://ai-api:8000/api
```

Jalankan development server:

```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

---

### 3. Setup Backend (Node.js + PostgreSQL)

```bash
cd ../backend
```

Install dependencies:

```bash
npm install
```

Buat file environment:

```bash
cp .env.example .env
```

Isi variabel berikut di file `.env`:

```env
HOST=0.0.0.0
PORT=3000

PGUSER=dev_adhi
PGHOST=127.0.0.1
PGPASSWORD=Jakarta191004
PGDATABASE=nutrica-db
PGPORT=5432

NODE_ENV=DEVELOPMENT/PRODUCTION

ACCESS_TOKEN_KEY=YOUR_ACCESS_TOKEN
REFRESH_TOKEN_KEY=YOUR_REFRESH_TOKEN

ALLOWED_ORIGINS=YOUR_FRONT_END_URL

AI_API_URL=http://localhost:8000
```

Setup database PostgreSQL:

```bash
# Buat database baru
psql -U postgres -c "CREATE DATABASE nutricca-db;"

# Jalankan migrasi
npm run migrate up

# (Opsional) Jalankan seeder untuk data awal
npm run seed:recipes
npm run seed:master_activities
```

Jalankan server:

```bash
npm run start:dev
```

Backend akan berjalan di `http://localhost:3000`

---

### 4. Setup AI API (FastAPI)

```bash
cd nutricca-app
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Jalankan server:

```bash
docker compose build -d
docker compose up -d ai-api
```

AI API akan berjalan di `http://localhost:8000`

## 🌐 URL Layanan

| Service    | URL                          |
|------------|------------------------------|
| Frontend   | http://localhost:5173        |
| Backend    | http://localhost:3000        |
| AI API     | http://localhost:8000        |

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).
