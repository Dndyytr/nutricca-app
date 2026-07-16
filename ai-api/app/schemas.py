from pydantic import BaseModel


class UserInput(BaseModel):

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

    has_diabetes: int = 0
    has_hypertension: int = 0
    has_asthma: int = 0
    has_high_cholesterol: int = 0
    no_medical_history: int = 0

    allergy_Egg: int = 0
    allergy_Gluten: int = 0
    allergy_Milk: int = 0
    allergy_No_Allergy: int = 0
    allergy_Peanut: int = 0
    allergy_Seafood: int = 0
    allergy_Soy: int = 0

    primary_goal_Healthy_Lifestyle: int = 0
    primary_goal_Maintenance: int = 0
    primary_goal_Muscle_Gain: int = 0
    primary_goal_Weight_Loss: int = 0

    dietary_restriction_Balanced: int = 0
    dietary_restriction_High_Protein: int = 0
    dietary_restriction_Low_Calorie: int = 0
    dietary_restriction_Low_Sodium: int = 0
    dietary_restriction_Low_Sugar: int = 0