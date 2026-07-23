// seeder/masterExercisesAndCardiosSeeder.js
import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool();

const masterExercises = [
  {
    level: 'beginner',
    name: 'Knee Push up',
    type: 'push_up_knee',
    description: 'Beginner friendly push up on knees',
    target_reps: 10,
    calories_per_unit: 0.3,
    duration_days: 5,
    icon_url:
      'https://res.cloudinary.com/dvhh2li6s/image/upload/v1784776887/Knee_Push_Up_ieeayq.png',
  },
  {
    level: 'beginner',
    name: 'Assisted Pull up',
    type: 'pull_up_assisted',
    description: 'Pull up using a resistance band or machine',
    target_reps: 5,
    calories_per_unit: 0.4,
    duration_days: 5,
    icon_url:
      'https://res.cloudinary.com/dvhh2li6s/image/upload/v1784776886/Assisted_Pull_Up_nstok0.png',
  },
  {
    level: 'beginner',
    name: 'Knee Plank',
    type: 'plank_knee',
    description: 'Core strengthening on knees for beginners',
    target_reps: 3,
    calories_per_unit: 3,
    duration_days: 5,
    icon_url:
      'https://res.cloudinary.com/dvhh2li6s/image/upload/v1784776888/Knee_Plank_z7lhro.png',
  },
  {
    level: 'beginner',
    name: 'Half Squats',
    type: 'squats_half',
    description: 'Shallow squats to build basic leg strength',
    target_reps: 15,
    calories_per_unit: 0.2,
    duration_days: 5,
    icon_url:
      'https://res.cloudinary.com/dvhh2li6s/image/upload/v1784776889/Standard_Squats_knzdzh.png',
  },
  {
    level: 'beginner',
    name: 'Bench Dips',
    type: 'dips_bench',
    description: 'Triceps exercise using a bench or chair',
    target_reps: 10,
    calories_per_unit: 0.3,
    duration_days: 5,
    icon_url:
      'https://res.cloudinary.com/dvhh2li6s/image/upload/v1784776886/Bench_Dips_cexleb.png',
  },
  {
    level: 'intermediate',
    name: 'Standard Push up',
    type: 'push_up',
    description: 'Classic push up exercise for chest and arms',
    target_reps: 15,
    calories_per_unit: 0.5,
    duration_days: 5,
    icon_url:
      'https://res.cloudinary.com/dvhh2li6s/image/upload/v1784776889/Standard_Push_Up_tct9ku.png',
  },
  {
    level: 'intermediate',
    name: 'Standard Pull up',
    type: 'pull_up',
    description: 'Classic pull up exercise for back',
    target_reps: 8,
    calories_per_unit: 0.8,
    duration_days: 5,
    icon_url:
      'https://res.cloudinary.com/dvhh2li6s/image/upload/v1784776889/Standard_Pull_Up_h46mmy.png',
  },
  {
    level: 'intermediate',
    name: 'Standard Plank',
    type: 'plank',
    description: 'Core strengthening exercise',
    target_reps: 3,
    calories_per_unit: 5,
    duration_days: 5,
    icon_url:
      'https://res.cloudinary.com/dvhh2li6s/image/upload/v1784776888/Standard_Plank_woabbf.png',
  },
  {
    level: 'intermediate',
    name: 'Standard Squats',
    type: 'squats',
    description: 'Lower body strengthening exercise',
    target_reps: 20,
    calories_per_unit: 0.3,
    duration_days: 5,
    icon_url:
      'https://res.cloudinary.com/dvhh2li6s/image/upload/v1784776889/Standard_Squats_knzdzh.png',
  },
  {
    level: 'intermediate',
    name: 'Parallel Bar Dips',
    type: 'dips',
    description: 'Upper body exercise for triceps and chest',
    target_reps: 10,
    calories_per_unit: 0.6,
    duration_days: 5,
    icon_url:
      'https://res.cloudinary.com/dvhh2li6s/image/upload/v1784776886/Parallel_Bar_Dips_pluetr.png',
  },
  {
    level: 'advanced',
    name: 'Diamond Push up',
    type: 'push_up_diamond',
    description: 'Advanced push up targeting triceps and inner chest',
    target_reps: 15,
    calories_per_unit: 0.8,
    duration_days: 5,
    icon_url:
      'https://res.cloudinary.com/dvhh2li6s/image/upload/v1784776886/Diamond_Push_Up_f8lyiw.png',
  },
  {
    level: 'advanced',
    name: 'Muscle Up',
    type: 'muscle_up',
    description: 'Advanced combination of pull up and dip',
    target_reps: 5,
    calories_per_unit: 1.5,
    duration_days: 5,
    icon_url:
      'https://res.cloudinary.com/dvhh2li6s/image/upload/v1784776888/Muscle_Up_dmfcmf.png',
  },
  {
    level: 'advanced',
    name: 'One-Arm Plank',
    type: 'plank_one_arm',
    description: 'Advanced core stability exercise',
    target_reps: 3,
    calories_per_unit: 8,
    duration_days: 5,
    icon_url:
      'https://res.cloudinary.com/dvhh2li6s/image/upload/v1784776889/One_Arm_Plank_szg4lm.png',
  },
  {
    level: 'advanced',
    name: 'Pistol Squats',
    type: 'squats_pistol',
    description: 'Single leg squat for advanced strength and balance',
    target_reps: 10,
    calories_per_unit: 1.2,
    duration_days: 5,
    icon_url:
      'https://res.cloudinary.com/dvhh2li6s/image/upload/v1784776886/Pistol_Squats_yit16i.png',
  },
  {
    level: 'advanced',
    name: 'Ring Dips',
    type: 'dips_ring',
    description: 'Gymnastic ring dips requiring stabilization',
    target_reps: 10,
    calories_per_unit: 1,
    duration_days: 5,
    icon_url:
      'https://res.cloudinary.com/dvhh2li6s/image/upload/v1784776887/Ring_Dips_ip4y7p.png',
  },
];

