import { useCallback, useEffect, useState } from "react";
import {
  getUserProfile,
  loginApi,
  logoutApi,
  registerApi,
  loginWithGoogleApi,
} from "../../../services/api";
import { AuthContext } from "./auth-context";

const ONBOARDING_STEPS = [
  "basic-identity",
  "lifestyle",
  "health-security",
  "goal-setting",
];

const readSession = () => {
  const storage = localStorage.getItem("healthplan_auth")
    ? localStorage
    : sessionStorage;
  const savedUser = storage.getItem("healthplan_user");
  const accessToken = storage.getItem("healthplan_auth");

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
  const payload = JSON.parse(atob(accessToken.split(".")[1]));
  return { id: payload.id };
};

const persistSession = ({
  user,
  accessToken,
  refreshToken,
  rememberMe = true,
}) => {
  const targetStorage = rememberMe ? localStorage : sessionStorage;
  const otherStorage = rememberMe ? sessionStorage : localStorage;

  otherStorage.removeItem("healthplan_user");
  otherStorage.removeItem("healthplan_auth");
  otherStorage.removeItem("healthplan_refresh");

  targetStorage.setItem("healthplan_user", JSON.stringify(user));
  targetStorage.setItem("healthplan_auth", accessToken);
  targetStorage.setItem("healthplan_refresh", refreshToken);
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [onboardingStep, setOnboardingStep] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncOnboardingStatus = useCallback(async () => {
    const profileRes = await getUserProfile();
    const isCompleted = profileRes?.data?.user?.is_onboarding_completed;
    setOnboardingStep(isCompleted ? "complete" : "basic-identity");
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
        setOnboardingStep("basic-identity");
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, [syncOnboardingStatus]);

  const startSession = useCallback(
    async (loginResponse, rememberMe = true) => {
      const accessToken = loginResponse.data.accessToken;
      const refreshToken = loginResponse.data.refreshToken;
      const nextUser = getUserFromAccessToken(accessToken);

      persistSession({ user: nextUser, accessToken, refreshToken, rememberMe });
      setUser(nextUser);
      setIsAuthenticated(true);

      try {
        await syncOnboardingStatus();
      } catch {
        setOnboardingStep("basic-identity");
      }
    },
    [syncOnboardingStatus],
  );

  const register = useCallback(
    async (fullName, email, password, otp) => {
      try {
        await registerApi({ fullname: fullName, email, password, otp });
        await startSession(await loginApi({ email, password }), true);
        return true;
      } catch (error) {
        throw new Error(
          error.response?.data?.message || "Terjadi kesalahan saat registrasi.",
          { cause: error },
        );
      }
    },
    [startSession],
  );

  const login = useCallback(
    async (email, password, rememberMe = true) => {
      try {
        await startSession(await loginApi({ email, password }), rememberMe);
        return true;
      } catch (error) {
        throw new Error(
          error.response?.data?.message || "Terjadi kesalahan saat login.",
          { cause: error },
        );
      }
    },
    [startSession],
  );

  const loginWithGoogle = useCallback(
    async (token) => {
      try {
        await startSession(await loginWithGoogleApi(token), true);
        return true;
      } catch (error) {
        throw new Error(
          error.response?.data?.message || "Terjadi kesalahan saat login.",
          { cause: error },
        );
      }
    },
    [startSession],
  );

  const logout = useCallback(async () => {
    const refreshToken =
      localStorage.getItem("healthplan_refresh") ||
      sessionStorage.getItem("healthplan_refresh");

    try {
      if (refreshToken) {
        await logoutApi(refreshToken);
      }
    } catch (err) {
      console.warn("Logout API call error ignored:", err);
    } finally {
      localStorage.removeItem("healthplan_user");
      localStorage.removeItem("healthplan_auth");
      localStorage.removeItem("healthplan_refresh");
      localStorage.removeItem("healthplan_profile");

      sessionStorage.removeItem("healthplan_user");
      sessionStorage.removeItem("healthplan_auth");
      sessionStorage.removeItem("healthplan_refresh");
      sessionStorage.removeItem("healthplan_profile");

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
        : "complete";
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
