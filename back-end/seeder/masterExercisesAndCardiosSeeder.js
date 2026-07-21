import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool();

const masterExercises = [
  ['beginner', 'Knee Push up', 'push_up_knee', 'Beginner friendly push up on knees', 10, 0.3],
  ['beginner', 'Assisted Pull up', 'pull_up_assisted', 'Pull up using a resistance band or machine', 5, 0.4],
  ['beginner', 'Knee Plank', 'plank_knee', 'Core strengthening on knees for beginners', 3, 3],
  ['beginner', 'Half Squats', 'squats_half', 'Shallow squats to build basic leg strength', 15, 0.2],
  ['beginner', 'Bench Dips', 'dips_bench', 'Triceps exercise using a bench or chair', 10, 0.3],
  ['intermediate', 'Standard Push up', 'push_up', 'Classic push up exercise for chest and arms', 15, 0.5],
  ['intermediate', 'Standard Pull up', 'pull_up', 'Classic pull up exercise for back', 8, 0.8],
  ['intermediate', 'Standard Plank', 'plank', 'Core strengthening exercise', 3, 5],
  ['intermediate', 'Standard Squats', 'squats', 'Lower body strengthening exercise', 20, 0.3],
  ['intermediate', 'Parallel Bar Dips', 'dips', 'Upper body exercise for triceps and chest', 10, 0.6],
  ['advanced', 'Diamond Push up', 'push_up_diamond', 'Advanced push up targeting triceps and inner chest', 15, 0.8],
  ['advanced', 'Muscle Up', 'muscle_up', 'Advanced combination of pull up and dip', 5, 1.5],
  ['advanced', 'One-Arm Plank', 'plank_one_arm', 'Advanced core stability exercise', 3, 8],
  ['advanced', 'Pistol Squats', 'squats_pistol', 'Single leg squat for advanced strength and balance', 10, 1.2],
  ['advanced', 'Ring Dips', 'dips_ring', 'Gymnastic ring dips requiring stabilization', 10, 1],
].map(([level, name, type, description, target_reps, calories_per_unit]) => ({
  level, name, type, description, target_reps, calories_per_unit, duration_days: 5, icon_url: null,
}));

const masterCardios = [
  ['beginner', 'Light Walking', 'walking_light', 'Relaxed walking pace', 3, 50, 5],
  ['beginner', 'Light Jogging', 'jogging_light', 'Slow pace jogging for beginners', 3, 65, 5],
  ['beginner', 'Stationary Cycling', 'cycling_stationary', 'Indoor easy cycling', 5, 40, 5],
  ['beginner', 'Slow Swimming', 'swimming_slow', 'Leisurely swimming pool sessions', 0.5, 200, 3],
  ['beginner', 'Nature Hiking', 'hiking_easy', 'Light hiking on flat trails', 4, 70, 5],
  ['intermediate', 'Brisk Walking', 'walking_brisk', 'Fast paced walking for fat burn', 8, 60, 5],
  ['intermediate', '10K Running', 'running_10k', 'Standard 10 kilometer run', 10, 80, 5],
  ['intermediate', 'Road Cycling', 'cycling_road', 'Moderate pace road cycling', 15, 50, 5],
  ['intermediate', 'Freestyle Swimming', 'swimming_freestyle', 'Continuous freestyle swimming laps', 2, 350, 3],
  ['intermediate', 'Mountain Climbing', 'mountain_climbing', 'Standard mountain trekking', 10, 90, 5],
  ['advanced', 'Race Walking', 'walking_race', 'Olympic style race walking', 15, 75, 5],
  ['advanced', 'Half Marathon', 'running_marathon', 'High endurance 21K run', 21, 90, 5],
  ['advanced', 'Uphill Cycling', 'cycling_uphill', 'Intense hill climb cycling', 25, 75, 5],
  ['advanced', 'Butterfly Swimming', 'swimming_butterfly', 'High intensity butterfly stroke', 3, 450, 3],
  ['advanced', 'Alpine Climbing', 'climbing_alpine', 'Steep terrain mountaineering', 15, 120, 5],
].map(([level, name, type, description, target_distance, calories_per_unit, duration_days]) => ({
  level, name, type, description, target_distance, calories_per_unit, duration_days, icon_url: null,
}));

const seed = async (table, columns, items) => {
  const values = columns.map((_, index) => `$${index + 1}`).join(', ');
  const updates = columns
    .filter((column) => column !== 'name')
    .map((column) => `${column} = EXCLUDED.${column}`)
    .join(', ');

  for (const item of items) {
    await pool.query(
      `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values})
       ON CONFLICT (name) DO UPDATE SET ${updates}`,
      columns.map((column) => item[column]),
    );
  }
};

try {
  await seed('master_exercises', ['name', 'type', 'description', 'target_reps', 'calories_per_unit', 'duration_days', 'icon_url', 'level'], masterExercises);
  await seed('master_cardios', ['name', 'type', 'description', 'target_distance', 'calories_per_unit', 'duration_days', 'icon_url', 'level'], masterCardios);
  console.log('Master exercise and cardio levels seeded.');
} finally {
  await pool.end();
}
