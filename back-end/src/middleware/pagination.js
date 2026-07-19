// middleware/pagination.js

export const paginationMiddleware = (req, res, next) => {
  // 1. Ambil nilai page dan limit dari req.body (untuk method QUERY/POST) 
  // atau req.query (untuk method GET)
  const rawPage = req.body?.page || req.query?.page;
  const rawLimit = req.body?.limit || req.query?.limit;

  // 2. Konversi ke angka, berikan nilai default jika tidak dikirim oleh client
  const page = parseInt(rawPage, 10) || 1;
  let limit = parseInt(rawLimit, 10) || 5; // Default 5 data

  // 3. (Opsional tapi disarankan) Paksa limit maksimal 5 agar client tidak bisa me-request terlalu banyak data sekaligus
  if (limit > 5) {
    limit = 5;
  }

  // 4. Hitung offset (jumlah baris yang dilewati)
  const offset = (page - 1) * limit;

  // 5. Simpan hasil kalkulasi ke dalam object `req` agar bisa dibaca oleh controller
  req.pagination = {
    page,
    limit,
    offset
  };

  // Lanjut ke middleware berikutnya atau controller
  next();
};