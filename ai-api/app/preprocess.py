# preprocess.py

import joblib
import numpy as np
import pandas as pd


# =========================================================
# ARTIFACT PATHS
# =========================================================

FEATURE_ORDER_PATH = (
    "app/artifacts/feature_order.pkl"
)

SCALER_PATH = (
    "app/artifacts/feature_scaler.pkl"
)

SCALE_COLS_PATH = (
    "app/artifacts/scale_cols.pkl"
)

RECIPE_PATH = (
    "app/artifacts/recipe_features_api.csv"
)


# =========================================================
# LOAD ARTIFACTS
# =========================================================

feature_order = joblib.load(
    FEATURE_ORDER_PATH
)

scaler = joblib.load(
    SCALER_PATH
)

scale_cols = joblib.load(
    SCALE_COLS_PATH
)

recipe_df = pd.read_csv(
    RECIPE_PATH
)


# =========================================================
# USER / RECIPE FEATURES
# =========================================================

user_cols = [

    col for col in feature_order

    if not col.startswith("recipe_")
]

recipe_cols = [

    col for col in feature_order

    if col.startswith("recipe_")
]


# =========================================================
# RECIPE FEATURE MAPPING
# RAW CSV -> MODEL FEATURE
# =========================================================

RECIPE_MAPPING = {

    # Nutrition
    "calories":
        "recipe_calories",

    "protein":
        "recipe_protein",

    "fat":
        "recipe_fat",

    "carbs":
        "recipe_carbs",

    "fiber":
        "recipe_fiber",

    "sugar":
        "recipe_sugar",

    "sodium":
        "recipe_sodium",

    # Density
    "protein_density":
        "recipe_protein_density",

    "fiber_density":
        "recipe_fiber_density",

    "sugar_density":
        "recipe_sugar_density",

    "sodium_density":
        "recipe_sodium_density",

    # Ratio
    "protein_to_carb_ratio":
        "recipe_protein_to_carb_ratio",

    "fiber_to_carb_ratio":
        "recipe_fiber_to_carb_ratio",

    "sugar_to_carb_ratio":
        "recipe_sugar_to_carb_ratio",

    "satfat_to_fat_ratio":
        "recipe_satfat_to_fat_ratio",

    # Allergens
    "contains_egg":
        "recipe_contains_egg",

    "contains_milk":
        "recipe_contains_milk",

    "contains_gluten":
        "recipe_contains_gluten",

    "contains_soy":
        "recipe_contains_soy",

    "contains_peanut":
        "recipe_contains_peanut",

    "contains_seafood":
        "recipe_contains_seafood",
}


# =========================================================
# FILTER RECIPES
# =========================================================

