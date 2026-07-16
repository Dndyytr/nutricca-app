export const buildUserAiPayload = (dbUser) => {
  // 1. Extract data
  const {
    age, gender, weight, height, activity_level, daily_water_intake_goal,
    avg_sleep_hours, primary_goal, target_weight_kg,
    blood_pressure, heart_rate, allergy, medical_history,
  } = dbUser;

  // 2. AUTOMATIC MATHEMATICAL CALCULATIONS
  const heightInMeter = height / 100;
  const BMI = weight / (heightInMeter * heightInMeter);

  let BMR = 10 * weight + 6.25 * height - 5 * age;
  BMR = gender.toLowerCase() === 'male' ? BMR + 5 : BMR - 161;

  let activity_score = 2;
  let activityMultiplier = 1.375;
  const act = (activity_level || '').toLowerCase();

  if (act.includes('sedentary') || act.includes('low')) {
    activity_score = 1;
    activityMultiplier = 1.2;
  } else if (act.includes('active') && !act.includes('very')) {
    activity_score = 3;
    activityMultiplier = 1.55;
  } else if (act.includes('very active')) {
    activity_score = 4;
    activityMultiplier = 1.725;
  }

  const TDEE = BMR * activityMultiplier;
  const target_weight_change = target_weight_kg - weight;
  const target_weight_change_pct = target_weight_change / weight;

  let calorie_gap = 0;
  if (target_weight_change < 0) calorie_gap = -500;
  if (target_weight_change > 0) calorie_gap = 500;

  const calorie_target_ratio = (TDEE + calorie_gap) / TDEE;
  const water_ml_per_kg = daily_water_intake_goal / weight;

  // 3. TEXT TRANSLATOR TO AI FORMAT
  // A. Blood Pressure
  let bpSystolic = 120;
  let bpDiastolic = 80;
  if (blood_pressure && blood_pressure.includes('/')) {
    const bpParts = blood_pressure.split('/');
    bpSystolic = parseInt(bpParts[0]) || 120;
    bpDiastolic = parseInt(bpParts[1]) || 80;
  }

  // B. Medical History
  const medStr = (medical_history || '').toLowerCase();
  const has_asthma = medStr.includes('asthma') ? 1 : 0;
  const has_diabetes = medStr.includes('diabetes') ? 1 : 0;
  const has_high_cholesterol = medStr.includes('cholesterol') ? 1 : 0;
  const has_hypertension = medStr.includes('hypertension') ? 1 : 0;
  const no_medical_history = (!has_asthma && !has_diabetes && !has_high_cholesterol && !has_hypertension) ? 1 : 0;

  // C. Allergies
  const algStr = (allergy || '').toLowerCase();
  const allergy_Egg = algStr.includes('egg') ? 1 : 0;
  const allergy_Gluten = algStr.includes('gluten') ? 1 : 0;
  const allergy_Milk = algStr.includes('milk') || algStr.includes('dairy') ? 1 : 0;
  const allergy_Peanut = algStr.includes('peanut') ? 1 : 0;
  const allergy_Seafood = algStr.includes('seafood') ? 1 : 0;
  const allergy_Soy = algStr.includes('soy') ? 1 : 0;
  // Tambahan wajib untuk skema FastAPI
  const allergy_No_Allergy = (!allergy_Egg && !allergy_Gluten && !allergy_Milk && !allergy_Peanut && !allergy_Seafood && !allergy_Soy) ? 1 : 0;

  // D. Goals & Restrictions
  const goalStr = (primary_goal || '').toLowerCase();
  const sleep_quality_encoded = 3;
  const health_risk_score = 1;
  const dietary_restriction_Low_Sodium = 0;
  const dietary_restriction_Low_Sugar = has_diabetes ? 1 : 0;

  // =========================================================
  // PENAMBAHAN 4 VARIABEL WAJIB YANG HILANG (Dummy calculation)
  // =========================================================
  const healthy_lifestyle_score = (activity_score + sleep_quality_encoded) / 2;
  const bmi_category_encoded = BMI < 18.5 ? 0 : (BMI < 25 ? 1 : 2);
  const bp_category_encoded = bpSystolic < 120 ? 0 : (bpSystolic < 140 ? 1 : 2);
  const age_group_encoded = age < 30 ? 0 : (age < 50 ? 1 : 2);

  // 4. CONSTRUCT FINAL PAYLOAD (Semua nama pakai Underscore _ )
  return {
    age,
    height,
    BMI: parseFloat(BMI.toFixed(2)),
    avg_sleep_hours: parseFloat(avg_sleep_hours),
    daily_water_intake_goal,
    water_ml_per_kg: parseFloat(water_ml_per_kg.toFixed(2)),
    TDEE: parseFloat(TDEE.toFixed(2)),
    activity_score,
    activity_level_encoded: activity_score,
    target_weight_kg,
    target_weight_change: parseFloat(target_weight_change.toFixed(2)),
    target_weight_change_pct: parseFloat(target_weight_change_pct.toFixed(4)),
    calorie_gap,
    calorie_target_ratio: parseFloat(calorie_target_ratio.toFixed(2)),

    // Parsed Vitals & 4 Variabel Baru
    blood_pressure_systolic: bpSystolic,
    blood_pressure_diastolic: bpDiastolic,
    heart_rate: heart_rate || 75,
    sleep_quality_encoded,
    health_risk_score,
    healthy_lifestyle_score,
    bmi_category_encoded,
    bp_category_encoded,
    age_group_encoded,

    // Medical History
    has_asthma,
    has_diabetes,
    has_high_cholesterol,
    has_hypertension,
    no_medical_history,

    // Allergies
    allergy_Egg,
    allergy_Gluten,
    allergy_Milk,
    allergy_Peanut,
    allergy_Seafood,
    allergy_Soy,
    allergy_No_Allergy,

    // Goal mapping (SPASI DIUBAH JADI UNDERSCORE)
    primary_goal_Healthy_Lifestyle: goalStr.includes('healthy') ? 1 : 0,
    primary_goal_Maintenance: goalStr.includes('maintain') ? 1 : 0,
    primary_goal_Muscle_Gain: goalStr.includes('muscle') || goalStr.includes('gain') ? 1 : 0,
    primary_goal_Weight_Loss: goalStr.includes('loss') || goalStr.includes('lose') ? 1 : 0,

    // Dietary mapping (SPASI DIUBAH JADI UNDERSCORE)
    dietary_restriction_Balanced: !dietary_restriction_Low_Sodium && !dietary_restriction_Low_Sugar ? 1 : 0,
    dietary_restriction_High_Protein: goalStr.includes('muscle') || goalStr.includes('gain') ? 1 : 0,
    dietary_restriction_Low_Calorie: goalStr.includes('loss') || goalStr.includes('lose') ? 1 : 0,
    dietary_restriction_Low_Sodium: dietary_restriction_Low_Sodium,
    dietary_restriction_Low_Sugar: dietary_restriction_Low_Sugar,
  };
};