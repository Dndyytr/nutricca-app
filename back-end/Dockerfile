# Gunakan image Node.js versi ringan
FROM node:20-alpine

# Buat folder /app di dalam container
WORKDIR /app

# Copy file package.json terlebih dahulu untuk install dependency
COPY package*.json ./
RUN npm install

# Copy seluruh kode backend Anda
COPY . .

# Buka port 3000
EXPOSE 3000

# Perintah untuk menjalankan server
CMD ["npm", "start:prod"]