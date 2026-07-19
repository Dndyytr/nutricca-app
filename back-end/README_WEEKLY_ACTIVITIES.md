# Weekly Activities Refactor - Architecture Documentation

## Overview

Refactored weekly activities system yang memungkinkan user untuk:
- Memilih level exercise mereka sendiri (beginner, intermediate, advanced)
- Memilih jenis exercise dan cardio sesuai keinginan
- Track progress harian untuk setiap activity dengan **auto-calculated calories burned**
- Kalkulasi total kalori untuk dashboard

## Key Features

✅ **Calories Per Unit Tracking**
- Master exercises: calories_per_unit (per repetisi)
- Master cardios: calories_per_unit (per KM)

✅ **Auto-Calculated Calories Burned**
- Saat create/update activity_progress, kalori otomatis dihitung:
  - Exercise: `calories_burned = reps_done × exercise.calories_per_unit`
  - Cardio: `calories_burned = distance_done × cardio.calories_per_unit`

✅ **Total Calories Summary**
- Get progress endpoint mengembalikan `total_calories_burned` dari semua completed activities
- Siap untuk dashboard calculation

✅ **Consistent Code Structure**
- controller / repositories / validator / routes pattern
- Sesuai dengan service lainnya (users, recipes, daily_logs)

## Database Schema

### Master Exercises
```sql
CREATE TABLE master_exercises (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(100) NOT NULL,
  icon_url VARCHAR(500),
  description TEXT,
  target_reps INT,
  calories_per_unit FLOAT NOT NULL DEFAULT 0,  -- NEW: per reps
  duration_days INT DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Master Cardios
```sql
CREATE TABLE master_cardios (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(100) NOT NULL,
  icon_url VARCHAR(500),
  description TEXT,
  target_distance FLOAT,
  calories_per_unit FLOAT NOT NULL DEFAULT 0,  -- NEW: per KM
  duration_days INT DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Activity Progress
```sql
CREATE TABLE activity_progress (
  id SERIAL PRIMARY KEY,
  user_activity_id INT NOT NULL REFERENCES user_weekly_activities(id),
  exercise_id INT REFERENCES master_exercises(id),
  cardio_id INT REFERENCES master_cardios(id),
  day_of_week INT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  reps_done INT,
  distance_done FLOAT,
  calories_burned FLOAT DEFAULT 0,  -- NEW: auto-calculated
  notes TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Seeded Data with Calories

### Exercises
- Push up: 0.5 cal/rep
- Pull up: 0.8 cal/rep
- Plank: 5 cal/set
- Squats: 0.3 cal/rep
- Dips: 0.6 cal/rep

### Cardios
- Running: 80 cal/km
- Walking: 60 cal/km
- Mountain Climbing: 90 cal/km
- Cycling: 50 cal/km
- Swimming: 350 cal/km

## API Endpoints

### Get Activity Progress (dengan total kalori)
```
GET /api/v1/weekly-activities/:activity_id/progress

Response:
{
  "status": "success",
  "message": "Activity progress retrieved successfully",
  "data": {
    "progress": [
      {
        "id": 1,
        "day_of_week": 0,
        "completed": true,
        "reps_done": 20,
        "calories_burned": 10,  // 20 reps × 0.5 cal/rep
        "type": "exercise",
        "item_name": "Push up",
        "icon_url": "https://..."
      },
      {
        "id": 2,
        "day_of_week": 1,
        "completed": true,
        "distance_done": 12,
        "calories_burned": 960,  // 12 km × 80 cal/km
        "type": "cardio",
        "item_name": "Running",
        "icon_url": "https://..."
      }
    ],
    "summary": {
      "total_calories_burned": 970  // Total dari semua completed
    }
  }
}
```

### Create Activity Progress (auto-calculate kalori)
```
POST /api/v1/weekly-activities/:activity_id/progress

Request:
{
  "exercise_id": 1,
  "day_of_week": 0,
  "completed": true,
  "reps_done": 20
}

Response:
{
  "status": "success",
  "message": "Activity progress created successfully",
  "data": {
    "progress": {
      "id": 1,
      "user_activity_id": 10,
      "exercise_id": 1,
      "day_of_week": 0,
      "completed": true,
      "reps_done": 20,
      "calories_burned": 10,  // Auto-calculated!
      "updated_at": "2024-10-21T14:30:00Z"
    }
  }
}
```

### Update Activity Progress (recalculate kalori)
```
PUT /api/v1/weekly-activities/progress/:progress_id

Request:
{
  "reps_done": 25,
  "completed": true
}

Response: (calories_burned akan di-recalculate menjadi 25 × 0.5 = 12.5)
```

## Setup Instructions

### 1. Run Migration
```bash
npm run migrate up
```

### 2. Seed Master Data dengan Calories
```bash
node seeder/masterExercisesAndCardiosSeeder.js
```

### 3. Update Icon URLs (Optional)
```bash
node seeder/updateIconUrls.js
```

## Dashboard Integration

Untuk dashboard, bisa langsung ambil:
```javascript
// Total calories burned dari weekly activity
GET /api/v1/weekly-activities/:activity_id/progress
// Ambil `data.summary.total_calories_burned`

// Total calories in dari daily_logs (sudah ada)
GET /api/v1/daily-logs?date=YYYY-MM-DD
// Ambil `data.dailyLog.total_calories_in`

// Hitung deficit/surplus
const calorieBalance = totalCaloriesIn - totalCaloriesBurned;
```

## File Structure

```
back-end/
├── migrations/
│   └── 1726923600000_create_master_exercises_and_cardios.js
├── seeder/
│   ├── masterExercisesAndCardiosSeeder.js
│   └── updateIconUrls.js
└── src/
    └── services/
        └── weekly_activities/
            ├── controller/
            │   └── index.js
            ├── repositories/
            │   ├── master_exercises.js
            │   ├── master_cardios.js
            │   ├── user_weekly_activities.js
            │   └── activity_progress.js
            ├── validator/
            │   └── index.js
            └── routes/
                └── index.js
```
