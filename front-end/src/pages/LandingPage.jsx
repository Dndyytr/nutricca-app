import { useState, useEffect } from 'react';
import {
  Menu,
  X,
  ArrowRight,
  Star,
  Droplets,
  Moon,
  Apple,
  TrendingUp,
  ChevronRight,
  Target,
  PersonStanding,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

const sleepData = [
  { day: 'Mon', hours: 7.2 },
  { day: 'Tue', hours: 6.8 },
  { day: 'Wed', hours: 8.1 },
  { day: 'Thu', hours: 7.5 },
  { day: 'Fri', hours: 6.4 },
  { day: 'Sat', hours: 8.6 },
  { day: 'Sun', hours: 7.9 },
];

function ProgressRing({
  pct,
  size = 120,
  stroke = 10,
  color = '#16A34A',
  label,
  sublabel,
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="text-center -mt-1">
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{sublabel}</p>
      </div>
    </div>
  );
}

function WaterBar({ filled, total = 8 }) {
  return (
    <div className="flex gap-1.5 items-center flex-wrap">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
          style={{
            background: i < filled ? '#DCFCE7' : '#F1F5F9',
          }}
        >
          <Droplets
            size={14}
            style={{ color: i < filled ? '#16A34A' : '#CBD5E1' }}
          />
        </div>
      ))}
    </div>
  );
}

