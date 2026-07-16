import { Pool } from 'pg';
import 'dotenv/config';
import { nanoid } from 'nanoid';

// Inisialisasi koneksi database (akan otomatis membaca env seperti PGUSER, PGPASSWORD, dll)
const pool = new Pool();

const activities = [
  {
    name: 'Walking',
    input_type: 'distance', // Input dalam satuan KM
    category: 'weekly_run', // Masuk ke dalam batasan limit 12km/minggu
    calories_per_unit: 60, // Estimasi: 60 kalori terbakar per 1 km
  },
  {
    name: 'Running',
    input_type: 'distance', // Input dalam satuan KM
    category: 'weekly_run', // Masuk ke dalam batasan limit 12km/minggu
    calories_per_unit: 80, // Estimasi: 80 kalori terbakar per 1 km
  },
  {
    name: 'Cycling',
    input_type: 'distance', // Input dalam satuan KM
    category: 'cycling',
    calories_per_unit: 25, // Estimasi: 25 kalori terbakar per 1 km
  },
  {
    name: 'Swimming',
    input_type: 'distance', // Input dalam satuan KM
    category: 'swimming',
    calories_per_unit: 350, // Estimasi: 350 kalori terbakar per 1 km
  },
  {
    name: 'Gym',
    input_type: 'duration', // Input dalam satuan Menit
    category: 'strength',
    calories_per_unit: 5, // Estimasi: 5 kalori terbakar per 1 menit (300 kcal/jam)
  },
  {
    name: 'Yoga',
    input_type: 'duration', // Input dalam satuan Menit
    category: 'flexibility',
    calories_per_unit: 3, // Estimasi: 3 kalori terbakar per 1 menit (180 kcal/jam)
  },
];

const seedActivities = async () => {
  console.log('🌱 Mulai seeding data master_activities...');

  try {
    for (const activity of activities) {
      const id = `act-${nanoid(16)}`;

      const query = {
        text: `
          INSERT INTO master_activities (id, name, input_type, category, calories_per_unit)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (name) DO NOTHING
        `,
        values: [
          id,
          activity.name,
          activity.input_type,
          activity.category,
          activity.calories_per_unit,
        ],
      };

      await pool.query(query);
      console.log(`🔹 Activity [${activity.name}] berhasil diproses.`);
    }

    console.log('✅ Seeding selesai dengan sukses.');
  } catch (error) {
    console.error('❌ Terjadi kesalahan saat seeding:', error.message);
  } finally {
    // Tutup koneksi database pool agar proses Node.js bisa berhenti
    await pool.end();
  }
};

seedActivities();
