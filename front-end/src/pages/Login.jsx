import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUserProfile } from '../services/api';
import { showLoading, showError, closeSwal } from '../utils/swal';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Email and password are required');
      return;
    }
    setLoading(true);
    showLoading('Signing in...', 'Verifying your credentials.');
    try {
      await login(formData.email, formData.password);
      const userIsOnboarded = await getUserProfile().then(
        (res) => res.data.user.is_onboarding_completed,
      );
      closeSwal();
      if (userIsOnboarded === true) {
        navigate('/');
      } else {
        navigate('/onboarding/basic-identity');
      }
    } catch (err) {
      closeSwal();
      const msg = err?.response?.data?.message || err.message || 'Login failed';
      setError(msg);
      showError('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row text-slate-900">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-[42%] bg-slate-50 border-r border-slate-200 px-14 py-16 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-11 h-11 rounded-xl bg-green-600 flex items-center justify-center shadow-lg shadow-green-600/30">
              <img src="/favicon.svg" alt="Logo" className="w-6 h-6 brightness-0 invert" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight">Nutricca</span>
          </div>
          <span className="inline-flex px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider mb-6">
            Healthy Lifestyle Platform
          </span>
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-slate-900">
            Welcome Back.
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-500 max-w-md">
            Track your nutrition, monitor your progress, and build healthier habits every day with personalized recommendations.
          </p>
        </div>
        <div className="pt-10 border-t border-slate-200">
          <p className="text-sm text-slate-400">© 2026 Nutricca. Helping you build a healthier future.</p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-4xl font-extrabold tracking-tight">Sign in</h2>
            <p className="mt-2 text-slate-500">Welcome back! Please enter your account details.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-2">Email Address</label>
              <input
                type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3.5 rounded-xl bg-slate-100 border-2 border-transparent focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-2">Password</label>
              <input
                type="password" name="password" value={formData.password} onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3.5 rounded-xl bg-slate-100 border-2 border-transparent focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none"
              />
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                <p className="text-sm font-medium text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-bold text-white transition-all ${
                loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 hover:shadow-xl hover:-translate-y-0.5'
              }`}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center text-slate-500">
            Don't have an account?{' '}
            <button onClick={() => navigate('/register')} className="font-bold text-green-600 hover:text-green-700">
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
