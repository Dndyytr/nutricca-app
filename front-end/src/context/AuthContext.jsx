import React, { createContext, useState, useCallback, useEffect } from 'react';
import {
  registerApi,
  loginApi,
  logoutApi,
  getUserProfile,
} from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [onboardingStep, setOnboardingStep] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load from localStorage & Verify with Backend on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedUser = localStorage.getItem('healthplan_user');
      const authToken = localStorage.getItem('healthplan_auth');

      if (savedUser && authToken) {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);

        try {
          // Selalu cek ke backend untuk status paling update saat halaman di-refresh
          const profileRes = await getUserProfile();
          const isCompleted =
            profileRes?.data?.user?.is_onboarding_completed ??
            profileRes?.user?.is_onboarding_completed;

          if (isCompleted) {
            setOnboardingStep('complete');
          } else {
            // Jika belum selesai, arahkan ke step awal
            setOnboardingStep('basic-identity');
          }
        } catch (error) {
          console.error('Gagal sinkronisasi profil saat inisialisasi:', error);
          // Fallback jika API gagal (misal token expired)
          setOnboardingStep('basic-identity');
        }
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const register = useCallback(async (fullName, email, password) => {
    try {
      await registerApi({ fullname: fullName, email, password });
      const loginResponse = await loginApi({ email, password });

      const realToken = loginResponse.data.accessToken;
      const refreshToken = loginResponse.data.refreshToken; // Tangkap refresh token
      
      const tokenPayload = JSON.parse(atob(realToken.split('.')[1]));
      const userData = { id: tokenPayload.id };

      localStorage.setItem('healthplan_user', JSON.stringify(userData));
      localStorage.setItem('healthplan_auth', realToken);
      localStorage.setItem('healthplan_refresh', refreshToken); // Simpan refresh token

      setUser(userData);
      setIsAuthenticated(true);
      setOnboardingStep('basic-identity');

      return true;
    } catch (e) {
      throw new Error(
        e.response?.data?.message || 'Terjadi kesalahan saat registrasi.',
      );
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const loginResponse = await loginApi({ email, password });

      const realToken = loginResponse.data.accessToken;
      const refreshToken = loginResponse.data.refreshToken; // Tangkap refresh token
      
      const tokenPayload = JSON.parse(atob(realToken.split('.')[1]));
      const userData = { id: tokenPayload.id };

      // Set token dulu agar apiClient bisa pakai token ini untuk panggil getUserProfile
      localStorage.setItem('healthplan_user', JSON.stringify(userData));
      localStorage.setItem('healthplan_auth', realToken);
      localStorage.setItem('healthplan_refresh', refreshToken); // Simpan refresh token

      setUser(userData);
      setIsAuthenticated(true);

      // CEK STATUS DATABASE SETELAH LOGIN SUKSES
      try {
        const profileRes = await getUserProfile();
        const isCompleted =
          profileRes?.data?.user?.is_onboarding_completed ??
          profileRes?.user?.is_onboarding_completed;

        if (isCompleted) {
          setOnboardingStep('complete');
        } else {
          setOnboardingStep('basic-identity');
        }
      } catch (e) {
        console.error('Gagal mengambil status onboarding:', e);
        setOnboardingStep('basic-identity');
      }

      return true;
    } catch (e) {
      throw new Error(
        e.response?.data?.message || 'Terjadi kesalahan saat login.',
      );
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('healthplan_refresh');
      
      // Kirim refresh token ke API
      if (refreshToken) {
        await logoutApi(refreshToken); 
      }
    } catch (e) {
      console.warn('Backend gagal logout, menghapus sesi lokal...', e);
    } finally {
      // Hapus SEMUA data otentikasi dari storage
      localStorage.removeItem('healthplan_user');
      localStorage.removeItem('healthplan_auth');
      localStorage.removeItem('healthplan_refresh'); 
      localStorage.removeItem('healthplan_profile');
      
      setUser(null);
      setIsAuthenticated(false);
      setOnboardingStep(null);
    }
  }, []);

  const completeOnboardingStep = useCallback(
    (stepData) => {
      if (!user) return;

      const steps = [
        'basic-identity',
        'lifestyle',
        'health-security',
        'goal-setting',
      ];
      const currentIndex = steps.indexOf(onboardingStep);

      if (currentIndex < steps.length - 1) {
        setOnboardingStep(steps[currentIndex + 1]);
      } else {
        setOnboardingStep('complete');
      }
    },
    [user, onboardingStep],
  );

  const skipToStep = useCallback((step) => {
    setOnboardingStep(step);
  }, []);

  const value = {
    isAuthenticated,
    user,
    onboardingStep,
    loading,
    register,
    login,
    logout,
    completeOnboardingStep,
    skipToStep,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};