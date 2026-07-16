from fastapi import FastAPI
from pydantic import BaseModel
from pydantic import BaseModel, Field
import tensorflow as tf
import pandas as pd
import numpy as np
import joblib

recipes_df = pd.read_csv("recipe_features_api.csv")

print(recipes_df.columns.tolist())

# =========================================
# CUSTOM LAYER
# =========================================

@tf.keras.utils.register_keras_serializable()
class FeatureCrossLayer(tf.keras.layers.Layer):

    def __init__(self, **kwargs):
        super(FeatureCrossLayer, self).__init__(**kwargs)

    def call(self, inputs):

        x1, x2 = inputs

        cross = x1 * x2

        return tf.concat(
            [x1, x2, cross],
            axis=-1
        )



# =========================================
# LOAD MODEL & PREPROCESSING FILES
# =========================================

model = tf.keras.models.load_model(
    "best_model.keras",
    custom_objects={
        "FeatureCrossLayer": FeatureCrossLayer
    }
)

scaler = joblib.load("feature_scaler.pkl")
feature_order = joblib.load("feature_order.pkl")
scale_cols = joblib.load("scale_cols.pkl")

# =========================================
# FASTAPI
# =========================================

app = FastAPI(
    title="Health Recommendation API",
    description="API untuk rekomendasi makanan sehat",
    version="1.0"
)

# =========================================
# INPUT SCHEMA
# =========================================

class RecommendationInput(BaseModel):

    # =====================================
    # USER FEATURES
    # =====================================

    model_config = {
    "populate_by_name": True
}

    age: float
    height: float
    BMI: float
    blood_pressure_systolic: float
    blood_pressure_diastolic: float
    heart_rate: float
    daily_water_intake_goal: float
    avg_sleep_hours: float
    target_weight_kg: float
    TDEE: float

    activity_score: float
    water_ml_per_kg: float
    calorie_gap: float
    calorie_target_ratio: float
    target_weight_change: float
    target_weight_change_pct: float
    health_risk_score: float
    healthy_lifestyle_score: float

    activity_level_encoded: float
    sleep_quality_encoded: float
    bmi_category_encoded: float
    bp_category_encoded: float
    age_group_encoded: float

    has_diabetes: int
    has_hypertension: int
    has_asthma: int
    has_high_cholesterol: int
    no_medical_history: int

    allergy_Egg: int
    allergy_Gluten: int
    allergy_Milk: int
    allergy_No_Allergy: int = Field(alias="allergy_No Allergy") 
    allergy_Peanut: int
    allergy_Seafood: int
    allergy_Soy: int

    primary_goal_Healthy_Lifestyle: int = Field(alias="primary_goal_Healthy Lifestyle")
    primary_goal_Maintenance: int
    primary_goal_Muscle_Gain: int = Field(alias="primary_goal_Muscle Gain")
    primary_goal_Weight_Loss: int = Field(alias="primary_goal_Weight Loss")

    dietary_restriction_Balanced: int
    dietary_restriction_High_Protein: int = Field(alias="dietary_restriction_High Protein")
    dietary_restriction_Low_Calorie: int = Field(alias="dietary_restriction_Low Calorie")
    dietary_restriction_Low_Sodium: int = Field(alias="dietary_restriction_Low Sodium")
    dietary_restriction_Low_Sugar: int = Field(alias="dietary_restriction_Low Sugar")


# =========================================
# FEATURE LIST
# =========================================

user_cols = [

    "age",
    "height",
    "BMI",
    "blood_pressure_systolic",
    "blood_pressure_diastolic",
    "heart_rate",
    "daily_water_intake_goal",
    "avg_sleep_hours",
    "target_weight_kg",
    "TDEE",

    "activity_score",
    "water_ml_per_kg",
    "calorie_gap",
    "calorie_target_ratio",
    "target_weight_change",
    "target_weight_change_pct",
    "health_risk_score",
    "healthy_lifestyle_score",

    "activity_level_encoded",
    "sleep_quality_encoded",
    "bmi_category_encoded",
    "bp_category_encoded",
    "age_group_encoded",

    "has_diabetes",
    "has_hypertension",
    "has_asthma",
    "has_high_cholesterol",
    "no_medical_history",

    "allergy_Egg",
    "allergy_Gluten",
    "allergy_Milk",
    "allergy_No Allergy",
    "allergy_Peanut",
    "allergy_Seafood",
    "allergy_Soy",

    "primary_goal_Healthy Lifestyle",
    "primary_goal_Maintenance",
    "primary_goal_Muscle Gain",
    "primary_goal_Weight Loss",

    "dietary_restriction_Balanced",
    "dietary_restriction_High Protein",
    "dietary_restriction_Low Calorie",
    "dietary_restriction_Low Sodium",
    "dietary_restriction_Low Sugar",
]

recipe_cols = [

    "recipe_calories",
    "recipe_protein",
    "recipe_fat",
    "recipe_carbs",
    "recipe_fiber",
    "recipe_sugar",
    "recipe_sodium",

    "recipe_protein_density",
    "recipe_fiber_density",
    "recipe_sugar_density",
    "recipe_sodium_density",

    "recipe_protein_to_carb_ratio",
    "recipe_fiber_to_carb_ratio",
    "recipe_sugar_to_carb_ratio",
    "recipe_satfat_to_fat_ratio",

    "recipe_contains_egg",
    "recipe_contains_milk",
    "recipe_contains_gluten",
    "recipe_contains_soy",
    "recipe_contains_peanut",
    "recipe_contains_seafood",
]

