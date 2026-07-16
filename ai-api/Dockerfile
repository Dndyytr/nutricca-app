# Menggunakan base image Python 3.12 versi ringan
FROM python:3.12-slim

# Menentukan direktori kerja di dalam container
WORKDIR /app

# Menyalin file requirements.txt dari komputer lokal ke container
COPY requirements.txt .

# Menginstal semua library yang ada di requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Menyalin seluruh file dan folder proyek (termasuk folder 'app/') ke dalam container
COPY . .

# Membuka port 8000 agar bisa diakses oleh backend Node.js
EXPOSE 8000

# Menjalankan FastAPI menggunakan web server Uvicorn
# 'app.main:app' artinya -> masuk ke modul/folder 'app', buka file 'main.py', dan jalankan instance 'app'
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]