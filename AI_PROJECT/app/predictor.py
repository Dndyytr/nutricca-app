import re
import joblib
import pandas as pd
import tensorflow as tf
from sklearn.preprocessing import MinMaxScaler


MODEL_PATH = "artifacts/recipe_recommender.keras"
SCALER_PATH = "artifacts/feature_scaler.pkl"
FEATURE_ORDER_PATH = "artifacts/feature_order.pkl"
RECIPE_PATH = "artifacts/recipe_features.csv"


# =========================
# LOAD ARTIFACTS
# =========================
model = tf.keras.models.load_model(MODEL_PATH)

scaler = joblib.load(SCALER_PATH)

feature_order = joblib.load(FEATURE_ORDER_PATH)

recipe_fe = pd.read_csv(RECIPE_PATH)


# =========================
# USER FEATURES
# =========================
USER_COLS = [
    col for col in feature_order
    if not col.startswith("recipe_")
]


# =========================
# RECIPE FEATURE MAPPING
# =========================
RECIPE_MAPPING = {
    "calories": "recipe_calories",
    "protein": "recipe_protein",
    "fat": "recipe_fat",
    "carbs": "recipe_carbs",
    "fiber": "recipe_fiber",
    "sugar": "recipe_sugar",
    "sodium": "recipe_sodium",
    "protein_density": "recipe_protein_density",
    "fiber_density": "recipe_fiber_density",
    "sugar_density": "recipe_sugar_density",
    "sodium_density": "recipe_sodium_density",
    "nutrition_quality_score":
        "recipe_nutrition_quality_score"
}


# =========================
# RECIPE COLUMNS
# =========================
RECIPE_COLS = list(RECIPE_MAPPING.values())


# =========================
# EXTRACT IMAGE
# =========================
def extract_first_image(image_text):

    if pd.isna(image_text):
        return None

    urls = re.findall(
        r'https://[^\s,"\)]+',
        str(image_text)
    )

    return urls[0] if urls else None


# =========================
# RECOMMENDATION FUNCTION
# =========================
def recommend(user_dict, top_k=10):

    # -------------------------
    # USER INPUT
    # -------------------------
    user_df = pd.DataFrame([user_dict])

    user_df = user_df.reindex(
        columns=USER_COLS,
        fill_value=0
    )

    # -------------------------
    # RECIPE FEATURES
    # -------------------------
    recipe_df = recipe_fe[
        list(RECIPE_MAPPING.keys())
    ].rename(
        columns=RECIPE_MAPPING
    )

    recipe_df = recipe_df.reindex(
        columns=RECIPE_COLS,
        fill_value=0
    )

    # -------------------------
    # REPEAT USER DATA
    # -------------------------
    repeated_user = pd.concat(
        [user_df] * len(recipe_df),
        ignore_index=True
    )

    # -------------------------
    # COMBINE
    # -------------------------
    combined = pd.concat(
        [repeated_user, recipe_df],
        axis=1
    )

    # -------------------------
    # SCALING
    # -------------------------
    numeric_cols = scaler.feature_names_in_

    combined[numeric_cols] = scaler.transform(
        combined[numeric_cols]
    )

    # -------------------------
    # SPLIT MODEL INPUT
    # -------------------------
    X_user = combined[USER_COLS]

    X_recipe = combined[RECIPE_COLS]

    # -------------------------
    # PREDICTION
    # -------------------------
    probs = model.predict(
        [X_user, X_recipe],
        verbose=0
    ).flatten()

    # COPY FULL RECIPE DATA
    result = recipe_fe.copy()

    # NORMALISASI AI SCORE
    result["ai_score"] = probs

    # NORMALISASI NUTRITION SCORE
    nutrition_scaler = MinMaxScaler()

    result["nutrition_score_normalized"] = nutrition_scaler.fit_transform(
        result[["nutrition_quality_score"]]
    )

    # HYBRID FINAL SCORE
    result["recommendation_probability"] = (
        result["ai_score"] * 0.4
        +
        result["nutrition_score_normalized"] * 0.6
    )
    

    # SORT TOP RECOMMENDATION
    top_recipes = result.nlargest(
        top_k,
        "recommendation_probability"
    )

    # -------------------------
    # RESPONSE
    # -------------------------
    response = []

    for _, row in top_recipes.iterrows():

        response.append({

            "recipe_id":
                int(row["recipe_id"]),

            "recipe_name":
                row["recipe_name"],

            # HASIL MODEL PREDICTION
            "recommendation_probability":
                round(
                    float(
                        row[
                            "recommendation_probability"
                        ]
                    ),
                    10
                ),

            "image":
                extract_first_image(
                    row.get("Images")
                ),

            "description":
                row.get("Description"),

            "category":
                row.get("RecipeCategory"),

            "keywords":
                row.get("Keywords"),

            "ingredients":
                row.get(
                    "RecipeIngredientParts"
                ),

            "instructions":
                row.get(
                    "RecipeInstructions"
                ),

            "servings":
                int(row["RecipeServings"])
                if pd.notna(
                    row.get("RecipeServings")
                )
                else None,

            "total_time":
                float(row["total_time"])
                if pd.notna(
                    row.get("total_time")
                )
                else None,

            "prep_time":
                float(
                    row["PrepTimeMinutes"]
                )
                if pd.notna(
                    row.get("PrepTimeMinutes")
                )
                else None,

            "cook_time":
                float(
                    row["CookTimeMinutes"]
                )
                if pd.notna(
                    row.get("CookTimeMinutes")
                )
                else None,

            "nutrition": {

                "calories":
                    float(row["calories"]),

                "protein":
                    float(row["protein"]),

                "fat":
                    float(row["fat"]),

                "saturated_fat":
                    float(
                        row["saturated_fat"]
                    ),

                "carbs":
                    float(row["carbs"]),

                "fiber":
                    float(row["fiber"]),

                "sugar":
                    float(row["sugar"]),

                "sodium":
                    float(row["sodium"]),

                "cholesterol":
                    float(
                        row["cholesterol"]
                    )
            },

            "nutrition_quality_score":
                float(
                    row[
                        "nutrition_quality_score"
                    ]
                )
        })

    return response