import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "../components/Layout";
import { useAuth } from "../features/auth/model/use-auth";
import { useLocale } from "../i18n/locale-context";

const Dashboard = lazy(() =>
  import("../pages/Dashboard").then((module) => ({
    default: module.Dashboard,
  })),
);
const LandingPage = lazy(() =>
  import("../pages/LandingPage").then((module) => ({
    default: module.LandingPage,
  })),
);
const Habits = lazy(() =>
  import("../pages/Habits").then((module) => ({ default: module.Habits })),
);
const Recommendations = lazy(() =>
  import("../pages/Recommendations").then((module) => ({
    default: module.Recommendations,
  })),
);
const Progress = lazy(() =>
  import("../pages/Progress").then((module) => ({ default: module.Progress })),
);
const Profile = lazy(() =>
  import("../pages/Profile").then((module) => ({ default: module.Profile })),
);
const Notifications = lazy(() =>
  import("../pages/Notifications").then((module) => ({
    default: module.Notifications,
  })),
);
const Register = lazy(() =>
  import("../pages/Register").then((module) => ({ default: module.Register })),
);
const Login = lazy(() =>
  import("../pages/Login").then((module) => ({ default: module.Login })),
);
const BasicIdentity = lazy(() =>
  import("../pages/BasicIdentity").then((module) => ({
    default: module.BasicIdentity,
  })),
);
const HealthSecurity = lazy(() =>
  import("../pages/HealthSecurity").then((module) => ({
    default: module.HealthSecurity,
  })),
);
const GoalSetting = lazy(() =>
  import("../pages/GoalSetting").then((module) => ({
    default: module.GoalSetting,
  })),
);
const Lifestyle = lazy(() =>
  import("../pages/Lifestyle").then((module) => ({
    default: module.Lifestyle,
  })),
);
const RecipePage = lazy(() =>
  import("../pages/RecipePage").then((module) => ({
    default: module.RecipePage,
  })),
);

const RouteFallback = () => {
  const { t } = useLocale();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center t-size3 text-slate-400 font-medium">
      {t("common.loadingPage")}
    </div>
  );
};

const AppRoutes = () => {
  const { isAuthenticated, loading, onboardingStep } = useAuth();

  if (loading) {
    return <RouteFallback />;
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/onboarding"
          element={<Navigate to="/register" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  if (onboardingStep !== "complete") {
    return (
      <Routes>
        <Route path="/onboarding/basic-identity" element={<BasicIdentity />} />
        <Route path="/onboarding/lifestyle" element={<Lifestyle />} />
        <Route
          path="/onboarding/health-security"
          element={<HealthSecurity />}
        />
        <Route path="/onboarding/goal-setting" element={<GoalSetting />} />
        <Route
          path="*"
          element={
            <Navigate
              to={`/onboarding/${onboardingStep || "basic-identity"}`}
              replace
            />
          }
        />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/habits" element={<Habits />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/recommendations/recipe/:id" element={<RecipePage />} />
        <Route path="/recommendation/recipe/:id" element={<RecipePage />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const AppRouter = () => (
  <BrowserRouter>
    <Suspense fallback={<RouteFallback />}>
      <AppRoutes />
    </Suspense>
  </BrowserRouter>
);
