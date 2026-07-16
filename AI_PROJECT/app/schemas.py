from pydantic import BaseModel

class UserInput(BaseModel):
    age: int
    height: float
    BMI: float
    blood_pressure_systolic: float
    blood_pressure_diastolic: float
    heart_rate: float
    daily_water_intake_goal: float
    avg_sleep_hours: float
    commitment_days: int
    target_weight_kg: float
    TDEE: float
    water_ml_per_kg: float
    activity_score: int
    calorie_gap: float
    target_weight_change: float
    target_weight_change_pct: float
    health_risk_score: float

    activity_level_encoded: int
    sleep_quality_encoded: int
    bmi_category_encoded: int
    bp_category_encoded: int
    age_group_encoded: int
    gender_encoded: int

    has_diabetes: int
    has_hypertension: int
    has_asthma: int
    has_high_cholesterol: int
    medical_unknown: int
    no_medical_history: int

    allergy_Egg: int
    allergy_Gluten: int
    allergy_Milk: int
    allergy_No_Allergy: int
    allergy_Peanut: int
    allergy_Seafood: int
    allergy_Soy: int

    primary_goal_Healthy_Lifestyle: int
    primary_goal_Maintenance: int
    primary_goal_Muscle_Gain: int
    primary_goal_Weight_Loss: int

    dietary_restriction_Balanced: int
    dietary_restriction_High_Protein: int
    dietary_restriction_Low_Calorie: int
    dietary_restriction_Low_Sodium: int
    dietary_restriction_Low_Sugar: int
