import { useState, useEffect, useMemo } from "react";
import { useApp } from "../hooks/useApp";
import {
  showLoading,
  showSuccess,
  showError,
  closeFeedback,
} from "../shared/ui/feedback";
import {
  getDailyLogByDate,
  getNutritionLogsByDailyLogId,
  getGamificationApi,
  getWeightLogs,
  postWeightLog,
} from "../services/api";
import { todayInAppTimeZone } from "../shared/lib/date";
import { EChartsChart } from "../shared/ui/echarts-chart";
import { useLocale } from "../i18n/locale-context";

/* ── Sub-components ── */

const NutritionBar = ({ label, value, target, color }) => {
  const safeValue = typeof value === "number" ? value : 0;
  const safeTarget = typeof target === "number" && target > 0 ? target : 1;
  const pct =
    value === "-"
      ? 0
      : Math.min(Math.round((safeValue / safeTarget) * 100), 100);
  return (
    <div className="flex items-center gap-2.5">
      <div className="t-size2 text-slate-700 w-24 shrink-0 font-medium">
        {label}
      </div>
      <div className="flex-1 h-2 rounded bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <div className="t-size2 text-slate-400 w-10 text-right font-medium">
        {value === "-" ? "-" : `${safeValue}${label === "Water" ? "ml" : "g"}`}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, unit, sub, subColor }) => (
  <div className="bg-white border border-slate-200 rounded-xl py-3.5 px-4 shadow-sm">
    <div className="t-size2 font-semibold text-slate-400 uppercase tracking-wider mb-1">
      {label}
    </div>
    <div className="t-size6 font-bold text-slate-900 leading-tight">
      {value}
      {unit && value !== "-" && (
        <span className="t-size2 font-medium text-slate-400 ml-1">{unit}</span>
      )}
    </div>
    {sub && (
      <div
        className="t-size2 mt-1 font-medium"
        style={{ color: subColor || "#94A3B8" }}
      >
        {sub}
      </div>
    )}
  </div>
);

const StreakCard = ({ icon, value, label }) => (
  <div className="bg-green-50 rounded-xl py-3.5 px-3 text-center">
    <div className="t-size6 mb-1.5 font-medium">{icon}</div>
    <div className="t-size7 font-bold text-green-600 leading-none">{value}</div>
    <div className="t-size2 text-green-700 mt-1 font-medium">{label}</div>
  </div>
);

