import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { showLoading, showSuccess, showError, closeSwal } from '../utils/swal';

export const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
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
    if (!formData.fullName.trim()) { setError('Full name is required'); return; }
    if (!formData.email.trim()) { setError('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) { setError('Invalid email address'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }

    setLoading(true);
    showLoading('Creating account...', 'Setting up your health profile.');
    try {
      await register(formData.fullName, formData.email, formData.password);
      closeSwal();
      await showSuccess('Account Created!', 'Welcome to Nutricca. Let\'s set up your profile.');
      navigate('/onboarding/basic-identity');
    } catch (err) {
      closeSwal();
      const msg = err?.response?.data?.message || err.message || 'Registration failed';
      setError(msg);
      showError('Registration Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: 'Full Name', name: 'fullName', type: 'text', placeholder: 'John Doe' },
    { label: 'Email Address', name: 'email', type: 'email', placeholder: 'you@example.com' },
    { label: 'Password', name: 'password', type: 'password', placeholder: 'Minimum 6 characters' },
    { label: 'Confirm Password', name: 'confirmPassword', type: 'password', placeholder: 'Re-enter your password' },
  ];

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
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight">Join Nutricca.</h1>
          <p className="mt-6 text-lg leading-8 text-slate-500 max-w-md">
            Start your journey towards a healthier lifestyle with personalized nutrition insights, daily tracking, and meaningful progress.
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
            <h2 className="text-4xl font-extrabold tracking-tight">Create account</h2>
            <p className="mt-2 text-slate-500">Create your account to start your health journey.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {fields.map(({ label, name, type, placeholder }) => (
              <div key={name}>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-2">{label}</label>
                <input
                  type={type} name={name} value={formData[name]} onChange={handleChange}
                  placeholder={placeholder}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-100 border-2 border-transparent text-slate-900 placeholder-slate-400 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-200 outline-none"
                />
              </div>
            ))}

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                <p className="text-sm font-medium text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className={`w-full py-3.5 rounded-xl font-bold text-white transition-all duration-200 ${
                loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 hover:shadow-xl hover:-translate-y-0.5'
              }`}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 text-center text-slate-500">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="font-bold text-green-600 hover:text-green-700 transition-colors">
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
