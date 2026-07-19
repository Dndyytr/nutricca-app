import { Pool } from 'pg';
import 'dotenv/config';

// Inisialisasi koneksi database
const pool = new Pool();

const masterExercises = [
  {
    name: 'Push up',
    type: 'push_up',
    description: 'Classic push up exercise for chest and arms',
    target_reps: 15,
    calories_per_unit: 0.5, // 0.5 cal per rep
    duration_days: 5,
    icon_url: null,
  },
  {
    name: 'Pull up',
    type: 'pull_up',
    description: 'Classic pull up exercise for back',
    target_reps: 8,
    calories_per_unit: 0.8, // 0.8 cal per rep
    duration_days: 5,
    icon_url: null,
  },
  {
    name: 'Plank',
    type: 'plank',
    description: 'Core strengthening exercise',
    target_reps: 3, // in sets
    calories_per_unit: 5, // 5 cal per set (approx 60 sec per set)
    duration_days: 5,
    icon_url: null,
  },
  {
    name: 'Squats',
    type: 'squats',
    description: 'Lower body strengthening exercise',
    target_reps: 20,
    calories_per_unit: 0.3, // 0.3 cal per rep
    duration_days: 5,
    icon_url: null,
  },
  {
    name: 'Dips',
    type: 'dips',
    description: 'Upper body exercise for triceps and chest',
    target_reps: 10,
    calories_per_unit: 0.6, // 0.6 cal per rep
    duration_days: 5,
    icon_url: null,
  },
];

const masterCardios = [
  {
    name: 'Running',
    type: 'running',
    description: 'Running cardio exercise',
    target_distance: 12,
    calories_per_unit: 80, // 80 cal per km
    duration_days: 5,
    icon_url: null,
  },
  {
    name: 'Walking',
    type: 'walking',
    description: 'Walking cardio exercise',
    target_distance: 8,
    calories_per_unit: 60, // 60 cal per km
    duration_days: 5,
    icon_url: null,
  },
  {
    name: 'Mountain Climbing',
    type: 'mountain_climbing',
    description: 'Mountain climbing cardio exercise',
    target_distance: 10,
    calories_per_unit: 90, // 90 cal per km
    duration_days: 5,
    icon_url: null,
  },
  {
    name: 'Cycling',
    type: 'cycling',
    description: 'Cycling cardio exercise',
    target_distance: 15,
    calories_per_unit: 50, // 50 cal per km
    duration_days: 5,
    icon_url: null,
  },
  {
    name: 'Swimming',
    type: 'swimming',
    description: 'Swimming cardio exercise',
    target_distance: 2,
    calories_per_unit: 350, // 350 cal per km
    duration_days: 3,
    icon_url: null,
  },
];

const seedMasterData = async () => {
  console.log('🌱 Mulai seeding master exercises dan cardios...');

  try {
    // Seed master exercises
    console.log('\n📝 Seeding Master Exercises...');
    for (const exercise of masterExercises) {
      const query = `
        INSERT INTO master_exercises (name, type, description, target_reps, calories_per_unit, duration_days, icon_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (name) DO NOTHING
        RETURNING id, name, calories_per_unit
      `;
      const result = await pool.query(query, [
        exercise.name,
        exercise.type,
        exercise.description,
        exercise.target_reps,
        exercise.calories_per_unit,
        exercise.duration_days,
        exercise.icon_url,
      ]);

      if (result.rows.length > 0) {
        console.log(`✅ Exercise [${result.rows[0].name}] (ID: ${result.rows[0].id}) - ${result.rows[0].calories_per_unit} cal/unit`);
      } else {
        console.log(`⚠️  Exercise [${exercise.name}] sudah ada, skip`);
      }
    }

    // Seed master cardios
    console.log('\n🏃 Seeding Master Cardios...');
    for (const cardio of masterCardios) {
      const query = `
        INSERT INTO master_cardios (name, type, description, target_distance, calories_per_unit, duration_days, icon_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (name) DO NOTHING
        RETURNING id, name, calories_per_unit
      `;
      const result = await pool.query(query, [
        cardio.name,
        cardio.type,
        cardio.description,
        cardio.target_distance,
        cardio.calories_per_unit,
        cardio.duration_days,
        cardio.icon_url,
      ]);

      if (result.rows.length > 0) {
        console.log(`✅ Cardio [${result.rows[0].name}] (ID: ${result.rows[0].id}) - ${result.rows[0].calories_per_unit} cal/km`);
      } else {
        console.log(`⚠️  Cardio [${cardio.name}] sudah ada, skip`);
      }
    }

    console.log('\n✨ Seeding selesai dengan sukses!');
  } catch (error) {
    console.error('❌ Terjadi kesalahan saat seeding:', error.message);
  } finally {
    await pool.end();
  }
};

seedMasterData();
