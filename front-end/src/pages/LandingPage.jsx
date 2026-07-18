import { useState, useEffect } from "react";
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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EChartsChart } from "../shared/ui/echarts-chart";
import { LanguageToggle } from "../components/LanguageToggle";
import { useLocale } from "../i18n/locale-context";

const sleepData = [
  { day: "Mon", hours: 7.2 },
  { day: "Tue", hours: 6.8 },
  { day: "Wed", hours: 8.1 },
  { day: "Thu", hours: 7.5 },
  { day: "Fri", hours: 6.4 },
  { day: "Sat", hours: 8.6 },
  { day: "Sun", hours: 7.9 },
];

const getSleepChartOption = (t) => ({
  animationDuration: 650,
  grid: { top: 4, right: 2, bottom: 0, left: 2 },
  tooltip: {
    trigger: "axis",
    valueFormatter: (value) => t("landing.mockup.hours", { value }),
    textStyle: { fontSize: 11 },
  },
  xAxis: {
    type: "category",
    boundaryGap: false,
    data: sleepData.map(({ day }) => day),
    show: false,
  },
  yAxis: { type: "value", show: false, scale: true },
  series: [
    {
      type: "line",
      data: sleepData.map(({ hours }) => hours),
      smooth: true,
      symbol: "none",
      lineStyle: { color: "#16A34A", width: 2 },
      areaStyle: { color: "rgba(22, 163, 74, 0.18)" },
    },
  ],
});

function ProgressRing({
  pct,
  size = 120,
  stroke = 10,
  color = "#16A34A",
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
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="text-center -mt-1">
        <p className="t-size3 font-semibold text-slate-900">{label}</p>
        <p className="t-size2 text-slate-500 font-medium">{sublabel}</p>
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
            background: i < filled ? "#DCFCE7" : "#F1F5F9",
          }}
        >
          <Droplets
            size={14}
            style={{ color: i < filled ? "#16A34A" : "#CBD5E1" }}
          />
        </div>
      ))}
    </div>
  );
}