@app.get("/")
def home():
    return {
        "message": "Health Recommendation API Running"
    }

# =========================================
# ROOT
# =========================================

@app.post("/predict")
def predict(data: RecommendationInput):

    try:

        # =================================
        # USER INPUT
        # =================================

        input_dict = data.model_dump(by_alias=True)

        # =================================
        # BUILD ALL DATA
        # =================================

        all_rows = []

        for _, recipe in recipes_df.iterrows():

            combined_data = {

                **input_dict,

                "recipe_calories": recipe["calories"],
                "recipe_protein": recipe["protein"],
                "recipe_fat": recipe["fat"],
                "recipe_carbs": recipe["carbs"],
                "recipe_fiber": recipe["fiber"],
                "recipe_sugar": recipe["sugar"],
                "recipe_sodium": recipe["sodium"],

                "recipe_protein_density": recipe["protein_density"],
                "recipe_fiber_density": recipe["fiber_density"],
                "recipe_sugar_density": recipe["sugar_density"],
                "recipe_sodium_density": recipe["sodium_density"],

                "recipe_protein_to_carb_ratio": recipe["protein_to_carb_ratio"],
                "recipe_fiber_to_carb_ratio": recipe["fiber_to_carb_ratio"],
                "recipe_sugar_to_carb_ratio": recipe["sugar_to_carb_ratio"],
                "recipe_satfat_to_fat_ratio": recipe["satfat_to_fat_ratio"],

                "recipe_contains_egg": recipe["contains_egg"],
                "recipe_contains_milk": recipe["contains_milk"],
                "recipe_contains_gluten": recipe["contains_gluten"],
                "recipe_contains_soy": recipe["contains_soy"],
                "recipe_contains_peanut": recipe["contains_peanut"],
                "recipe_contains_seafood": recipe["contains_seafood"],
            }

            all_rows.append(combined_data)

        # =================================
        # DATAFRAME
        # =================================

        df = pd.DataFrame(all_rows)

        # =================================
        # FEATURE ORDER
        # =================================

        for col in feature_order:
            if col not in df.columns:
                df[col] = 0

        df = df[feature_order]

        # =================================
        # SCALING
        # =================================

        scale_existing_cols = [
            col for col in scale_cols
            if col in df.columns
        ]

        df[scale_existing_cols] = scaler.transform(
            df[scale_existing_cols]
        )

        # =================================
        # SPLIT INPUT
        # =================================

        X_user = df[user_cols].values.astype(np.float32)
        X_recipe = df[recipe_cols].values.astype(np.float32)

        # =================================
        # BATCH PREDICTION
        # =================================

        predictions = model.predict(
            [X_user, X_recipe],
            verbose=0
        )

        # =================================
        # BUILD RESULTS
        # =================================

        recommendations = []

        for idx, (_, recipe) in enumerate(recipes_df.iterrows()):

            score = float(predictions[idx][0])

            # =====================================================
            # RECOMMENDATION REASON
            # =====================================================

            reasons = []

            if recipe.get("fiber", 0) >= 8:
                reasons.append("High Fiber")

            if recipe.get("protein", 0) >= 20:
                reasons.append("High Protein")

            if recipe.get("sugar", 999) <= 5:
                reasons.append("Low Sugar")

            if recipe.get("calories", 9999) <= 400:
                reasons.append("Low Calorie")

            if recipe.get("sodium", 9999) <= 500:
                reasons.append("Low Sodium")

            recommendation_reason = ", ".join(reasons)

            

            recommendations.append({

                "recipe_id": int(recipe["recipe_id"]),
                "recipe_name": recipe["recipe_name"],
                "recommendation_score": score,
                "recommendation_reason": recommendation_reason,

                "nutrition_summary":
                    f"Calories: {recipe['calories']} kcal | "
                    f"Protein: {recipe['protein']} g | "
                    f"Carbs: {recipe['carbs']} g",

                "calories": float(recipe["calories"]),
                "protein": float(recipe["protein"]),
                "fat": float(recipe["fat"]),
                "carbs": float(recipe["carbs"]),
                "fiber": float(recipe["fiber"]),
                "sugar": float(recipe["sugar"]),
                "sodium": float(recipe["sodium"]),
                "cholesterol": float(recipe["cholesterol"]),

                "total_time": recipe["total_time"],
                "Description": recipe["Description"],
                "RecipeIngredientParts": recipe["RecipeIngredientParts"],
                "RecipeInstructions": recipe["RecipeInstructions"],

                "image_url": recipe["image_url"]
            })

        # =================================
        # SORT TOP 10
        # =================================

        recommendations = sorted(
            recommendations,
            key=lambda x: x["recommendation_score"],
            reverse=True
        )

        return {
            "success": True,
            "total_recommendations": len(recommendations),
            "recommendations": recommendations[:10]
        }

    except Exception as e:

        import traceback

        return {
            "success": False,
            "error": str(e),
            "trace": traceback.format_exc()
        }