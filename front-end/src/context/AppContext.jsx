import React, { createContext, useState, useCallback, useEffect } from 'react';
import {
  getUserProfile,
  getUserBasicIdentity,
  getUserLifestyleAssessment,
  getUserHealthSecurity,
  getUserGoalSetting,
  getGamificationApi,
} from '../services/api.js';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [dailyHealth, setDailyHealth] = useState({
    date: new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    weight: 0,
    calorieIntake: 0,
    calorieTarget: 0,
    waterIntake: 0,
    waterTarget: 0,
    activity: 0,
    activityTarget: 0,
  });

  const [habits, setHabits] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [progressData, setProgressData] = useState({
    weeklyWeight: [],
    nutritionToday: {},
    streak: { consecutive: 0, total: 0, longest: 0 },
    badges: [],
  });
  const [notifications, setNotifications] = useState([]);

  // =============================================
  // FETCH USER PROFILE FROM API
  // =============================================
  const fetchUserProfile = useCallback(async () => {
    const token = localStorage.getItem('healthplan_auth');
    if (!token) {
      setIsLoadingProfile(false);
      return;
    }

    try {
      setIsLoadingProfile(true);

      const [userRes, basicRes, lifestyleRes, healthRes, goalRes, gamifRes] =
        await Promise.allSettled([
          getUserProfile(),
          getUserBasicIdentity(),
          getUserLifestyleAssessment(),
          getUserHealthSecurity(),
          getUserGoalSetting(),
          getGamificationApi(),
        ]);

      const user =
        userRes.status === 'fulfilled' ? userRes.value?.data?.user : null;
      const basic =
        basicRes.status === 'fulfilled'
          ? basicRes.value?.data?.userBasicIdentity
          : null;
      const lifestyle =
        lifestyleRes.status === 'fulfilled'
          ? lifestyleRes.value?.data?.lifestyleAssessment
          : null;
      const health =
        healthRes.status === 'fulfilled'
          ? healthRes.value?.data?.healthSecurity
          : null;
      const goal =
        goalRes.status === 'fulfilled'
          ? goalRes.value?.data?.goalSetting
          : null;
      const gamif =
        gamifRes.status === 'fulfilled'
          ? gamifRes.value?.data?.gamification
          : null;

      // Parse blood pressure "120/80"
      let bloodPressure = { systolic: null, diastolic: null };
      if (health?.blood_pressure?.includes('/')) {
        const parts = health.blood_pressure.split('/');
        bloodPressure = {
          systolic: parseInt(parts[0]) || null,
          diastolic: parseInt(parts[1]) || null,
        };
      }

      // Calculate BMI
      let bmi = null;
      let bmiCategory = '-';
      if (basic?.weight && basic?.height) {
        const heightM = basic.height / 100;
        bmi = basic.weight / (heightM * heightM);
        if (bmi < 18.5) bmiCategory = 'Underweight';
        else if (bmi < 25) bmiCategory = 'Normal';
        else if (bmi < 30) bmiCategory = 'Overweight';
        else bmiCategory = 'Obese';
      }

      setUserProfile({
        // Account
        id: user?.id || null,
        fullName: user?.fullname || null,
        email: user?.email || null,
        registeredAt: user?.created_at || null,
        isOnboardingCompleted: user?.is_onboarding_completed || false,

        // Basic Identity
        age: basic?.age || null,
        gender: basic?.gender || null,
        weight: basic?.weight || null,
        height: basic?.height || null,
        activityLevel: basic?.activity_level || null,

        // Lifestyle
        dietaryPattern: lifestyle?.dietary_pattern || null,
        mealsPerDay: lifestyle?.meals_per_day || null,
        dailyWaterIntakeGoal: lifestyle?.daily_water_intake_goal || null,
        avgSleepHours: lifestyle?.avg_sleep_hours
          ? parseFloat(lifestyle.avg_sleep_hours)
          : null,

        // Health Security
        medicalHistory:
          health?.medical_history === 'none'
            ? []
            : [health?.medical_history].filter(Boolean),
        physicalInjuries:
          health?.physical_injuries === 'none'
            ? ''
            : health?.physical_injuries || '',
        currentMedication:
          health?.current_medication === 'none'
            ? ''
            : health?.current_medication || '',
        allergies:
          health?.allergy === 'none' ? [] : [health?.allergy].filter(Boolean),
        bloodPressure,
        heartRate: health?.heart_rate || null,

        // Goal Setting
        primaryGoal: goal?.primary_goal || null,
        targetWeight: goal?.target_weight_kg || null,
        commitmentDays: goal?.commitment_days || null,
        preferredActivities: goal?.preferred_activity
          ? [goal.preferred_activity]
          : [],

        // Calculated
        bmi: bmi ? parseFloat(bmi.toFixed(1)) : null,
        bmiCategory,
        activityPoints: gamif?.xp_points || 0,
      });

      setProgressData({
        weeklyWeight: [],
        nutritionToday: {},
        streak: {
          consecutive: gamif?.current_streak ?? 0,
          total: gamif?.xp_points ?? 0,
          longest: gamif?.longest_streak ?? 0,
        },
        badges: gamif?.unlocked_badges ?? [],
      });
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // =============================================
  // UPDATE HANDLERS
  // =============================================
  const updateUserProfile = useCallback((updates) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateBasicIdentity = useCallback((data) => {
    setUserProfile((prev) => ({
      ...prev,
      age: data.age,
      gender: data.gender,
      weight: data.weight,
      height: data.height,
      activityLevel: data.activityLevel,
    }));
  }, []);

  const updateLifestyleAssessment = useCallback((data) => {
    setUserProfile((prev) => ({
      ...prev,
      dietaryPattern: data.dietaryPattern,
      mealsPerDay: data.mealsPerDay,
      dailyWaterIntakeGoal: data.dailyWaterIntakeGoal,
      avgSleepHours: data.avgSleepHours,
    }));
  }, []);

  const updateHealthSecurity = useCallback((data) => {
    setUserProfile((prev) => ({
      ...prev,
      medicalHistory: data.medicalHistory,
      physicalInjuries: data.physicalInjuries,
      currentMedication: data.currentMedication,
      bloodPressure: data.bloodPressure,
      heartRate: data.heartRate,
      allergies: data.allergies,
    }));
  }, []);

  const updateGoalSetting = useCallback((data) => {
    setUserProfile((prev) => ({
      ...prev,
      primaryGoal: data.primaryGoal,
      targetWeight: data.targetWeight,
      commitmentDays: data.commitmentDays,
      preferredActivities: data.preferredActivities,
    }));
  }, []);

  const toggleHabit = useCallback((habitId) => {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === habitId
          ? { ...habit, completed: !habit.completed }
          : habit,
      ),
    );
  }, []);

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev]);
  }, []);

  const value = {
    // Profile
    userProfile,
    isLoadingProfile,
    fetchUserProfile,
    setUserProfile,
    updateUserProfile,
    updateBasicIdentity,
    updateLifestyleAssessment,
    updateHealthSecurity,
    updateGoalSetting,

    // Daily Health & Habits
    dailyHealth,
    updateDailyHealth: useCallback((update) => {
      setDailyHealth((prev) => ({ ...prev, ...update }));
    }, []),
    habits,
    toggleHabit,

    // Recommendations & Notifications
    recommendations,
    progressData,
    notifications,
    addNotification,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
