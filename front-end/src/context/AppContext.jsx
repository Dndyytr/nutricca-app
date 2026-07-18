import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getGamificationApi,
  getUserBasicIdentity,
  getUserGoalSetting,
  getUserHealthSecurity,
  getUserLifestyleAssessment,
  getUserProfile,
} from "../services/api";
import { useAuth } from "../features/auth/model/use-auth";
import { AppContext } from "./app-context";

const initialDailyHealth = {
  date: new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
  weight: 0,
  calorieIntake: 0,
  calorieTarget: 0,
  waterIntake: 0,
  waterTarget: 0,
  activity: 0,
  activityTarget: 0,
};

const resultData = (result, key) =>
  result.status === "fulfilled" ? result.value?.data?.[key] : null;

const buildUserProfile = ({
  user,
  basic,
  lifestyle,
  health,
  goal,
  gamification,
}) => {
  const [systolic, diastolic] = health?.blood_pressure?.split("/") || [];
  const bloodPressure = {
    systolic: Number.parseInt(systolic, 10) || null,
    diastolic: Number.parseInt(diastolic, 10) || null,
  };
  const heightInMeters = basic?.height ? basic.height / 100 : null;
  const bmi = heightInMeters
    ? basic.weight / (heightInMeters * heightInMeters)
    : null;
  const bmiCategory = !bmi
    ? "-"
    : bmi < 18.5
      ? "Underweight"
      : bmi < 25
        ? "Normal"
        : bmi < 30
          ? "Overweight"
          : "Obese";

  return {
    id: user?.id || null,
    fullName: user?.fullname || null,
    email: user?.email || null,
    registeredAt: user?.created_at || null,
    isOnboardingCompleted: user?.is_onboarding_completed || false,
    age: basic?.age || null,
    gender: basic?.gender || null,
    weight: basic?.weight || null,
    height: basic?.height || null,
    activityLevel: basic?.activity_level || null,
    dietaryPattern: lifestyle?.dietary_pattern || null,
    mealsPerDay: lifestyle?.meals_per_day || null,
    dailyWaterIntakeGoal: lifestyle?.daily_water_intake_goal || null,
    avgSleepHours: lifestyle?.avg_sleep_hours
      ? Number.parseFloat(lifestyle.avg_sleep_hours)
      : null,
    medicalHistory:
      health?.medical_history === "none"
        ? []
        : [health?.medical_history].filter(Boolean),
    physicalInjuries:
      health?.physical_injuries === "none"
        ? ""
        : health?.physical_injuries || "",
    currentMedication:
      health?.current_medication === "none"
        ? ""
        : health?.current_medication || "",
    allergies:
      health?.allergy === "none" ? [] : [health?.allergy].filter(Boolean),
    bloodPressure,
    heartRate: health?.heart_rate || null,
    primaryGoal: goal?.primary_goal || null,
    targetWeight: goal?.target_weight_kg || null,
    commitmentDays: goal?.commitment_days || null,
    preferredActivities: goal?.preferred_activity
      ? [goal.preferred_activity]
      : [],
    bmi: bmi ? Number.parseFloat(bmi.toFixed(1)) : null,
    bmiCategory,
    activityPoints: gamification?.xp_points || 0,
  };
};

const fetchUserProfile = async () => {
  const results = await Promise.allSettled([
    getUserProfile(),
    getUserBasicIdentity(),
    getUserLifestyleAssessment(),
    getUserHealthSecurity(),
    getUserGoalSetting(),
    getGamificationApi(),
  ]);

  return buildUserProfile({
    user: resultData(results[0], "user"),
    basic: resultData(results[1], "userBasicIdentity"),
    lifestyle: resultData(results[2], "lifestyleAssessment"),
    health: resultData(results[3], "healthSecurity"),
    goal: resultData(results[4], "goalSetting"),
    gamification: resultData(results[5], "gamification"),
  });
};

export const AppProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [dailyHealth, setDailyHealth] = useState(initialDailyHealth);
  const [habits, setHabits] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const profileQuery = useQuery({
    queryKey: ["user-profile"],
    queryFn: fetchUserProfile,
    enabled: isAuthenticated,
  });
  const userProfile = isAuthenticated ? profileQuery.data || null : null;

  const updateCachedProfile = useCallback(
    (updates) => {
      queryClient.setQueryData(["user-profile"], (currentProfile) => ({
        ...currentProfile,
        ...(typeof updates === "function" ? updates(currentProfile) : updates),
      }));
    },
    [queryClient],
  );

  const progressData = useMemo(
    () => ({
      weeklyWeight: [],
      nutritionToday: {},
      streak: {
        consecutive: 0,
        total: userProfile?.activityPoints ?? 0,
        longest: 0,
      },
      badges: [],
    }),
    [userProfile?.activityPoints],
  );

  const value = {
    userProfile,
    isLoadingProfile: isAuthenticated && profileQuery.isLoading,
    fetchUserProfile: profileQuery.refetch,
    setUserProfile: updateCachedProfile,
    updateUserProfile: updateCachedProfile,
    updateBasicIdentity: (data) =>
      updateCachedProfile({
        age: data.age,
        gender: data.gender,
        weight: data.weight,
        height: data.height,
        activityLevel: data.activityLevel,
      }),
    updateLifestyleAssessment: (data) =>
      updateCachedProfile({
        dietaryPattern: data.dietaryPattern,
        mealsPerDay: data.mealsPerDay,
        dailyWaterIntakeGoal: data.dailyWaterIntakeGoal,
        avgSleepHours: data.avgSleepHours,
      }),
    updateHealthSecurity: (data) =>
      updateCachedProfile({
        medicalHistory: data.medicalHistory,
        physicalInjuries: data.physicalInjuries,
        currentMedication: data.currentMedication,
        bloodPressure: data.bloodPressure,
        heartRate: data.heartRate,
        allergies: data.allergies,
      }),
    updateGoalSetting: (data) =>
      updateCachedProfile({
        primaryGoal: data.primaryGoal,
        targetWeight: data.targetWeight,
        commitmentDays: data.commitmentDays,
        preferredActivities: data.preferredActivities,
      }),
    dailyHealth,
    updateDailyHealth: (update) =>
      setDailyHealth((current) => ({ ...current, ...update })),
    habits,
    toggleHabit: (habitId) =>
      setHabits((currentHabits) =>
        currentHabits.map((habit) =>
          habit.id === habitId
            ? { ...habit, completed: !habit.completed }
            : habit,
        ),
      ),
    recommendations: [],
    progressData,
    notifications,
    addNotification: (notification) =>
      setNotifications((currentNotifications) => [
        notification,
        ...currentNotifications,
      ]),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
