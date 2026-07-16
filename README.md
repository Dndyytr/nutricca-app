# 🌿 Health Plan App

Health Plan App adalah aplikasi berbasis AI yang dirancang untuk membantu pengguna merencanakan dan mengelola gaya hidup sehat secara personal. Aplikasi ini mengintegrasikan kecerdasan buatan untuk memberikan rekomendasi kesehatan yang disesuaikan dengan kebutuhan, kondisi, dan tujuan masing-masing pengguna.

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

| Layer      | Teknologi                        |
|------------|----------------------------------|
| Frontend   | React, Vite                      |
| Backend    | Node.js, Express, PostgreSQL     |
| AI API     | Python, FastAPI                  |

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
git clone https://github.com/username/health-plan-app.git
cd health-plan-app
```

---

### 2. Setup Frontend (React + Vite)

```bash
cd frontend
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
VITE_API_BASE_URL=
VITE_AI_API_URL=
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
PORT=
DATABASE_URL=
JWT_SECRET=
AI_API_URL=
```

Setup database PostgreSQL:

```bash
# Buat database baru
psql -U postgres -c "CREATE DATABASE health_plan_db;"

# Jalankan migrasi
npm run migrate

# (Opsional) Jalankan seeder untuk data awal
npm run seed
```

Jalankan server:

```bash
npm run dev
```

Backend akan berjalan di `http://localhost:5000`

---

### 4. Setup AI API (FastAPI)

```bash
cd ../ai-api
```

Buat dan aktifkan virtual environment:

```bash
# Buat virtual environment
python -m venv venv

# Aktifkan (Linux/macOS)
source venv/bin/activate

# Aktifkan (Windows)
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Buat file environment:

```bash
cp .env.example .env
```

Isi variabel berikut di file `.env`:

```env
OPENAI_API_KEY=
DATABASE_URL=
SECRET_KEY=
```

Jalankan server:

```bash
uvicorn main:app --reload --port 8000
```

AI API akan berjalan di `http://localhost:8000`

---

## ✅ Menjalankan Semua Service Sekaligus

Untuk kemudahan development, kamu bisa menjalankan semua service sekaligus menggunakan terminal terpisah atau dengan tool seperti [concurrently](https://www.npmjs.com/package/concurrently).

**Terminal 1 – Frontend:**
```bash
cd frontend && npm run dev
```

**Terminal 2 – Backend:**
```bash
cd backend && npm run dev
```

**Terminal 3 – AI API:**
```bash
cd ai-api && source venv/bin/activate && uvicorn main:app --reload --port 8000
```

---

## 🌐 URL Layanan

| Service    | URL                          |
|------------|------------------------------|
| Frontend   | http://localhost:5173        |
| Backend    | http://localhost:3000        |
| AI API     | http://localhost:8000        |

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).
