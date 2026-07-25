import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  // Mendukung token baik di localStorage maupun sessionStorage
  const token =
    localStorage.getItem("healthplan_auth") ||
    sessionStorage.getItem("healthplan_auth");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Jika token kadaluarsa / 401 Unauthorized pada API biasa, bersihkan token yang kadaluarsa
    if (error.response && error.response.status === 401) {
      const isAuthRoute = error.config?.url?.includes("/auth");
      if (!isAuthRoute) {
        localStorage.removeItem("healthplan_user");
        localStorage.removeItem("healthplan_auth");
        localStorage.removeItem("healthplan_refresh");

        sessionStorage.removeItem("healthplan_user");
        sessionStorage.removeItem("healthplan_auth");
        sessionStorage.removeItem("healthplan_refresh");
      }
    }
    return Promise.reject(error);
  },
);
