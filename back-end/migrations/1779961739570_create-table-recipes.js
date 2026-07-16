/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable('recipes', {
    // --- IDENTITAS & INFO DASAR ---
    recipe_id: { type: 'integer', primaryKey: true },
    recipe_name: { type: 'text' },
    Description: { type: 'text' },
    RecipeCategory: { type: 'text' },
    Keywords: { type: 'text' },

    // --- BAHAN & INSTRUKSI ---
    RecipeIngredientQuantities: { type: 'text' },
    RecipeIngredientParts: { type: 'text' },
    RecipeInstructions: { type: 'text' },
    RecipeServings: { type: 'real' },
    RecipeYield: { type: 'text' },

    // --- WAKTU (Dalam Menit) ---
    total_time: { type: 'integer' },
    CookTimeMinutes: { type: 'integer' },
    PrepTimeMinutes: { type: 'integer' },

    // --- INFO MEDIA (GAMBAR) ---
    Images: { type: 'text' },
    parsed_image: { type: 'text' },
    image_url: { type: 'text' },
    has_image: { type: 'boolean', default: false },

    // --- KANDUNGAN GIZI UTAMA ---
    calories: { type: 'real' },
    fat: { type: 'real' },
    saturated_fat: { type: 'real' },
    cholesterol: { type: 'real' },
    sodium: { type: 'real' },
    carbs: { type: 'real' },
    fiber: { type: 'real' },
    sugar: { type: 'real' },
    protein: { type: 'real' },

    // --- RASIO & KEPADATAN (DENSITY) ---
    protein_density: { type: 'real' },
    fiber_density: { type: 'real' },
    sugar_density: { type: 'real' },
    sodium_density: { type: 'real' },
    fat_density: { type: 'real' },
    carb_density: { type: 'real' },
    cholesterol_density: { type: 'real' },
    protein_to_carb_ratio: { type: 'real' },
    fiber_to_carb_ratio: { type: 'real' },
    sugar_to_carb_ratio: { type: 'real' },
    satfat_to_fat_ratio: { type: 'real' },
    nutrition_quality_score: { type: 'real' },

    // --- KATEGORI KESEHATAN & FLAGS ---
    calorie_category: { type: 'text' },
    protein_category: { type: 'text' },
    meal_time_category: { type: 'text' },

    weight_loss_friendly: { type: 'boolean', default: false },
    muscle_gain_friendly: { type: 'boolean', default: false },
    diabetes_friendly: { type: 'boolean', default: false },
    hypertension_friendly: { type: 'boolean', default: false },
    heart_healthy: { type: 'boolean', default: false },

    // --- KANDUNGAN ALERGEN ---
    contains_egg: { type: 'boolean', default: false },
    contains_milk: { type: 'boolean', default: false },
    contains_gluten: { type: 'boolean', default: false },
    contains_soy: { type: 'boolean', default: false },
    contains_peanut: { type: 'boolean', default: false },
    contains_seafood: { type: 'boolean', default: false },

    // --- TIMESTAMPS ---
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable('recipes');
};
