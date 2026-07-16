import ast
import re
import tensorflow as tf
import pandas as pd

from app.preprocess import (
    preprocess_for_inference
)


@tf.keras.utils.register_keras_serializable()
class FeatureCrossLayer(
    tf.keras.layers.Layer
):

    def call(
        self,
        inputs
    ):

        user_vec, recipe_vec = inputs

        cross = tf.multiply(
            user_vec,
            recipe_vec
        )

        return tf.concat(
            [
                user_vec,
                recipe_vec,
                cross
            ],
            axis=-1
        )

# =========================================================
# MODEL PATH
# =========================================================

MODEL_PATH = (
    "app/artifacts/best_model.keras"
)

model = tf.keras.models.load_model(
    MODEL_PATH,
    custom_objects={
        "FeatureCrossLayer":
            FeatureCrossLayer
    }
)


# =========================================================
# HELPER: PARSING STRING TO ARRAY (CLEANER)
# =========================================================

def safe_parse_list(val):
    if not val or pd.isna(val): 
        return []
        
    val_str = str(val).strip()
    
    # 1. Jika formatnya dari R: c("item1", "item2")
    if val_str.startswith('c(') and val_str.endswith(')'):
        items = re.findall(r'"([^"]*)"', val_str)
        return [item.strip() for item in items if item.strip()]
        
    # 2. Jika formatnya Python list standar: ['item1', 'item2']
    if val_str.startswith('[') and val_str.endswith(']'):
        try:
            return ast.literal_eval(val_str)
        except:
            pass
            
    # 3. Jika teks biasa
    return [val_str]


# =========================================================
# EXTRACT FIRST IMAGE
# =========================================================

def extract_first_image(
    image_text
):

    if pd.isna(image_text):

        return None

    urls = re.findall(
        r'https://[^\s,"\)]+',
        str(image_text)
    )

    return (
        urls[0]
        if urls
        else None
    )


# =========================================================
# NUTRITION SUMMARY
# =========================================================

def build_nutrition_summary(
    row
):

    return (

        f"Calories: {round(row['calories'], 2)} kcal | "

        f"Protein: {round(row['protein'], 2)} g | "

        f"Carbs: {round(row['carbs'], 2)} g | "

        f"Fat: {round(row['fat'], 2)} g | "

        f"Fiber: {round(row['fiber'], 2)} g"
    )


# =========================================================
# RECOMMENDATION REASON
# =========================================================

def build_recommendation_reason(
    row
):

    reasons = []

    # High Protein
    if row.get(
        "protein", 0
    ) >= 20:

        reasons.append(
            "High Protein"
        )

    # High Fiber
    if row.get(
        "fiber", 0
    ) >= 8:

        reasons.append(
            "High Fiber"
        )

    # Low Sugar
    if row.get(
        "sugar", 999
    ) <= 5:

        reasons.append(
            "Low Sugar"
        )

    # Low Sodium
    if row.get(
        "sodium", 9999
    ) <= 500:

        reasons.append(
            "Low Sodium"
        )

    # Low Calorie
    if row.get(
        "calories", 9999
    ) <= 400:

        reasons.append(
            "Low Calorie"
        )

    if len(reasons) == 0:

        return (
            "Balanced Nutrition"
        )

    return ", ".join(reasons)


# =========================================================
# MAIN PREDICTION FUNCTION
# =========================================================

def recommend_recipes(
    user_dict,
    top_k=10
):

    # =====================================================
    # PREPROCESS
    # =====================================================

    (
        X_user,
        X_recipe,
        filtered_recipe_df
    ) = preprocess_for_inference(
        user_dict
    )

    # =====================================================
    # EMPTY CHECK
    # =====================================================

    if (
        X_user is None
        or X_recipe is None
        or len(filtered_recipe_df) == 0
    ):

        return []

    # =====================================================
    # MODEL PREDICTION
    # =====================================================

    predictions = model.predict(
        [
            X_user,
            X_recipe
        ],
        verbose=0
    ).flatten()

    # =====================================================
    # CLIP SIGMOID OUTPUT
    # =====================================================

    predictions = predictions.clip(
        0,
        1
    )

    # =====================================================
    # SAVE SCORES
    # =====================================================

    result_df = (
        filtered_recipe_df.copy()
    )

    result_df[
        "recommendation_score"
    ] = predictions

    # =====================================================
    # SORT TOP K
    # =====================================================

    result_df = (
        result_df
        .sort_values(
            by="recommendation_score",
            ascending=False
        )
        .head(top_k)
        .reset_index(drop=True)
    )

    # =====================================================
    # BUILD JSON RESPONSE (MODIFIED FOR REACT FRONTEND)
    # =====================================================

    response = []

    for _, row in result_df.iterrows():
        
        # Bersihkan array kotor dari dataset R/Python
        parts = safe_parse_list(row.get('RecipeIngredientParts'))
        quants = safe_parse_list(row.get('RecipeIngredientQuantities'))
        ingredients = []
        for i in range(max(len(parts), len(quants))):
            q = quants[i] if i < len(quants) else ""
            p = parts[i] if i < len(parts) else ""
            ingredients.append(f"{q} {p}".strip())
            
        if not ingredients:
            ingredients = parts
            
        steps = safe_parse_list(row.get('RecipeInstructions'))
        reason = build_recommendation_reason(row)

        recipe_json = {
            "id": str(int(row["recipe_id"])),
            "name": row.get("recipe_name", "Unknown Recipe"),
            "emoji": "🍽️",
            "image_url": extract_first_image(row.get("image_url")) if row.get("image_url") else None,
            "recommendation_score": round(float(row["recommendation_score"]), 4),
            "cuisine_type": row.get("RecipeCategory", "Balanced"),
            "health_tag": reason,
            "main_protein_source": "Mixed",
            "servings": float(row.get("RecipeServings", 1)),
            "total_time": float(row.get("total_time", row.get("CookTimeMinutes", 0) + row.get("PrepTimeMinutes", 0))),
            "description": row.get("Description", "A nutritious meal recommended by your AI plan."),
            
            # Struktur Bersarang untuk React UI
            "nutrition": {
                "calories": round(float(row.get("calories", 0))),
                "protein": round(float(row.get("protein", 0))),
                "fat": round(float(row.get("fat", 0))),
                "carbs": round(float(row.get("carbs", 0))),
                "fiber": round(float(row.get("fiber", 0))),
                "sugar": round(float(row.get("sugar", 0))),
                "sodium": round(float(row.get("sodium", 0))),
                "cholesterol": round(float(row.get("cholesterol", 0)))
            },
            
            # Flags Allergen jika dibutuhkan frontend
            "contains_egg": int(row.get('contains_egg', 0) or 0),
            "contains_milk": int(row.get('contains_milk', 0) or 0),
            "contains_gluten": int(row.get('contains_gluten', 0) or 0),
            "contains_soy": int(row.get('contains_soy', 0) or 0),
            "contains_peanut": int(row.get('contains_peanut', 0) or 0),
            "contains_seafood": int(row.get('contains_seafood', 0) or 0),
            
            "recipe": {
                "description": row.get('Description', ''),
                "ingredients": ingredients if ingredients else ["Recipe details unavailable"],
                "steps": steps if steps else ["Follow standard preparations"]
            },
            
            # Mempertahankan field bawaan temanmu sebagai cadangan kompatibilitas
            "nutrition_summary": build_nutrition_summary(row),
            "recommendation_reason": reason
        }

        response.append(recipe_json)

    return response