const masterCardios = [
  {
    level: 'beginner',
    name: 'Light Walking',
    type: 'walking_light',
    description: 'Relaxed walking pace',
    target_distance: 3,
    calories_per_unit: 50,
    duration_days: 5,
    icon_url:
      'https://res.cloudinary.com/dvhh2li6s/image/upload/v1784783732/Light_Walking_nqptse.png',
  },
  {
    level: 'beginner',
    name: 'Light Jogging',
    type: 'jogging_light',
    description: 'Slow pace jogging for beginners',
    target_distance: 3,
    calories_per_unit: 65,
    duration_days: 5,
    icon_url:
      'https://res.cloudinary.com/dvhh2li6s/image/upload/v1784783732/Light_Jogging_gew5zd.png',
  },
  {
    level: 'beginner',
    name: 'Stationary Cycling',
    type: 'cycling_stationary',
    description: 'Indoor easy cycling',
    target_distance: 5,
    calories_per_unit: 40,
    duration_days: 5,
    icon_url:
      'https://res.cloudinary.com/dvhh2li6s/image/upload/v1784783735/Stationary_Cycling_pvrdou.png',
  },
  {
    level: 'beginner',
    name: 'Slow Swimming',
    type: 'swimming_slow',
    description: 'Leisurely swimming pool sessions',
    target_distance: 0.5,
    calories_per_unit: 200,
    duration_days: 3,
    icon_url:
      'https://res.cloudinary.com/dvhh2li6s/image/upload/v1784783735/Slow_Swimming_dg2tm6.png',
  },
  {
    level: 'beginner',
    name: 'Nature Hiking',
    type: 'hiking_easy',
    description: 'Light hiking on flat trails',
    target_distance: 4,
    calories_per_unit: 70,
    duration_days: 5,
    icon_url:
      'https://res.cloudinary.com/dvhh2li6s/image/upload/v1784783734/Nature_Hiking_g6jgww.png',
  },
  {
    level: 'intermediate',
    name: 'Brisk Walking',
    type: 'walking_brisk',
    description: 'Fast paced walking for fat burn',
    target_distance: 8,
    calories_per_unit: 60,
    duration_days: 5,
    icon_url:
      'https://res.cloudinary.com/dvhh2li6s/image/upload/v1784783730/Brisk_Walking_qwhygw.png',
  },
  {
    level: 'intermediate',
    name: '10K Running',
    type: 'running_10k',
    description: 'Standard 10 kilometer run',
    target_distance: 10,
    calories_per_unit: 80,
    duration_days: 5,
    icon_url:
      'https://res.cloudinary.com/dvhh2li6s/image/upload/v1784783730/10K_Running_cfwwcz.png',
  },
  {
    level: 'intermediate',
    name: 'Road Cycling',
    type: 'cycling_road',
    description: 'Moderate pace road cycling',
    target_distance: 15,
    calories_per_unit: 50,
    duration_days: 5,
    icon_url:
      'https://res.cloudinary.com/dvhh2li6s/image/upload/v1784783735/Road_Cycling_hxnjsg.png',
  },
  {
    level: 'intermediate',
    name: 'Freestyle Swimming',
    type: 'swimming_freestyle',
    description: 'Continuous freestyle swimming laps',
    target_distance: 2,
    calories_per_unit: 350,
    duration_days: 3,
    icon_url:
      'https://res.cloudinary.com/dvhh2li6s/image/upload/v1784783730/Freestyle_Swimming_hddwav.png',
  },
  {
    level: 'intermediate',
    name: 'Mountain Climbing',
    type: 'mountain_climbing',
    description: 'Standard mountain trekking',
    target_distance: 10,
    calories_per_unit: 90,
    duration_days: 5,
    icon_url:
      'https://res.cloudinary.com/dvhh2li6s/image/upload/v1784783734/Mountain_Climbing_dqitq4.png',
  },
  {
    level: 'advanced',
    name: 'Race Walking',
    type: 'walking_race',
    description: 'Olympic style race walking',
    target_distance: 15,
    calories_per_unit: 75,
    duration_days: 5,
    icon_url:
      'https://res.cloudinary.com/dvhh2li6s/image/upload/v1784783733/Race_Walking_wpqqh2.png',
  },
  {
    level: 'advanced',
    name: 'Half Marathon',
    type: 'running_marathon',
    description: 'High endurance 21K run',
    target_distance: 21,
    calories_per_unit: 90,
    duration_days: 5,
    icon_url:
      'https://res.cloudinary.com/dvhh2li6s/image/upload/v1784783731/Half_Marathon_te0jlv.png',
  },
  {
    level: 'advanced',
    name: 'Uphill Cycling',
    type: 'cycling_uphill',
    description: 'Intense hill climb cycling',
    target_distance: 25,
    calories_per_unit: 75,
    duration_days: 5,
    icon_url:
      'https://res.cloudinary.com/dvhh2li6s/image/upload/v1784783736/Uphill_Cycling_suspbg.png',
  },
  {
    level: 'advanced',
    name: 'Butterfly Swimming',
    type: 'swimming_butterfly',
    description: 'High intensity butterfly stroke',
    target_distance: 3,
    calories_per_unit: 450,
    duration_days: 3,
    icon_url:
      'https://res.cloudinary.com/dvhh2li6s/image/upload/v1784783730/Butterfly_Swimming_hpewt7.png',
  },
  {
    level: 'advanced',
    name: 'Alpine Climbing',
    type: 'climbing_alpine',
    description: 'Steep terrain mountaineering',
    target_distance: 15,
    calories_per_unit: 120,
    duration_days: 5,
    icon_url:
      'https://res.cloudinary.com/dvhh2li6s/image/upload/v1784783730/Alpine_Climbing_ulsixu.png',
  },
];

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
  console.log('🌱 Mulai seed master exercises dan cardios...');

  await seed(
    'master_exercises',
    [
      'name',
      'type',
      'description',
      'target_reps',
      'calories_per_unit',
      'duration_days',
      'icon_url',
      'level',
    ],
    masterExercises,
  );
  console.log('✅ Master exercises seeded dengan icon Cloudinary!');

  await seed(
    'master_cardios',
    [
      'name',
      'type',
      'description',
      'target_distance',
      'calories_per_unit',
      'duration_days',
      'icon_url',
      'level',
    ],
    masterCardios,
  );
  console.log('✅ Master cardios seeded!');

  console.log('🎉 Seeding selesai!');
} catch (error) {
  console.error('❌ Error saat seeding:', error.message);
} finally {
  await pool.end();
}
