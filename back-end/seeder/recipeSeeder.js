import fs from 'fs';
import csv from 'csv-parser';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// GANTI DENGAN KREDENSIAL DATABASE POSTGRESQL ANDA
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Jalur menuju file CSV tim AI Anda
// 1. Meracik ulang __dirname khusus untuk ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Menggabungkan path dengan aman (mundur 2 folder dari seeder ke health-plan-app)
const csvFilePath = path.join(__dirname, 'recipe_features_api.csv');

// Fungsi bantuan agar string "True"/"1" jadi boolean betulan
// Fungsi bantuan agar string "True"/"1" jadi boolean betulan
const parseBool = (value) => {
  if (!value) return false;
  const lowerVal = value.toString().toLowerCase().trim();
  return lowerVal === 'true' || lowerVal === '1';
};

// 1. Fungsi untuk angka desimal (Float) seperti gizi, kalori, porsi
const parseNum = (value) => {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
};

// 2. Fungsi khusus untuk membulatkan waktu memasak menjadi bilangan bulat (Integer)
const parseIntSafe = (value) => {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : Math.round(num);
};
async function runSeeder() {
  const recipes = [];

  console.log('Membaca file CSV... Harap tunggu.');

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      recipes.push(row);
    })
    .on('end', async () => {
      console.log(
        `Berhasil membaca ${recipes.length} baris! Memulai proses insert ke PostgreSQL...`,
      );

      const client = await pool.connect();
      try {
        await client.query('BEGIN'); // Mulai transaksi agar aman

        // Insert satu per satu (bisa dimodifikasi pakai batch insert jika data ratusan ribu)
        for (let i = 0; i < recipes.length; i++) {
          const data = recipes[i];

          const query = `
            INSERT INTO recipes (
              recipe_id, recipe_name, "Description", "RecipeCategory", "Keywords", 
              "RecipeIngredientQuantities", "RecipeIngredientParts", "RecipeInstructions", 
              "RecipeServings", "RecipeYield", total_time, "CookTimeMinutes", "PrepTimeMinutes", 
              "Images", parsed_image, image_url, has_image, 
              calories, fat, saturated_fat, cholesterol, sodium, carbs, fiber, sugar, protein, 
              protein_density, fiber_density, sugar_density, sodium_density, fat_density, 
              carb_density, cholesterol_density, protein_to_carb_ratio, fiber_to_carb_ratio, 
              sugar_to_carb_ratio, satfat_to_fat_ratio, nutrition_quality_score, 
              calorie_category, protein_category, meal_time_category, 
              weight_loss_friendly, muscle_gain_friendly, diabetes_friendly, hypertension_friendly, heart_healthy, 
              contains_egg, contains_milk, contains_gluten, contains_soy, contains_peanut, contains_seafood
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 
              $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, 
              $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44, $45, $46, $47, 
              $48, $49, $50, $51, $52
            ) ON CONFLICT (recipe_id) DO NOTHING;
          `;

          const values = [
            data.recipe_id,
            data.recipe_name,
            data.Description,
            data.RecipeCategory,
            data.Keywords,
            data.RecipeIngredientQuantities,
            data.RecipeIngredientParts,
            data.RecipeInstructions,
            parseNum(data.RecipeServings),
            data.RecipeYield,

            // --- INI YANG DIUBAH (Gunakan parseIntSafe) ---
            parseIntSafe(data.total_time),
            parseIntSafe(data.CookTimeMinutes),
            parseIntSafe(data.PrepTimeMinutes),
            // ----------------------------------------------

            data.Images,
            data.parsed_image,
            data.image_url ||
              'https://via.placeholder.com/300x200?text=No+Image',
            parseBool(data.has_image),
            parseNum(data.calories),
            parseNum(data.fat),
            parseNum(data.saturated_fat),
            parseNum(data.cholesterol),
            parseNum(data.sodium),
            parseNum(data.carbs),
            parseNum(data.fiber),
            parseNum(data.sugar),
            parseNum(data.protein),
            parseNum(data.protein_density),
            parseNum(data.fiber_density),
            parseNum(data.sugar_density),
            parseNum(data.sodium_density),
            parseNum(data.fat_density),
            parseNum(data.carb_density),
            parseNum(data.cholesterol_density),
            parseNum(data.protein_to_carb_ratio),
            parseNum(data.fiber_to_carb_ratio),
            parseNum(data.sugar_to_carb_ratio),
            parseNum(data.satfat_to_fat_ratio),
            parseNum(data.nutrition_quality_score),
            data.calorie_category,
            data.protein_category,
            data.meal_time_category,
            parseBool(data.weight_loss_friendly),
            parseBool(data.muscle_gain_friendly),
            parseBool(data.diabetes_friendly),
            parseBool(data.hypertension_friendly),
            parseBool(data.heart_healthy),
            parseBool(data.contains_egg),
            parseBool(data.contains_milk),
            parseBool(data.contains_gluten),
            parseBool(data.contains_soy),
            parseBool(data.contains_peanut),
            parseBool(data.contains_seafood),
          ];

          await client.query(query, values);

          // Agar Anda tahu prosesnya berjalan
          if ((i + 1) % 500 === 0) {
            console.log(`Telah memasukkan ${i + 1} resep...`);
          }
        }

        await client.query('COMMIT');
        console.log(
          'Seeding selesai 100%! Data resep sudah masuk semua ke PostgreSQL. 🚀',
        );
      } catch (error) {
        await client.query('ROLLBACK'); // Batalkan jika ada yang error
        console.error('Terjadi kesalahan saat memasukkan data:', error);
      } finally {
        client.release();
        pool.end();
      }
    });
}

runSeeder();
