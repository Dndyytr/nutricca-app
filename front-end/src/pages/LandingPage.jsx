import { useState, useEffect, useMemo, useRef } from "react";
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
  animationEasing: "cubicOut",
  grid: { top: 4, right: 2, bottom: 0, left: 2 },
  tooltip: {
    trigger: "axis",
    axisPointer: {
      type: "line",
      lineStyle: { color: "#86EFAC", width: 1 },
    },
    valueFormatter: (value) => t("landing.mockup.hours", { value }),
    backgroundColor: "#0F172A",
    borderWidth: 0,
    padding: [6, 8],
    textStyle: { color: "#FFFFFF", fontSize: 11, fontWeight: 500 },
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
      emphasis: { focus: "series" },
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
  delay = 0,
}) {
  const [animated, setAnimated] = useState(false);
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - ((animated ? pct : 0) / 100) * circ;

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="group flex flex-col items-center gap-2" title={label}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="h-17 w-17 -rotate-90 transition-transform duration-300 group-hover:scale-105 sm:h-22.5 sm:w-22.5 motion-reduce:transition-none"
        aria-label={`${label} ${sublabel}`}
      >
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
          style={{
            transition:
              "stroke-dashoffset 900ms cubic-bezier(0.22, 1, 0.36, 1)",
            transitionDelay: `${delay}ms`,
          }}
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
    <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="flex h-6 w-6 items-center justify-center rounded-lg transition-transform hover:scale-110 sm:h-7 sm:w-7"
          style={{
            background: i < filled ? "#DCFCE7" : "#F1F5F9",
            transition: `background-color 300ms ease ${i * 80}ms, transform 150ms ease`,
          }}
          title={`${i + 1}/${total}`}
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
  const [waterFilled, setWaterFilled] = useState(0);
  const { t } = useLocale();
  const chartOption = useMemo(() => getSleepChartOption(t), [t]);

  useEffect(() => {
    const timer = setTimeout(() => setWaterFilled(6), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="relative mx-auto w-full max-w-full rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xl sm:max-w-110 sm:p-5"
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
      <div className="mb-5 grid grid-cols-3 gap-1 rounded-xl bg-slate-50 p-2 sm:gap-2 sm:p-4">
        <ProgressRing
          pct={82}
          size={90}
          stroke={8}
          color="#16A34A"
          label="82%"
          sublabel={t("landing.mockup.calories")}
          delay={0}
        />
        <ProgressRing
          pct={67}
          size={90}
          stroke={8}
          color="#22C55E"
          label="67%"
          sublabel={t("landing.mockup.protein")}
          delay={120}
        />
        <ProgressRing
          pct={91}
          size={90}
          stroke={8}
          color="#15803D"
          label="91%"
          sublabel={t("landing.mockup.waterIntake")}
          delay={240}
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
            option={chartOption}
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

function Reveal({
  children,
  className = "",
  animation = "slide-in-from-bottom-6",
}) {
  const elementRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.unobserve(element);
      },
      { threshold: 0.15 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elementRef}
      className={`${className} ${
        visible
          ? `animate-in fade-in ${animation} duration-700 motion-reduce:animate-none`
          : "opacity-0"
      }`}
    >
      {children}
    </div>
  );
}

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
      className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900"
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
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
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
              className="t-size3 cursor-pointer font-medium text-slate-500 hover:text-slate-900 active:text-slate-900 px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-300 transition-all duration-300 ease-in-out active:border-slate-300 hover:-translate-y-0.5 active:scale-95"
            >
              {t("nav.signIn")}
            </button>
            <button
              onClick={() => navigate("/onboarding")}
              className="t-size3 cursor-pointer font-semibold text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-all active:bg-green-700 hover:-translate-y-0.5 active:scale-95 shadow-md shadow-green-600/20 duration-300 ease-in-out"
            >
              {t("nav.getStarted")}
            </button>
          </div>

          {/* mobile toggle */}
          <button
            className="relative flex size-7 bp360:size-7.25 bp400:size-7.5 md:size-7.75 cursor-pointer items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-all duration-300 ease-in-out hover:bg-slate-200 hover:text-slate-900 active:bg-slate-200 active:text-slate-900 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="landing-mobile-nav"
          >
            <Menu
              strokeWidth={2.5}
              className={`absolute size-6 bp360:size-6.25 bp400:size-6.5 md:size-6.75 transition-all duration-300 ${mobileOpen ? "rotate-90 scale-75 opacity-0" : "rotate-0 scale-100 opacity-100"}`}
            />
            <X
              strokeWidth={2.5}
              className={`absolute size-6 bp360:size-6.25 bp400:size-6.5 md:size-6.75 transition-all duration-300 ${mobileOpen ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-75 opacity-0"}`}
            />
          </button>
        </div>

        {/* mobile menu */}
        <div
          id="landing-mobile-nav"
          className={`overflow-hidden bg-white transition-[max-height,opacity] duration-400 ease-out md:hidden motion-reduce:transition-none ${mobileOpen ? "max-h-88 border-t border-slate-100 opacity-100" : "pointer-events-none max-h-0 opacity-0"}`}
        >
          <div className="flex flex-col gap-4 px-6 py-4">
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
            <div className="flex flex-wrap flex-col gap-3 pt-2">
              <LanguageToggle />
              <button
                onClick={() => navigate("/login")}
                className="flex-1 cursor-pointer t-size3 font-medium text-slate-500 py-2 rounded-lg border border-slate-200 hover:border-slate-300 transition-all duration-300 ease-in-out active:border-slate-300 hover:-translate-y-0.5 active:scale-95"
              >
                {t("nav.signIn")}
              </button>
              <button
                onClick={() => navigate("/onboarding")}
                className="flex-1 cursor-pointer t-size3 font-semibold text-white bg-green-600 hover:bg-green-700 active:bg-green-700 hover:-translate-y-0.5 active:scale-95 py-2 rounded-lg transition-all duration-300 ease-in-out"
              >
                {t("nav.getStarted")}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-12 pt-16 bp360:pt-17 bp400:pt-18 sm:px-6 sm:pb-20 sm:pt-19 md:pt-25">
        <div className="grid w-full min-w-0 items-center gap-10 md:grid-cols-2 md:gap-16">
          {/* left */}
          <div className="min-w-0 animate-in fade-in slide-in-from-left-6 duration-700 motion-reduce:animate-none">
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
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => navigate("/onboarding")}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 t-size3 font-semibold text-white shadow-lg shadow-green-600/20 transition-all duartion-300 ease-in-out hover:bg-green-700 active:bg-green-700 hover:-translate-y-0.5 active:scale-95 sm:w-auto"
              >
                {t("landing.hero.startFree")}
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3 t-size3 font-semibold text-slate-900 transition-all duration-300 ease-in-out hover:border-slate-300 active:border-slate-300 hover:-translate-y-0.5 active:scale-95 sm:w-auto"
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
          <div className="relative flex min-w-0 justify-center">
            {/* glow */}
            <div className="absolute inset-0 bg-green-100 rounded-3xl blur-3xl opacity-40 scale-90" />
            <div className="relative animate-in fade-in slide-in-from-right-6 duration-700 delay-200 fill-mode-backwards motion-reduce:animate-none">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES (BENTO) ── */}
      <section id="features" className="bg-white px-4 py-14 sm:px-6 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <Reveal animation="slide-in-from-bottom-6">
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
          </Reveal>

          {/* bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal
                  key={i}
                  className={f.size === "col-span-2" ? "md:col-span-2" : ""}
                  animation={
                    i % 2 === 0
                      ? "slide-in-from-left-6"
                      : "slide-in-from-right-6"
                  }
                >
                  <div className="group h-full bg-white rounded-2xl border border-slate-200/80 p-6 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
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
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section
        id="how-it-works"
        className="bg-slate-50 px-4 py-14 sm:px-6 sm:py-20"
      >
        <div className="max-w-6xl mx-auto">
          <Reveal animation="slide-in-from-left-6">
            <div className="text-center mb-14">
              <p className="t-size2 font-semibold uppercase tracking-widest text-green-600 mb-3">
                {t("landing.howItWorks.eyebrow")}
              </p>
              <h2 className="t-size9 font-extrabold text-slate-900 tracking-tight">
                {t("landing.howItWorks.title")}
              </h2>
            </div>
          </Reveal>

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
            ].map((item, i) => (
              <Reveal
                key={item.step}
                animation={
                  i % 2 === 0 ? "slide-in-from-left-6" : "slide-in-from-right-6"
                }
              >
                <div className="flex flex-col gap-4">
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
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section
        id="testimonials"
        className="bg-white px-4 py-14 sm:px-6 sm:py-20"
      >
        <div className="max-w-6xl mx-auto">
          <Reveal animation="slide-in-from-right-6">
            <div className="text-center mb-14">
              <p className="t-size2 font-semibold uppercase tracking-widest text-green-600 mb-3">
                {t("landing.testimonials.eyebrow")}
              </p>
              <h2 className="t-size9 font-extrabold text-slate-900 tracking-tight">
                {t("landing.testimonials.title")}
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <Reveal
                key={testimonial.name}
                animation={
                  i % 2 === 0 ? "slide-in-from-left-6" : "slide-in-from-right-6"
                }
              >
                <div className="h-full bg-white rounded-2xl border border-slate-200/80 p-6 hover:shadow-lg transition-shadow">
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
                        {t(
                          `landing.testimonials.items.${testimonial.key}.role`,
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-slate-50 px-4 py-14 sm:px-6 sm:py-20">
        <Reveal className="max-w-6xl mx-auto" animation="slide-in-from-top-6">
          <div className="relative overflow-hidden rounded-3xl bg-green-600 px-5 py-10 text-center shadow-xl shadow-green-600/20 sm:px-10 sm:py-16">
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
              <div className="mb-8 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  onClick={() => navigate("/onboarding")}
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 t-size3 font-semibold text-green-700 shadow-md transition-all duration-300 ease-in-out hover:bg-green-50 active:bg-green-50 hover:-translate-y-0.5 active:scale-95 sm:w-auto"
                >
                  {t("landing.hero.startFree")}
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/30 px-6 py-3 t-size3 font-semibold text-white transition-all duration-300 ease-in-out hover:bg-white/10 active:bg-white/10 hover:-translate-y-0.5 active:scale-95 sm:w-auto"
                >
                  {t("nav.signIn")}
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-200 bg-white px-4 py-10 sm:px-6">
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
