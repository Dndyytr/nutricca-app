import { useCallback, useEffect, useState } from 'react';
import {
  getUserProfile,
  loginApi,
  logoutApi,
  registerApi,
  loginWithGoogleApi,
} from '../../../services/api';
import { AuthContext } from './auth-context';

const ONBOARDING_STEPS = [
  'basic-identity',
  'lifestyle',
  'health-security',
  'goal-setting',
];

const readSession = () => {
  const savedUser = localStorage.getItem('healthplan_user');
  const accessToken = localStorage.getItem('healthplan_auth');

  if (!savedUser || !accessToken) {
    return null;
  }

  try {
    return { user: JSON.parse(savedUser), accessToken };
  } catch {
    return null;
  }
};

const getUserFromAccessToken = (accessToken) => {
  const payload = JSON.parse(atob(accessToken.split('.')[1]));
  return { id: payload.id };
};

const persistSession = ({ user, accessToken, refreshToken }) => {
  localStorage.setItem('healthplan_user', JSON.stringify(user));
  localStorage.setItem('healthplan_auth', accessToken);
  localStorage.setItem('healthplan_refresh', refreshToken);
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [onboardingStep, setOnboardingStep] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncOnboardingStatus = useCallback(async () => {
    const profileRes = await getUserProfile();
    const isCompleted = profileRes?.data?.user?.is_onboarding_completed;
    setOnboardingStep(isCompleted ? 'complete' : 'basic-identity');
  }, []);

  useEffect(() => {
    const initializeSession = async () => {
      const session = readSession();

      if (!session) {
        setLoading(false);
        return;
      }

      setUser(session.user);
      setIsAuthenticated(true);

      try {
        await syncOnboardingStatus();
      } catch {
        setOnboardingStep('basic-identity');
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, [syncOnboardingStatus]);

  const startSession = useCallback(
    async (loginResponse) => {
      const accessToken = loginResponse.data.accessToken;
      const refreshToken = loginResponse.data.refreshToken;
      const nextUser = getUserFromAccessToken(accessToken);

      persistSession({ user: nextUser, accessToken, refreshToken });
      setUser(nextUser);
      setIsAuthenticated(true);

      try {
        await syncOnboardingStatus();
      } catch {
        setOnboardingStep('basic-identity');
      }
    },
    [syncOnboardingStatus],
  );

  const register = useCallback(
    async (fullName, email, password, otp) => {
      try {
        await registerApi({ fullname: fullName, email, password, otp });
        await startSession(await loginApi({ email, password }));
        return true;
      } catch (error) {
        throw new Error(
          error.response?.data?.message || 'Terjadi kesalahan saat registrasi.',
          { cause: error },
        );
      }
    },
    [startSession],
  );

  const login = useCallback(
    async (email, password) => {
      try {
        await startSession(await loginApi({ email, password }));
        return true;
      } catch (error) {
        throw new Error(
          error.response?.data?.message || 'Terjadi kesalahan saat login.',
          { cause: error },
        );
      }
    },
    [startSession],
  );

  const loginWithGoogle = useCallback(
    async (token) => {
      try {
        await startSession(await loginWithGoogleApi(token));
        return true;
      } catch (error) {
        throw new Error(
          error.response?.data?.message || 'Terjadi kesalahan saat login.',
          { cause: error },
        );
      }
    },
    [startSession],
  );

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('healthplan_refresh');

    try {
      if (refreshToken) {
        await logoutApi(refreshToken);
      }
    } finally {
      localStorage.removeItem('healthplan_user');
      localStorage.removeItem('healthplan_auth');
      localStorage.removeItem('healthplan_refresh');
      localStorage.removeItem('healthplan_profile');
      setUser(null);
      setIsAuthenticated(false);
      setOnboardingStep(null);
    }
  }, []);

  const completeOnboardingStep = useCallback(() => {
    setOnboardingStep((currentStep) => {
      const currentIndex = ONBOARDING_STEPS.indexOf(currentStep);

      return currentIndex < ONBOARDING_STEPS.length - 1
        ? ONBOARDING_STEPS[currentIndex + 1]
        : 'complete';
    });
  }, []);

  const value = {
    isAuthenticated,
    user,
    onboardingStep,
    loading,
    register,
    login,
    loginWithGoogle,
    logout,
    completeOnboardingStep,
    skipToStep: setOnboardingStep,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
