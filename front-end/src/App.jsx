import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { LandingPage } from './pages/LandingPage';
import { Kebiasaan } from './pages/Kebiasaan';
import { Rekomendasi } from './pages/Rekomendasi';
import { Progress } from './pages/Progress';
import { Profil } from './pages/Profil';
import { Notifikasi } from './pages/Notifikasi';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import { BasicIdentity } from './pages/BasicIdentity';
import { HealthSecurity } from './pages/HealthSecurity';
import { GoalSetting } from './pages/GoalSetting';
import { Lifestyle } from './pages/Lifestyle';
import { useAuth } from './hooks/useAuth';
import { RecipePage } from './pages/RecipePage';

function AppRoutes() {
  const { isAuthenticated, loading, onboardingStep } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-5">
          {/* Logo */}
          <div className="w-16 h-16 rounded-2xl bg-green-600 flex items-center justify-center shadow-lg shadow-green-600/30">
            <img src="/favicon.svg" alt="Nutricca" className="w-9 h-9 brightness-0 invert" />
          </div>
          {/* Brand */}
          <div className="text-center">
            <div className="text-xl font-bold text-slate-900 tracking-tight">Nutricca</div>
            <div className="text-xs text-slate-400 mt-0.5">Health Tracker App</div>
          </div>
          {/* Spinner */}
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated - show auth pages
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Authenticated but not completed onboarding
  if (onboardingStep && onboardingStep !== 'complete') {
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
          element={<Navigate to="/onboarding/basic-identity" replace />}
        />
      </Routes>
    );
  }

  // Fully authenticated - show main app
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/habits" element={<Kebiasaan />} />
        <Route path="/recommendations" element={<Rekomendasi />} />
        <Route path="/recommendations/recipe/:id" element={<RecipePage />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/profile" element={<Profil />} />
        <Route path="/recommendation/recipe/:id" element={<RecipePage />} />
        <Route path="/notifications" element={<Notifikasi />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