def filter_recipes(
    recipes_df,
    user_profile
):

    filtered_df = recipes_df.copy()

    # =====================================================
    # ALLERGY FILTERING
    # =====================================================

    allergy_map = {

        "allergy_Egg":
            "contains_egg",

        "allergy_Gluten":
            "contains_gluten",

        "allergy_Milk":
            "contains_milk",

        "allergy_Peanut":
            "contains_peanut",

        "allergy_Seafood":
            "contains_seafood",

        "allergy_Soy":
            "contains_soy",
    }

    for user_col, recipe_col in allergy_map.items():

        if user_profile.get(user_col, 0) == 1:

            filtered_df = (
                filtered_df[
                    filtered_df[
                        recipe_col
                    ] == 0
                ]
            )

    # =====================================================
    # MEDICAL FILTERING
    # =====================================================

    # Diabetes
    if user_profile.get(
        "has_diabetes", 0
    ) == 1:

        filtered_df = (
            filtered_df[
                filtered_df[
                    "diabetes_friendly"
                ] == 1
            ]
        )

    # Hypertension
    if user_profile.get(
        "has_hypertension", 0
    ) == 1:

        filtered_df = (
            filtered_df[
                filtered_df[
                    "hypertension_friendly"
                ] == 1
            ]
        )

    # Heart Health
    if user_profile.get(
        "has_high_cholesterol", 0
    ) == 1:

        filtered_df = (
            filtered_df[
                filtered_df[
                    "heart_healthy"
                ] == 1
            ]
        )

    # =====================================================
    # PRIMARY GOAL FILTERING
    # =====================================================

    # Weight Loss
    if user_profile.get(
        "primary_goal_Weight Loss", 0
    ) == 1:

        filtered_df = (
            filtered_df[
                filtered_df[
                    "weight_loss_friendly"
                ] == 1
            ]
        )

    # Muscle Gain
    if user_profile.get(
        "primary_goal_Muscle Gain", 0
    ) == 1:

        filtered_df = (
            filtered_df[
                filtered_df[
                    "muscle_gain_friendly"
                ] == 1
            ]
        )

    # =====================================================
    # DIETARY RESTRICTION FILTERING
    # =====================================================

    # Low Sugar
    if user_profile.get(
        "dietary_restriction_Low Sugar", 0
    ) == 1:

        filtered_df = (
            filtered_df[
                filtered_df[
                    "diabetes_friendly"
                ] == 1
            ]
        )

    # Low Sodium
    if user_profile.get(
        "dietary_restriction_Low Sodium", 0
    ) == 1:

        filtered_df = (
            filtered_df[
                filtered_df[
                    "hypertension_friendly"
                ] == 1
            ]
        )

    # High Protein
    if user_profile.get(
        "dietary_restriction_High Protein", 0
    ) == 1:

        filtered_df = (
            filtered_df[
                filtered_df[
                    "muscle_gain_friendly"
                ] == 1
            ]
        )

    # Low Calorie
    if user_profile.get(
        "dietary_restriction_Low Calorie", 0
    ) == 1:

        filtered_df = (
            filtered_df[
                filtered_df[
                    "weight_loss_friendly"
                ] == 1
            ]
        )

    return filtered_df


# =========================================================
# PREPROCESS FUNCTION
# =========================================================

def preprocess_for_inference(
    user_dict
):

    # =====================================================
    # USER INPUT
    # =====================================================

    user_df = pd.DataFrame(
        [user_dict]
    )

    user_df = (
        user_df
        .reindex(
            columns=user_cols,
            fill_value=0
        )
        .copy()
    )

    user_profile = (
        user_df.iloc[0]
        .to_dict()
    )

    # =====================================================
    # FILTER RECIPES
    # =====================================================

    filtered_recipe_df = (
        filter_recipes(
            recipe_df,
            user_profile
        )
    )

    # =====================================================
    # EMPTY CHECK
    # =====================================================

    if len(filtered_recipe_df) == 0:

        return (
            None,
            None,
            pd.DataFrame()
        )

    # =====================================================
    # PREPARE RECIPE FEATURES
    # =====================================================

    recipe_features = (
        filtered_recipe_df[
            list(
                RECIPE_MAPPING.keys()
            )
        ]
        .rename(
            columns=RECIPE_MAPPING
        )
        .copy()
    )

    # =====================================================
    # ALIGN RECIPE FEATURES
    # =====================================================

    recipe_features = (
        recipe_features
        .reindex(
            columns=recipe_cols,
            fill_value=0
        )
    )

    # =====================================================
    # REPEAT USER ROW
    # =====================================================

    repeated_user = pd.concat(
        [user_df] * len(recipe_features),
        ignore_index=True
    )

    # =====================================================
    # COMBINE
    # SAME AS TRAINING
    # =====================================================

    combined_df = pd.concat(
        [
            repeated_user.reset_index(drop=True),
            recipe_features.reset_index(drop=True)
        ],
        axis=1
    )

    # =====================================================
    # SCALE FEATURES
    # =====================================================

    combined_df[
        scale_cols
    ] = scaler.transform(
        combined_df[
            scale_cols
        ]
    )

    # =====================================================
    # SPLIT MODEL INPUT
    # =====================================================

    X_user = (
        combined_df[
            user_cols
        ]
        .astype(np.float32)
    )

    X_recipe = (
        combined_df[
            recipe_cols
        ]
        .astype(np.float32)
    )

    return (
        X_user,
        X_recipe,
        filtered_recipe_df
    )