function DashboardMockup() {
  const [waterFilled, setWaterFilled] = useState(5);
  const { t } = useLocale();

  useEffect(() => {
    const t = setTimeout(() => setWaterFilled(6), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="relative bg-white rounded-2xl border border-slate-200/80 shadow-2xl p-5 w-full max-w-110 mx-auto"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      {/* header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="t-size2 text-slate-500 font-medium uppercase tracking-widest">
            {t("landing.mockup.date")}
          </p>
          <h3 className="t-size4 font-semibold text-slate-900 mt-0.5">
            {t("landing.mockup.greeting")}
          </h3>
        </div>
        <div className="w-9 h-9 flex items-center justify-center">
          {/* Changed Icon to public/favicon.svg */}
          <img
            src="/favicon.svg"
            alt={t("landing.iconAlt")}
            className="w-8 h-8 object-contain"
          />
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
          sublabel={t("landing.mockup.calories")}
        />
        <ProgressRing
          pct={67}
          size={90}
          stroke={8}
          color="#22C55E"
          label="67%"
          sublabel={t("landing.mockup.protein")}
        />
        <ProgressRing
          pct={91}
          size={90}
          stroke={8}
          color="#15803D"
          label="91%"
          sublabel={t("landing.mockup.waterIntake")}
        />
      </div>

      {/* water intake */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Droplets size={14} className="text-green-600" />
            <span className="t-size2 font-semibold text-slate-900">
              {t("landing.mockup.hydration")}
            </span>
          </div>
          <span className="t-size2 text-slate-500 font-medium">
            {t("landing.mockup.glasses", { count: waterFilled })}
          </span>
        </div>
        <WaterBar filled={waterFilled} />
      </div>

      {/* sleep chart */}
      <div className="bg-slate-50 rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <PersonStanding size={14} className="text-green-600" />
            <span className="t-size2 font-semibold text-slate-900">
              {t("landing.mockup.weightTrend")}
            </span>
          </div>
          <span className="t-size2 font-semibold text-green-600">
            {t("landing.mockup.weightAverage")}
          </span>
        </div>
        <div className="h-20">
          <EChartsChart
            option={getSleepChartOption(t)}
            className="h-full w-full"
            ariaLabel={t("landing.mockup.weeklySleepTrend")}
          />
        </div>
        <div className="flex justify-between mt-1">
          {sleepData.map((d) => (
            <span key={d.day} className="t-size1 text-slate-400 font-medium">
              {t(`landing.mockup.days.${d.day}`)}
            </span>
          ))}
        </div>
      </div>

      {/* floating badge */}
      <div className="absolute -top-4 -right-4 bg-green-600 text-white t-size2 font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
        <TrendingUp size={12} />
        {t("landing.mockup.thisWeek")}
      </div>
    </div>
  );
}

const features = [
  {
    icon: Apple,
    color: "#16A34A",
    bg: "#DCFCE7",
    key: "dietNutrition",
    size: "col-span-2",
    tagKey: "mostUsed",
  },
  {
    icon: Moon,
    color: "#15803D",
    bg: "#DCFCE7",
    key: "sleepAnalysis",
    size: "col-span-1",
    tagKey: null,
  },
  {
    icon: Droplets,
    color: "#22C55E",
    bg: "#DCFCE7",
    key: "hydrationGoals",
    size: "col-span-1",
    tagKey: null,
  },
  {
    icon: Target,
    color: "#16A34A",
    bg: "#DCFCE7",
    key: "habitStreaks",
    size: "col-span-2",
    tagKey: "new",
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    key: "sarah",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format",
  },
  {
    name: "Marcus Oliveira",
    key: "marcus",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format",
  },
  {
    name: "Priya Nair",
    key: "priya",
    avatar:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&auto=format",
  },
];

const navLinks = [
  { key: "features", href: "#features" },
  { key: "howItWorks", href: "#how-it-works" },
  { key: "testimonials", href: "#testimonials" },
];

export const LandingPage = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();
  const { t } = useLocale();
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      {/* ── NAV ── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200/60"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* logo */}
          <a href="#" className="flex items-center gap-2 group">
            {/* Changed Icon to public/favicon.svg */}
            <img
              src="/favicon.svg"
              alt={t("landing.logoAlt")}
              className="w-8 h-8 object-contain"
            />
            <span className="t-size4 font-bold tracking-tight text-slate-900">
              Nutricca
            </span>
          </a>

          {/* desktop links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(({ key, href }) => (
              <a
                key={key}
                href={href}
                className="t-size3 text-slate-500 hover:text-slate-900 transition-colors font-medium"
              >
                {t(`nav.${key}`)}
              </a>
            ))}
          </nav>

          {/* cta */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageToggle />
            <button
              onClick={() => navigate("/login")}
              className="t-size3 font-medium text-slate-500 hover:text-slate-900 px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-300 transition-all"
            >
              {t("nav.signIn")}
            </button>
            <button
              onClick={() => navigate("/onboarding")}
              className="t-size3 font-semibold text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors shadow-md shadow-green-600/20"
            >
              {t("nav.getStarted")}
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
            {navLinks.map(({ key, href }) => (
              <a
                key={key}
                href={href}
                className="t-size3 font-medium text-slate-500"
                onClick={() => setMobileOpen(false)}
              >
                {t(`nav.${key}`)}
              </a>
            ))}
            <div className="flex gap-3 pt-2">
              <LanguageToggle />
              <button
                onClick={() => navigate("/login")}
                className="flex-1 t-size3 font-medium text-slate-500 py-2 rounded-lg border border-slate-200"
              >
                {t("nav.signIn")}
              </button>
              <button
                onClick={() => navigate("/onboarding")}
                className="flex-1 t-size3 font-semibold text-white bg-green-600 py-2 rounded-lg"
              >
                {t("nav.getStarted")}
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
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 t-size2 font-semibold px-3 py-1.5 rounded-full mb-6 border border-green-200">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
              {t("landing.hero.eyebrow")}
            </div>
            <h1 className="t-size13 leading-[1.1] font-extrabold text-slate-900 tracking-tight mb-5">
              {t("landing.hero.titleBefore")}{" "}
              <span className="text-green-600">
                {t("landing.hero.titleAccent")}
              </span>{" "}
              {t("landing.hero.titleAfter")}
            </h1>
            <p className="t-size5 text-slate-500 leading-relaxed mb-8 max-w-md font-medium">
              {t("landing.hero.description")}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/onboarding")}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold t-size3 px-6 py-3 rounded-xl transition-colors shadow-lg shadow-green-600/20"
              >
                {t("landing.hero.startFree")}
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 text-slate-900 font-semibold t-size3 px-6 py-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-all"
              >
                {t("nav.signIn")}
                <ChevronRight size={16} className="text-slate-500" />
              </button>
            </div>

            {/* social proof mini */}
            <div className="flex items-center gap-3 mt-8">
              <div className="flex -space-x-2">
                {[
                  "photo-1494790108377-be9c29b29330",
                  "photo-1507003211169-0a1dd7228f2d",
                  "photo-1573497019940-1c28c88b4f3e",
                ].map((id) => (
                  <img
                    key={id}
                    src={`https://images.unsplash.com/${id}?w=40&h=40&fit=crop&auto=format`}
                    alt={t("landing.userAvatarAlt")}
                    className="w-8 h-8 rounded-full border-2 border-white object-cover bg-slate-100"
                  />
                ))}
              </div>
              <div>
                <div className="flex text-amber-400 t-size2 font-medium">
                  {"★★★★★"}
                </div>
                <p className="t-size2 text-slate-500 mt-0.5 font-medium">
                  {t("landing.hero.lovedBy")}{" "}
                  <span className="font-semibold text-slate-900">12,000+</span>{" "}
                  {t("landing.hero.users")}
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
            <p className="t-size2 font-semibold uppercase tracking-widest text-green-600 mb-3">
              {t("landing.features.eyebrow")}
            </p>
            <h2 className="t-size9 font-extrabold text-slate-900 tracking-tight">
              {t("landing.features.title")}
            </h2>
            <p className="mt-3 text-slate-500 t-size4 max-w-xl mx-auto font-medium">
              {t("landing.features.description")}
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
                    f.size === "col-span-2" ? "md:col-span-2" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: f.bg }}
                    >
                      <Icon size={18} style={{ color: f.color }} />
                    </div>
                    {f.tagKey && (
                      <span
                        className="t-size2 font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: f.bg, color: f.color }}
                      >
                        {t(`landing.features.items.${f.tagKey}`)}
                      </span>
                    )}
                  </div>
                  <h3 className="t-size4 font-semibold text-slate-900 mb-2">
                    {t(`landing.features.items.${f.key}.title`)}
                  </h3>
                  <p className="t-size3 text-slate-500 leading-relaxed font-medium">
                    {t(`landing.features.items.${f.key}.description`)}
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
            <p className="t-size2 font-semibold uppercase tracking-widest text-green-600 mb-3">
              {t("landing.howItWorks.eyebrow")}
            </p>
            <h2 className="t-size9 font-extrabold text-slate-900 tracking-tight">
              {t("landing.howItWorks.title")}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                key: "profile",
              },
              {
                step: "02",
                key: "habits",
              },
              {
                step: "03",
                key: "improve",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col gap-4">
                <span className="t-size10 font-extrabold text-slate-200 leading-none">
                  {item.step}
                </span>
                <h3 className="t-size5 font-semibold text-slate-900">
                  {t(`landing.howItWorks.steps.${item.key}.title`)}
                </h3>
                <p className="t-size3 text-slate-500 leading-relaxed font-medium">
                  {t(`landing.howItWorks.steps.${item.key}.description`)}
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
            <p className="t-size2 font-semibold uppercase tracking-widest text-green-600 mb-3">
              {t("landing.testimonials.eyebrow")}
            </p>
            <h2 className="t-size9 font-extrabold text-slate-900 tracking-tight">
              {t("landing.testimonials.title")}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
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
                <p className="t-size3 text-slate-600 leading-relaxed mb-6 italic font-medium">
                  &ldquo;
                  {t(`landing.testimonials.items.${testimonial.key}.quote`)}
                  &rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover bg-slate-100"
                  />
                  <div>
                    <p className="t-size3 font-semibold text-slate-900">
                      {testimonial.name}
                    </p>
                    <p className="t-size2 text-slate-400 font-medium">
                      {t(`landing.testimonials.items.${testimonial.key}.role`)}
                    </p>
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
                  "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
                backgroundSize: "60px 60px",
              }}
            />
            <div className="relative">
              <p className="text-green-100 t-size3 font-semibold uppercase tracking-widest mb-4">
                {t("landing.cta.eyebrow")}
              </p>
              <h2 className="t-size10 font-extrabold text-white tracking-tight mb-4">
                {t("landing.cta.title")}
              </h2>
              <p className="text-green-100 t-size4 max-w-md mx-auto mb-8 font-medium">
                {t("landing.cta.description")}
              </p>
              <div className="flex flex-wrap justify-center gap-3 mb-8">
                <button
                  onClick={() => navigate("/onboarding")}
                  className="inline-flex items-center gap-2 bg-white text-green-700 font-semibold t-size3 px-6 py-3 rounded-xl hover:bg-green-50 transition-colors shadow-md"
                >
                  {t("landing.hero.startFree")}
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center gap-2 border border-white/30 text-white font-semibold t-size3 px-6 py-3 rounded-xl hover:bg-white/10 transition-colors"
                >
                  {t("nav.signIn")}
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
              alt={t("landing.logoAlt")}
              className="w-7 h-7 object-contain"
            />
            <span className="t-size3 font-bold text-slate-900">Nutricca</span>
          </div>
          <p className="t-size2 text-slate-400 font-medium">
            {t("landing.footer", { year: new Date().getFullYear() })}
          </p>
        </div>
      </footer>
    </div>
  );
};