const FilterBtn = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3.5 py-1 rounded-full t-size2 font-semibold transition-all cursor-pointer ${
      active
        ? "bg-green-600 text-white border border-green-600"
        : "bg-transparent text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-700"
    }`}
  >
    {label}
  </button>
);

const PERIODS = [
  { key: "week", days: 7 },
  { key: "month", days: 30 },
  { key: "quarter", days: 90 },
];

const buildWeightChart = (logs, period, locale) => {
  const days = PERIODS.find((item) => item.key === period)?.days || 7;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return logs
    .filter((log) => new Date(log.log_date) >= cutoff)
    .map((log) => ({
      day: new Date(log.log_date).toLocaleDateString(
        locale === "id" ? "id-ID" : "en-US",
        {
          day: "2-digit",
          month: "numeric",
        },
      ),
      weight: Number.parseFloat(log.weight_kg),
    }));
};

/* ── Main ── */

export const Progress = () => {
  const { userProfile, progressData } = useApp();
  const { locale, t } = useLocale();
  const [activePeriod, setActivePeriod] = useState("week");
  const [isLoading, setIsLoading] = useState(true);

  const [allLogs, setAllLogs] = useState([]);
  const [nutrition, setNutrition] = useState(null);
  const [gamification, setGamification] = useState(null);
  const [weightInput, setWeightInput] = useState("");
  const [savingWeight, setSavingWeight] = useState(false);

  const streak = gamification || progressData?.streak || {};
  const badges = gamification?.unlocked_badges || progressData?.badges || [];

  const today = todayInAppTimeZone();
  const weightData = useMemo(
    () => buildWeightChart(allLogs, activePeriod, locale),
    [activePeriod, allLogs, locale],
  );
  const weightChartOption = useMemo(
    () => ({
      animationDuration: 450,
      grid: { top: 8, right: 8, bottom: 8, left: 24, containLabel: true },
      tooltip: {
        trigger: "axis",
        formatter: (params) =>
          t("progress.chartTooltip", {
            day: params[0].axisValue,
            weight: params[0].value,
          }),
      },
      xAxis: {
        type: "category",
        data: weightData.map(({ day }) => day),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#94A3B8", fontSize: 11 },
      },
      yAxis: {
        type: "value",
        scale: true,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: "#F1F5F9", type: "dashed" } },
        axisLabel: { color: "#94A3B8", fontSize: 11 },
      },
      series: [
        {
          type: "line",
          data: weightData.map(({ weight }) => weight),
          smooth: true,
          symbol: "circle",
          symbolSize: 10,
          lineStyle: { color: "#16A34A", width: 2.5 },
          itemStyle: { color: "#16A34A" },
          emphasis: { scale: true },
        },
      ],
    }),
    [t, weightData],
  );

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [weightRes, gamifRes, logRes] = await Promise.allSettled([
          getWeightLogs(),
          getGamificationApi(),
          getDailyLogByDate(today),
        ]);

        const wlogs =
          weightRes.status === "fulfilled"
            ? weightRes.value?.data?.weight_logs || []
            : [];
        setAllLogs(wlogs);

        if (gamifRes.status === "fulfilled") {
          setGamification(gamifRes.value?.data?.gamification || null);
        }

        const logId =
          logRes.status === "fulfilled"
            ? logRes.value?.data?.dailyLog?.id
            : null;
        if (logId) {
          try {
            const nutriRes = await getNutritionLogsByDailyLogId(logId);
            const logs = nutriRes?.data?.nutritionLogs || [];
            const totals = logs.reduce(
              (acc, n) => ({
                calories: acc.calories + (n.total_calories || 0),
                protein: acc.protein + (n.total_protein_g || 0),
                carbs: acc.carbs + (n.total_carbs_g || 0),
                fat: acc.fat + (n.total_fat_g || 0),
              }),
              { calories: 0, protein: 0, carbs: 0, fat: 0 },
            );
            setNutrition(totals);
          } catch {
            setNutrition(null);
          }
        }
      } catch (err) {
        console.error("Progress load error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [today]);

  const handleLogWeight = async () => {
    if (!weightInput || parseFloat(weightInput) <= 0) return;
    setSavingWeight(true);
    showLoading(t("progress.savingWeight"), t("progress.loggingWeight"));
    try {
      await postWeightLog({
        weight_kg: parseFloat(weightInput),
        log_date: today,
      });
      setWeightInput("");
      const res = await getWeightLogs();
      const logs = res?.data?.weight_logs || [];
      setAllLogs(logs);
      closeFeedback();
      showSuccess(t("progress.weightLogged"), t("progress.weightSaved"));
    } catch {
      closeFeedback();
      showError(t("progress.saveFailed"), t("progress.weightSaveFailed"));
    } finally {
      setSavingWeight(false);
    }
  };

  const latestLog = allLogs.length > 0 ? allLogs[allLogs.length - 1] : null;
  const currentWeight = latestLog ? parseFloat(latestLog.weight_kg) : "-";
  const targetWeight = userProfile?.targetWeight ?? "-";
  const weightDiff =
    typeof currentWeight === "number" && typeof targetWeight === "number"
      ? (currentWeight - targetWeight).toFixed(1)
      : null;

  return (
    <div className="flex flex-col gap-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="t-size6 font-bold text-slate-900 tracking-tight">
            {t("progress.title")}
          </h1>
          <p className="t-size3 text-slate-400 mt-1 font-medium">
            {t("progress.description")}
          </p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {PERIODS.map((p) => (
            <FilterBtn
              key={p.key}
              label={t(`progress.periods.${p.key}`)}
              active={activePeriod === p.key}
              onClick={() => setActivePeriod(p.key)}
            />
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label={t("progress.currentWeight")}
          value={currentWeight}
          unit="kg"
          sub={
            weightDiff !== null
              ? t("progress.fromTarget", {
                  value: `${weightDiff > 0 ? "+" : ""}${weightDiff}`,
                })
              : "-"
          }
          subColor={weightDiff <= 0 ? "#16A34A" : "#DC2626"}
        />
        <StatCard
          label={t("progress.targetWeight")}
          value={targetWeight}
          unit="kg"
          sub={userProfile?.primaryGoal || "-"}
        />
        <StatCard
          label="BMI"
          value={userProfile?.bmi ?? "-"}
          sub={userProfile?.bmiCategory || "-"}
          subColor={
            userProfile?.bmiCategory === "Normal" ? "#16A34A" : "#CA8A04"
          }
        />
        <StatCard
          label={t("progress.activeStreak")}
          value={gamification?.current_streak ?? streak.consecutive ?? "-"}
          unit={t("progress.days")}
          sub={t("progress.longest", {
            value: gamification?.longest_streak ?? streak.longest ?? "-",
          })}
          subColor="#16A34A"
        />
      </div>

      {/* Weight log input */}
      <div className="bg-white border border-slate-200 rounded-xl py-3.5 px-5 flex items-center gap-3 flex-wrap shadow-sm">
        <div className="t-size3 font-bold text-slate-900 shrink-0">
          ⚖️ {t("progress.logWeight")}
        </div>
        <input
          type="number"
          min="1"
          max="500"
          step="0.1"
          placeholder={t("progress.weightPlaceholder")}
          value={weightInput}
          onChange={(e) => setWeightInput(e.target.value)}
          className="px-3 py-1.5 border-2 border-slate-100 rounded-lg t-size3 w-28 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all font-medium"
        />
        <span className="t-size2 text-slate-400 font-medium">kg</span>
        <button
          onClick={handleLogWeight}
          disabled={savingWeight || !weightInput}
          className={`px-4 py-1.5 rounded-lg t-size2 font-semibold text-white transition-colors ${
            weightInput
              ? "bg-green-600 hover:bg-green-700 cursor-pointer"
              : "bg-green-300 cursor-not-allowed"
          }`}
        >
          {savingWeight ? t("progress.saving") : t("progress.save")}
        </button>
        <span className="t-size2 text-slate-400 ml-auto font-medium">
          {t("progress.current")}:{" "}
          {currentWeight !== "-"
            ? `${currentWeight} kg`
            : t("progress.notLogged")}{" "}
          ·{t("progress.target")}:{" "}
          {targetWeight !== "-" ? `${targetWeight} kg` : "-"}
        </span>
      </div>

      {/* Weight trend chart */}
      <div className="bg-white border border-slate-200 rounded-xl py-4 px-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="t-size3 font-bold text-slate-900">
            {t("progress.weightTrend")}
          </div>
          <span className="t-size2 font-semibold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full">
            {currentWeight !== "-" ? `${currentWeight} kg` : "-"} →{" "}
            {targetWeight !== "-" ? `${targetWeight} kg` : "-"}
          </span>
        </div>
        {weightData.length > 0 ? (
          <EChartsChart
            option={weightChartOption}
            className="h-[220px] w-full"
            ariaLabel={t("progress.weightTrendChart")}
          />
        ) : (
          <div className="h-56 flex items-center justify-center text-slate-300 t-size3 font-medium">
            {isLoading ? t("progress.loading") : t("progress.noData")}
          </div>
        )}
      </div>

      {/* Nutrition + Streak & Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nutrition today */}
        <div className="bg-white border border-slate-200 rounded-xl py-4 px-5 shadow-sm">
          <div className="t-size3 font-bold text-slate-900 mb-1">
            {t("progress.todayNutrition")}
          </div>
          <div className="t-size2 text-slate-400 mb-3.5 font-medium">
            {t("progress.nutritionDescription")}
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="t-size2 text-slate-700 w-24 shrink-0 font-medium">
                {t("progress.calories")}
              </div>
              <div className="flex-1 h-2 rounded bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded bg-green-600 transition-all duration-500"
                  style={{
                    width: `${Math.min(Math.round(((nutrition?.calories || 0) / 2000) * 100), 100)}%`,
                  }}
                />
              </div>
              <div className="t-size2 text-slate-400 w-14 text-right font-medium">
                {nutrition?.calories || 0} kcal
              </div>
            </div>
            <NutritionBar
              label={t("progress.protein")}
              value={nutrition?.protein ?? "-"}
              target={60}
              color="#22C55E"
            />
            <NutritionBar
              label={t("progress.carbs")}
              value={nutrition?.carbs ?? "-"}
              target={250}
              color="#38BDF8"
            />
            <NutritionBar
              label={t("progress.fat")}
              value={nutrition?.fat ?? "-"}
              target={65}
              color="#F59E0B"
            />
          </div>
          {!nutrition && (
            <div className="mt-3.5 t-size2 text-slate-300 italic font-medium">
              {t("progress.noMeals")}
            </div>
          )}
        </div>

        {/* Streak + Badges */}
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-xl py-4 px-5 shadow-sm">
            <div className="t-size3 font-bold text-slate-900 mb-3">
              {t("progress.streakConsistency")}
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <StreakCard
                icon="🔥"
                value={
                  gamification?.current_streak ?? streak.consecutive ?? "-"
                }
                label={t("progress.daysInRow")}
              />
              <StreakCard
                icon="⚡"
                value={gamification?.xp_points ?? streak.total ?? "-"}
                label={t("progress.totalXp")}
              />
              <StreakCard
                icon="🏆"
                value={gamification?.longest_streak ?? streak.longest ?? "-"}
                label={t("progress.longestStreak")}
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl py-4 px-5 flex-1 shadow-sm">
            <div className="t-size3 font-bold text-slate-900 mb-3">
              {t("progress.achievements")}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {badges.length > 0 ? (
                badges.map((badge, idx) => (
                  <div
                    key={idx}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full t-size2 font-medium ${
                      badge.earned
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-slate-50 text-slate-400 border border-slate-200"
                    }`}
                  >
                    <span className="t-size2 font-medium">
                      {badge.earned ? "✓" : "🔒"}
                    </span>
                    {badge.name}
                  </div>
                ))
              ) : (
                <div className="t-size2 text-slate-400 font-medium">
                  {t("progress.noBadges")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