function DashboardMockup() {
  const [waterFilled, setWaterFilled] = useState(5);

  useEffect(() => {
    const t = setTimeout(() => setWaterFilled(6), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="relative bg-white rounded-2xl border border-slate-200/80 shadow-2xl p-5 w-full max-w-[440px] mx-auto"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      {/* header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">
            Sunday, 29 Jun
          </p>
          <h3 className="text-base font-semibold text-slate-900 mt-0.5">
            Good morning, Arya 👋
          </h3>
        </div>
        <div className="w-9 h-9 flex items-center justify-center">
          {/* Changed Icon to public/favicon.svg */}
          <img src="/favicon.svg" alt="Nutricca Icon" className="w-8 h-8 object-contain" />
        </div>
      </div>

      {/* rings row */}
      <div className="flex justify-around mb-5 bg-slate-50 rounded-xl p-4">
        <ProgressRing
          pct={82}
          size={90}
          stroke={8}
          color="#16A34A"
          label="82%"
          sublabel="Calories"
        />
        <ProgressRing
          pct={67}
          size={90}
          stroke={8}
          color="#22C55E"
          label="67%"
          sublabel="Protein"
        />
        <ProgressRing
          pct={91}
          size={90}
          stroke={8}
          color="#15803D"
          label="91%"
          sublabel="Water Intake"
        />
      </div>

      {/* water intake */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Droplets size={14} className="text-green-600" />
            <span className="text-xs font-semibold text-slate-900">
              Hydration
            </span>
          </div>
          <span className="text-xs text-slate-500">
            {waterFilled}/8 glasses
          </span>
        </div>
        <WaterBar filled={waterFilled} />
      </div>

      {/* sleep chart */}
      <div className="bg-slate-50 rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <PersonStanding size={14} className="text-green-600" />
            <span className="text-xs font-semibold text-slate-900">
              Weight Trend
            </span>
          </div>
          <span className="text-xs font-semibold text-green-600">
            65 kg avg
          </span>
        </div>
        <div className="h-20">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={sleepData}
              margin={{ top: 2, right: 2, bottom: 0, left: 2 }}
            >
              <defs>
                <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A34A" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="hours"
                stroke="#16A34A"
                strokeWidth={2}
                fill="url(#sleepGrad)"
                dot={false}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 8,
                  border: 'none',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                }}
                itemStyle={{ color: '#16A34A' }}
                labelStyle={{ color: '#64748B', fontSize: 10 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between mt-1">
          {sleepData.map((d) => (
            <span key={d.day} className="text-[10px] text-slate-400">
              {d.day}
            </span>
          ))}
        </div>
      </div>

      {/* floating badge */}
      <div className="absolute -top-4 -right-4 bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
        <TrendingUp size={12} />
        +12% this week
      </div>
    </div>
  );
}

const features = [
  {
    icon: Apple,
    color: '#16A34A',
    bg: '#DCFCE7',
    title: 'Diet & Nutrition',
    desc: 'Log meals, track macros, and monitor calorie balance with AI-powered daily recommendations tailored to your health profile.',
    size: 'col-span-2',
    tag: 'Most used',
  },
  {
    icon: Moon,
    color: '#15803D',
    bg: '#DCFCE7',
    title: 'Sleep Analysis',
    desc: 'Track sleep duration and quality. Set bedtime goals and wake up feeling genuinely restored with consistent routines.',
    size: 'col-span-1',
    tag: null,
  },
  {
    icon: Droplets,
    color: '#22C55E',
    bg: '#DCFCE7',
    title: 'Hydration Goals',
    desc: 'Set daily water targets with smart glass tracking. Visual progress bars and reminders keep you hydrated throughout the day.',
    size: 'col-span-1',
    tag: null,
  },
  {
    icon: Target,
    color: '#16A34A',
    bg: '#DCFCE7',
    title: 'Habit Streaks',
    desc: 'Build lasting routines with weekly habit tracking, exercise logs, and milestone badges that keep your momentum alive.',
    size: 'col-span-2',
    tag: 'New',
  },
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Nutritionist',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format',
    quote:
      'Nutricca changed how I counsel clients. The data is honest and actionable — not just pretty numbers. The habit tracker really helps people stick to their goals.',
  },
  {
    name: 'Marcus Oliveira',
    role: 'Marathon runner',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format',
    quote:
      'I shaved 8 minutes off my marathon time after three months of using the sleep and nutrition tracking together. The weekly run tracker is a game-changer.',
  },
  {
    name: 'Priya Nair',
    role: 'Software engineer',
    avatar:
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&auto=format',
    quote:
      "Finally an app that doesn't guilt-trip you. Nutricca feels like a calm coach — tracking habits, nutrition, and progress without the anxiety.",
  },
];

const navLinks = ['Features', 'How it Works', 'Testimonials'];

export const LandingPage = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      {/* ── NAV ── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200/60'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* logo */}
          <a href="#" className="flex items-center gap-2 group">
            {/* Changed Icon to public/favicon.svg */}
            <img 
              src="/favicon.svg" 
              alt="Nutricca Logo" 
              className="w-8 h-8 object-contain" 
            />
            <span className="text-[15px] font-bold tracking-tight text-slate-900">
              Nutricca
            </span>
          </a>

          {/* desktop links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase().replace(/ /g, '-')}`}
                className="text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium"
              >
                {l}
              </a>
            ))}
          </nav>

          {/* cta */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={()=> navigate('/login')} className="text-sm font-medium text-slate-500 hover:text-slate-900 px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-300 transition-all">
              Sign In
            </button>
            <button onClick={()=> navigate('/onboarding')} className="text-sm font-semibold text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors shadow-md shadow-green-600/20">
              Get Started
            </button>
          </div>

          {/* mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 flex flex-col gap-4">
            {navLinks.map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase().replace(/ /g, '-')}`}
                className="text-sm font-medium text-slate-500"
                onClick={() => setMobileOpen(false)}
              >
                {l}
              </a>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={()=> navigate('/login')} className="flex-1 text-sm font-medium text-slate-500 py-2 rounded-lg border border-slate-200">
                Sign In
              </button>
              <button onClick={()=> navigate('/onboarding')} className="flex-1 text-sm font-semibold text-white bg-green-600 py-2 rounded-lg">
                Get Started
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-green-200">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
              Nutricca - Health Tracker Application
            </div>
            <h1 className="text-[3.25rem] leading-[1.1] font-extrabold text-slate-900 tracking-tight mb-5">
              Track Your Habits,{' '}
              <span className="text-green-600">Transform</span> Your Health.
            </h1>
            <p className="text-[1.05rem] text-slate-500 leading-relaxed mb-8 max-w-md">
              Nutricca brings nutrition tracking, sleep analysis, hydration goals, 
              and habit streaks into one intelligent dashboard. Track meals, log workouts, 
              monitor weight progress, and build lasting healthy routines — all in one place.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={()=> navigate('/onboarding')} className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors shadow-lg shadow-green-600/20">
                Start for Free
                <ArrowRight size={16} />
              </button>
              <button onClick={()=> navigate('/login')} className="inline-flex items-center gap-2 text-slate-900 font-semibold text-sm px-6 py-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-all">
                Sign In
                <ChevronRight size={16} className="text-slate-500" />
              </button>
            </div>

            {/* social proof mini */}
            <div className="flex items-center gap-3 mt-8">
              <div className="flex -space-x-2">
                {[
                  'photo-1494790108377-be9c29b29330',
                  'photo-1507003211169-0a1dd7228f2d',
                  'photo-1573497019940-1c28c88b4f3e',
                ].map((id) => (
                  <img
                    key={id}
                    src={`https://images.unsplash.com/${id}?w=40&h=40&fit=crop&auto=format`}
                    alt="user"
                    className="w-8 h-8 rounded-full border-2 border-white object-cover bg-slate-100"
                  />
                ))}
              </div>
              <div>
                <div className="flex text-amber-400 text-xs">{'★★★★★'}</div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Loved by{' '}
                  <span className="font-semibold text-slate-900">12,000+</span>{' '}
                  users
                </p>
              </div>
            </div>
          </div>

          {/* right — dashboard mockup */}
          <div className="relative flex justify-center">
            {/* glow */}
            <div className="absolute inset-0 bg-green-100 rounded-3xl blur-3xl opacity-40 scale-90" />
            <div className="relative">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES (BENTO) ── */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-green-600 mb-3">
              Features
            </p>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Everything you need in one place.
            </h2>
            <p className="mt-3 text-slate-500 text-base max-w-xl mx-auto">
              Purpose-built health tracking tools that work together — nutrition, 
              habits, sleep, and progress in one coherent dashboard.
            </p>
          </div>

          {/* bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className={`group bg-white rounded-2xl border border-slate-200/80 p-6 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 ${
                    f.size === 'col-span-2' ? 'md:col-span-2' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: f.bg }}
                    >
                      <Icon size={18} style={{ color: f.color }} />
                    </div>
                    {f.tag && (
                      <span
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: f.bg, color: f.color }}
                      >
                        {f.tag}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-green-600 mb-3">
              How It Works
            </p>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Up and running in minutes.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Set your profile',
                desc: 'Tell Nutricca your basic info — age, weight, height, and activity level. We calculate your BMI, calorie targets, and personalize your health dashboard instantly.',
              },
              {
                step: '02',
                title: 'Track daily habits',
                desc: 'Log meals with AI recommendations, record sleep times, add water glasses, and track workouts. Weekly run and exercise trackers help you stay consistent.',
              },
              {
                step: '03',
                title: 'Review & improve',
                desc: "Weekly insights surface patterns in your nutrition, weight trends, and habit consistency. Small adjustments compound into lasting health transformation.",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col gap-4">
                <span className="text-5xl font-extrabold text-slate-200 leading-none">
                  {item.step}
                </span>
                <h3 className="text-lg font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-green-600 mb-3">
              Testimonials
            </p>
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Real people, real results.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 hover:shadow-lg transition-shadow"
              >
                {/* stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-6 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover bg-slate-100"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {t.name}
                    </p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="relative overflow-hidden bg-green-600 rounded-3xl px-10 py-16 text-center shadow-xl shadow-green-600/20">
            {/* background texture */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
                backgroundSize: '60px 60px',
              }}
            />
            <div className="relative">
              <p className="text-green-100 text-sm font-semibold uppercase tracking-widest mb-4">
                Start today — it's free
              </p>
              <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
                Ready to build better habits?
              </h2>
              <p className="text-green-100 text-base max-w-md mx-auto mb-8">
                Join thousands of people who made Nutricca their daily health 
                companion. Track nutrition, habits, sleep, and progress — all free.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                <button onClick={()=> navigate('/onboarding')} className="inline-flex items-center gap-2 bg-white text-green-700 font-semibold text-sm px-6 py-3 rounded-xl hover:bg-green-50 transition-colors shadow-md">
                  Start for Free
                  <ArrowRight size={16} />
                </button>
                <button onClick={()=> navigate('/login')} className="inline-flex items-center gap-2 border border-white/30 text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-white/10 transition-colors">
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-200 px-6 py-10 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            {/* Changed Icon to public/favicon.svg */}
            <img 
              src="/favicon.svg" 
              alt="Nutricca Logo" 
              className="w-7 h-7 object-contain" 
            />
            <span className="text-sm font-bold text-slate-900">Nutricca</span>
          </div>
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Nutricca - Health Tracker Application. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );    
};