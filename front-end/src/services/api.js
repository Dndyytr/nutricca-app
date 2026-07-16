import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Menyisipkan JWT Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('healthplan_auth');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor: Langsung mengembalikan response.data
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    throw error;
  },
);

/* =========================================
   Authentication APIs
========================================= */
export const registerApi = (userData) => {
  return apiClient.post(`/users`, userData);
};

export const loginApi = (credentials) => {
  return apiClient.post(`/auth`, credentials);
};

export const logoutApi = (refreshToken) => {
  return apiClient.delete(`/auth/logout`, {
    data: { refreshToken },
  });
};

/* =========================================
   Onboarding APIs
========================================= */
export const basicIdentityApi = (data) => {
  return apiClient.post(`/basic-identity`, data);
};

export const lifestyleApi = (data) => {
  return apiClient.post(`/lifestyle-assessment`, data);
};

export const healthGoalsApi = (data) => {
  return apiClient.post(`/goal-setting`, data);
};

export const healthSecurityApi = (data) => {
  return apiClient.post(`/health-security`, data);
};

/* =========================================
   User APIs Profile & Assessments
========================================= */
export const getUserProfile = () => {
  return apiClient.get(`/users`);
};

export const getUserBasicIdentity = () => {
  return apiClient.get(`/basic-identity`);
};

export const getUserLifestyleAssessment = () => {
  return apiClient.get(`/lifestyle-assessment`);
};

export const getUserHealthSecurity = () => {
  return apiClient.get(`/health-security`);
};

export const getUserGoalSetting = () => {
  return apiClient.get(`/goal-setting`);
};

export const updateUserProfile = (data) => {
  return apiClient.put(`/users`, data);
};

export const updateOnboardingStatus = () => {
  return apiClient.put(`/users/onboarding-status`);
};

export const updateBasicIdentity = (data) => {
  return apiClient.put(`/basic-identity`, data);
};

export const updateGoalSetting = (data) => {
  return apiClient.put('/goal-setting', data);
};

/* =========================================
   Daily Logs & Schedule APIs (TERBARU)
   * Tidak perlu userId karena JWT sudah mengaturnya
========================================= */

// Mengambil dashboard lengkap (Trigger Lazy Initialization)
export const getTodayScheduleApi = () => {
  return apiClient.get(`/daily-logs/schedule/today`);
};

// Mengambil daily log berdasarkan tanggal tertentu (Misal: 2026-06-01)
export const getDailyLogByDate = (date) => {
  return apiClient.get(`/daily-logs/date`, { params: { date } });
};

// Update data daily log (Kalori, Air, Waktu Tidur) berdasarkan ID daily_log
export const updateDailyLog = (dailyLogId, data) => {
  return apiClient.put(`/daily-logs/${dailyLogId}`, data);
};

// Mengambil seluruh riwayat log harian user aktif
export const getDailyLogHistory = () => {
  return apiClient.get(`/daily-logs/history`);
};

export const addNutritionLog = (data) => {
  return apiClient.post('/nutrition-logs', data);
};

export const getNutritionLogsByDailyLogId = (dailyLogId) => {
  return apiClient.get(`/nutrition-logs/${dailyLogId}/nutrition`);
};

export const deleteNutritionLog = (nutritionLogId) => {
  return apiClient.delete(`/nutrition-logs/${nutritionLogId}`);
};

export const postWeeklyRun = (data) => {
  return apiClient.post(`/weekly-activities/run`, data);
};

export const getWeeklyRun = () => {
  return apiClient.get(`/weekly-activities/run`);
};

export const putWeeklyRun = (weeklyRunId, data) => {
  return apiClient.put(`/weekly-activities/run/${weeklyRunId}`, data);
};

export const postWeeklyExercise = (data) => {
  return apiClient.post(`/weekly-activities/exercise`, data);
};

export const getWeeklyExercise = () => {
  return apiClient.get(`/weekly-activities/exercise`);
};

export const putWeeklyExercise = (weeklyExerciseId, data) => {
  return apiClient.put(`/weekly-activities/exercise/${weeklyExerciseId}`, data);
};

export const getWeightLogs = () => {
  return apiClient.get('/weight-logs');
};

export const postWeightLog = (data) => {
  return apiClient.post('/weight-logs', data);
};
/* =========================================
   Activity Log APIs
========================================= */
// Menambah aktivitas baru (Membutuhkan: daily_log_id, activity_name, input_value)
export const postActivityLog = (data) => {
  return apiClient.post(`/activity-logs`, data);
};

// Mengambil daftar aktivitas berdasarkan ID daily_log hari itu
export const getActivitiesByDailyLog = (dailyLogId) => {
  return apiClient.get(`/activity-logs/${dailyLogId}`);
};

// Menghapus aktivitas berdasarkan ID activity_log
export const deleteActivityLog = (activityLogId) => {
  return apiClient.delete(`/activity-logs/${activityLogId}`);
};
/* =========================================
   Habit APIs
========================================= */
// Asumsi: Backend habits juga sudah disesuaikan agar membaca dari JWT
export const getHabits = () => {
  return apiClient.get(`/habits`);
};

export const createHabit = (habitData) => {
  return apiClient.post(`/habits`, habitData);
};

export const updateHabit = (habitId, data) => {
  return apiClient.put(`/habits/${habitId}`, data);
};

export const deleteHabit = (habitId) => {
  return apiClient.delete(`/habits/${habitId}`);
};

/* =========================================
   Recommendation APIs
========================================= */
export const getGamificationApi = () => {
  return apiClient.get(`/gamification`);
};
export const generateDailyPlanApi = (targetDate) => {
  return apiClient.post(`/ai-recommendations/predict`, {
    target_date: targetDate,
  });
};

export const getRecommendationByDateApi = (targetDate) => {
  // Tambahkan ?t=... agar setiap request GET selalu dianggap request baru oleh browser
  const timestamp = new Date().getTime();
  return apiClient.get(`/ai-recommendations/date/${targetDate}?t=${timestamp}`);
};

export const putRecommendationAi = (targetDate, data) => {
  return apiClient.put(`/ai-recommendations/date/${targetDate}`, data);
};
/* =========================================
   Progress & Notification APIs
========================================= */
export const getProgressData = (period = '7') => {
  return apiClient.get(`/progress`, { params: { period } });
};

export const getNotifications = () => {
  return apiClient.get(`/notifications`);
};

export const markNotificationAsRead = (notificationId) => {
  return apiClient.put(`/notifications/${notificationId}/read`);
};

export default apiClient;
