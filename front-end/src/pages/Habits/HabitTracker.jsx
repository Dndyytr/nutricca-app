import { useState, useEffect } from "react";
import { useApp } from "../../hooks/useApp";
import {
  getRecommendationByDateApi,
  generateDailyPlanApi,
  getDailyLogByDate,
  getActivitiesByDailyLog,
  getNutritionLogsByDailyLogId,
  addNutritionLog,
  deleteNutritionLog,
  postActivityLog,
  deleteActivityLog,
  updateDailyLog,
} from "../../services/api";
import { todayInAppTimeZone } from "../../shared/lib/date";
import { useLocale } from "../../i18n/locale-context";
import {
  MEAL_SLOTS,
  ACTIVITY_TYPES,
  calcSleepDuration,
  formatToHHMM,
} from "./constants";

const GOAL = 8;

export const HabitTracker = () => {
  const { dailyHealth, updateDailyHealth } = useApp();
  const { t } = useLocale();
  const today = todayInAppTimeZone();

  // Daily log
  const [dailyLogId, setDailyLogId] = useState(null);

  // Meal plan (AI)
  const [mealPlan, setMealPlan] = useState([]);
  const [loadingPlan, setLoadingPlan] = useState(false);

  // Nutrition
  const [nutritionList, setNutritionList] = useState([]);
  const [savingNutrition, setSavingNutrition] = useState(false);

  // Activity
  const [activityList, setActivityList] = useState([]);
  const [actType, setActType] = useState("Walking");
  const [actVal, setActVal] = useState(0);
  const [loadingAct, setLoadingAct] = useState(false);
  const [actError, setActError] = useState(null);

  // Hydration
  const [waterIntake, setWaterIntake] = useState(0);
  const [savedWaterIntake, setSavedWaterIntake] = useState(0);
  const [savingHydration, setSavingHydration] = useState(false);
  const [msgHydration, setMsgHydration] = useState("");

  // Sleep
  const [sleepStart, setSleepStart] = useState("");
  const [sleepEnd, setSleepEnd] = useState("");
  const [savedSleepStart, setSavedSleepStart] = useState("");
  const [savedSleepEnd, setSavedSleepEnd] = useState("");
  const [savingSleep, setSavingSleep] = useState(false);
  const [msgSleep, setMsgSleep] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoadingPlan(true);
      try {
        const res = await getRecommendationByDateApi(today);
        setMealPlan(res?.data?.recommendation?.meal_plan_json || []);
      } catch (err) {
        if (err?.response?.status === 404) {
          try {
            await generateDailyPlanApi(today);
            const res = await getRecommendationByDateApi(today);
            setMealPlan(res?.data?.recommendation?.meal_plan_json || []);
          } catch (e) {
            console.error("Generate failed:", e);
          }
        }
      } finally {
        setLoadingPlan(false);
      }

      try {
        const logRes = await getDailyLogByDate(today);
        const id = logRes.data?.dailyLog?.id;
        if (id) {
          setDailyLogId(id);
          const [actRes, nutriRes] = await Promise.all([
            getActivitiesByDailyLog(id),
            getNutritionLogsByDailyLogId(id),
          ]);
          setActivityList(actRes.data?.activityLogs || []);
          setNutritionList(nutriRes.data?.nutritionLogs || []);

          const glasses = (logRes.data?.dailyLog?.total_water_ml || 0) / 250;
          setWaterIntake(glasses);
          setSavedWaterIntake(glasses);

          const start = logRes.data?.dailyLog?.sleep_start_time;
          const end = logRes.data?.dailyLog?.sleep_end_time;
          if (start) {
            setSleepStart(formatToHHMM(start));
            setSavedSleepStart(formatToHHMM(start));
          }
          if (end) {
            setSleepEnd(formatToHHMM(end));
            setSavedSleepEnd(formatToHHMM(end));
          }
        }
      } catch (err) {
        console.error("Failed to load logs:", err);
      }
    };
    load();
  }, [today]);

  const meals = dailyHealth.meals || ["", "", ""];
  const sleepDuration = calcSleepDuration(sleepStart, sleepEnd);
  const totalGlassesToRender = Math.max(GOAL, waterIntake);
  const glasses = Array.from({ length: totalGlassesToRender }, (_, i) => i);

  /* ─── Nutrition ─── */
  const handleSaveNutrition = async () => {
    if (!dailyLogId) return;
    setSavingNutrition(true);
    const totals = meals.reduce(
      (acc, name) => {
        const m = mealPlan.find((x) => x.name === name);
        if (m?.nutrition) {
          acc.calories += m.nutrition.calories || 0;
          acc.protein += m.nutrition.protein || 0;
          acc.carbs += m.nutrition.carbs || 0;
          acc.fat += m.nutrition.fat || 0;
        }
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );

    const mealSlotsOrder = ["Breakfast", "Lunch", "Dinner"];
    const formattedMeals = meals
      .map((name, i) => ({ meal_type: mealSlotsOrder[i], food_name: name }))
      .filter((m) => m.food_name.trim() !== "");

    if (formattedMeals.length === 0) {
      alert(t("habits.tracker.selectMeal"));
      setSavingNutrition(false);
      return;
    }

    try {
      await addNutritionLog({
        daily_log_id: dailyLogId,
        meals: formattedMeals,
        total_calories: totals.calories,
        total_protein_g: totals.protein,
        total_carbs_g: totals.carbs,
        total_fat_g: totals.fat,
      });
      const res = await getNutritionLogsByDailyLogId(dailyLogId);
      setNutritionList(res.data?.nutritionLogs || []);
    } catch (err) {
      alert(err.response?.data?.message || t("habits.tracker.nutritionFailed"));
    } finally {
      setSavingNutrition(false);
    }
  };

  const handleDeleteNutrition = async (id) => {
    try {
      await deleteNutritionLog(id);
      setNutritionList((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Failed to delete nutrition:", err);
    }
  };

  /* ─── Activity ─── */
  const handleAddActivity = async () => {
    if (actVal <= 0 || !dailyLogId) return;
    setLoadingAct(true);
    setActError(null);
    try {
      await postActivityLog({
        daily_log_id: dailyLogId,
        activity_name: actType,
        input_value: actVal,
      });
      const res = await getActivitiesByDailyLog(dailyLogId);
      setActivityList(res.data?.activityLogs || []);
      setActVal(0);
    } catch (err) {
      setActError(
        err.response?.data?.message || t("habits.tracker.activityFailed"),
      );
    } finally {
      setLoadingAct(false);
    }
  };

  const handleDeleteActivity = async (id) => {
    try {
      await deleteActivityLog(id);
      setActivityList((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Failed to delete activity:", err);
    }
  };

  /* ─── Hydration ─── */
  const handleSaveHydration = async () => {
    if (!dailyLogId) return;
    setSavingHydration(true);
    setMsgHydration("");
    try {
      await updateDailyLog(dailyLogId, { total_water_ml: waterIntake * 250 });
      setSavedWaterIntake(waterIntake);
      setMsgHydration(t("habits.tracker.saved"));
    } catch {
      setMsgHydration(t("habits.tracker.saveFailed"));
    } finally {
      setTimeout(() => setMsgHydration(""), 3000);
      setSavingHydration(false);
    }
  };

  /* ─── Sleep ─── */
  const handleSaveSleep = async () => {
    if (!dailyLogId) return;
    setSavingSleep(true);
    setMsgSleep("");
    try {
      await updateDailyLog(dailyLogId, {
        sleep_start_time: sleepStart,
        sleep_end_time: sleepEnd,
      });
      setSavedSleepStart(sleepStart);
      setSavedSleepEnd(sleepEnd);
      setMsgSleep(t("habits.tracker.saved"));
    } catch {
      setMsgSleep(t("habits.tracker.saveFailed"));
    } finally {
      setTimeout(() => setMsgSleep(""), 3000);
      setSavingSleep(false);
    }
  };

  const summaryMetrics = [
    {
      label: t("habits.tracker.hydration"),
      value: Math.min(100, Math.round((waterIntake / GOAL) * 100)),
    },
    {
      label: t("habits.tracker.activity"),
      value: activityList.length > 0 ? 100 : 0,
    },
    {
      label: t("habits.tracker.nutrition"),
      value:
        meals.filter(Boolean).length > 0
          ? Math.round((meals.filter(Boolean).length / 3) * 100)
          : 0,
    },
  ];

  const totalsPreview = meals.reduce(
    (acc, name) => {
      const m = mealPlan.find((x) => x.name === name);
      if (m?.nutrition) {
        acc.calories += m.nutrition.calories || 0;
        acc.protein += m.nutrition.protein || 0;
        acc.carbs += m.nutrition.carbs || 0;
        acc.fat += m.nutrition.fat || 0;
      }
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const isDistance = ["Walking", "Running", "Cycling", "Swimming"].includes(
    actType,
  );

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {/* ─── Nutrition Card ─── */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="t-size3 font-bold text-slate-900 mb-4 tracking-tight">
            {t("habits.tracker.nutritionLog")}
          </div>
          <div className="flex flex-col gap-3">
            {MEAL_SLOTS.map(({ key, placeholder }, i) => (
              <div key={key} className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0" />
                <div className="flex-1">
                  <div className="t-size2 text-slate-400 mb-1 font-medium">
                    {t(`habits.tracker.mealSlots.${key}`)}
                  </div>
                  <select
                    value={meals[i] || ""}
                    onChange={(e) => {
                      const u = [...meals];
                      u[i] = e.target.value;
                      updateDailyHealth({ meals: u });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border-2 border-transparent rounded-lg t-size3 text-slate-900 focus:outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-200 cursor-pointer font-medium"
                    disabled={loadingPlan}
                  >
                    <option value="" disabled hidden>
                      {loadingPlan ? t("habits.tracker.loading") : placeholder}
                    </option>
                    {mealPlan.map((m) => (
                      <option key={m.id} value={m.name}>
                        {m.emoji} {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}

            {totalsPreview.calories > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3.5">
                <div className="flex justify-between border-b border-green-200 pb-2 mb-2.5">
                  <span className="t-size2 font-semibold text-green-700">
                    {t("habits.tracker.totalCalories")}
                  </span>
                  <span className="t-size4 font-bold text-green-600">
                    {totalsPreview.calories} kcal
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    ["Protein", totalsPreview.protein + "g"],
                    ["Carbs", totalsPreview.carbs + "g"],
                    ["Fat", totalsPreview.fat + "g"],
                  ].map(([l, v]) => (
                    <div key={l}>
                      <div className="t-size2 text-slate-400 font-semibold uppercase">
                        {l}
                      </div>
                      <div className="t-size3 font-bold text-slate-700 mt-0.5">
                        {v}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleSaveNutrition}
              disabled={savingNutrition || meals.every((m) => !m)}
              className={`w-full py-2 px-3 rounded-lg t-size2 font-semibold text-white transition-colors ${
                savingNutrition || meals.every((m) => !m)
                  ? "bg-green-300 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 cursor-pointer"
              }`}
            >
              {savingNutrition
                ? t("habits.tracker.saving")
                : t("habits.tracker.saveNutrition")}
            </button>

            <div className="border-t border-slate-100 pt-3">
              <div className="t-size2 font-semibold text-slate-400 mb-2">
                {t("habits.tracker.todayRecord")}
              </div>
              {nutritionList.length === 0 ? (
                <div className="t-size2 text-slate-300 italic font-medium">
                  {t("habits.tracker.noMeals")}
                </div>
              ) : (
                nutritionList.map((log) => (
                  <div
                    key={log.id}
                    className="bg-slate-50 p-2.5 rounded-md border border-slate-100 mb-2"
                  >
                    <div className="flex justify-between mb-1.5">
                      <div className="t-size2 font-semibold text-slate-700">
                        {t("habits.tracker.loggedMeals")}
                      </div>
                      <button
                        onClick={() => handleDeleteNutrition(log.id)}
                        className="text-red-500 t-size3 leading-none font-medium"
                      >
                        ×
                      </button>
                    </div>
                    <div className="t-size2 text-slate-500 flex flex-col gap-0.5 font-medium">
                      {log.meals?.map((m, idx) => (
                        <span key={idx}>
                          • {m.meal_type}: {m.food_name}
                        </span>
                      ))}
                    </div>
                    <div className="t-size2 text-green-600 font-semibold mt-1.5 flex gap-2">
                      <span>🔥 {log.total_calories} kcal</span>
                      <span className="t-size2 font-medium text-slate-400">
                        | P: {log.total_protein_g}g
                      </span>
                      <span className="t-size2 font-medium text-slate-400">
                        | F: {log.total_fat_g}g
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ─── Hydration Card ─── */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="t-size3 font-bold text-slate-900 mb-4 tracking-tight">
            {t("habits.tracker.hydrationTracker")}
          </div>
          <div className="text-center mb-4">
            <span className="t-size10 font-bold text-green-600 leading-none">
              {waterIntake}
            </span>
            <span className="t-size3 text-slate-400 ml-1.5 font-medium">
              {t("habits.tracker.ofGlasses", { goal: GOAL })}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mb-3">
            {glasses.map((i) => {
              const filled = i < waterIntake;
              const isExtra = i >= GOAL;
              return (
                <button
                  key={i}
                  onClick={() => setWaterIntake(filled ? i : i + 1)}
                  className={`w-9.5 h-9.5 rounded-lg flex items-center justify-center transition-all ${
                    filled
                      ? isExtra
                        ? "bg-green-400 text-white border-0"
                        : "bg-green-600 text-white border-0"
                      : "bg-transparent border-2 border-green-200 text-green-300"
                  }`}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C8 8 5 12 5 16a7 7 0 0014 0c0-4-3-8-7-14z" />
                  </svg>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setWaterIntake(waterIntake + 1)}
            className="w-full py-2 rounded-lg bg-green-50 border border-green-200 text-green-600 t-size3 font-semibold mb-2.5 hover:bg-green-100 transition-colors"
          >
            {t("habits.tracker.addGlass")}
          </button>
          {msgHydration && (
            <div
              className={`t-size2 font-medium text-center mb-2 ${
                msgHydration.includes("✅") ? "text-green-600" : "text-red-600"
              }`}
            >
              {msgHydration}
            </div>
          )}
          <button
            onClick={handleSaveHydration}
            disabled={savingHydration}
            className={`w-full py-2 rounded-lg t-size3 font-semibold text-white transition-colors ${
              savingHydration
                ? "bg-green-300 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 cursor-pointer"
            }`}
          >
            {savingHydration
              ? t("habits.tracker.saving")
              : t("habits.tracker.saveHydration")}
          </button>
          <div className="border-t border-slate-100 pt-3 mt-4">
            <div className="t-size2 font-semibold text-slate-400 mb-2">
              {t("habits.tracker.todayRecord")}
            </div>
            <div className="bg-slate-50 p-2.5 rounded-md border border-slate-100 t-size2 font-semibold text-slate-700">
              💧 {savedWaterIntake} {t("habits.tracker.glasses")}{" "}
              <span className="t-size2 font-normal text-slate-400">
                ({savedWaterIntake * 250} ml)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* ─── Activity Card ─── */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="t-size3 font-bold text-slate-900 mb-4 tracking-tight">
            {t("habits.tracker.activityLog")}
          </div>
          <div className="flex flex-col gap-3 mb-4">
            <div className="flex items-start gap-2.5">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0" />
              <div className="flex-1">
                <div className="t-size2 text-slate-400 mb-1 font-medium">
                  {t("habits.tracker.activityType")}
                </div>
                <select
                  value={actType}
                  onChange={(e) => setActType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-transparent rounded-lg t-size3 text-slate-900 focus:outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-200 cursor-pointer font-medium"
                >
                  {ACTIVITY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0" />
              <div className="flex-1">
                <div className="t-size2 text-slate-400 mb-1 font-medium">
                  {isDistance
                    ? t("habits.tracker.distance")
                    : t("habits.tracker.duration")}
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    step={isDistance ? 0.1 : 1}
                    value={actVal}
                    onChange={(e) => setActVal(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border-2 border-transparent rounded-lg t-size3 text-slate-900 focus:outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-200 text-center font-medium"
                  />
                  <span className="t-size2 text-slate-400 shrink-0 font-medium">
                    {isDistance ? "km" : "min"}
                  </span>
                </div>
              </div>
            </div>
            {actError && (
              <div className="t-size2 text-red-600 font-medium">{actError}</div>
            )}
            <button
              onClick={handleAddActivity}
              disabled={loadingAct || actVal <= 0}
              className={`py-2 px-3 rounded-lg t-size2 font-semibold text-white transition-colors ${
                actVal > 0
                  ? "bg-green-600 hover:bg-green-700 cursor-pointer"
                  : "bg-green-300 cursor-not-allowed"
              }`}
            >
              {loadingAct
                ? t("habits.tracker.saving")
                : t("habits.tracker.addActivity")}
            </button>
          </div>
          <div className="border-t border-slate-100 pt-3">
            <div className="t-size2 font-semibold text-slate-400 mb-2">
              {t("habits.tracker.todayRecord")}
            </div>
            {activityList.length === 0 ? (
              <div className="t-size2 text-slate-300 italic font-medium">
                {t("habits.tracker.noActivities")}
              </div>
            ) : (
              activityList.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between bg-slate-50 p-2 rounded-md border border-slate-100 mb-2"
                >
                  <div>
                    <div className="t-size2 font-semibold text-slate-700">
                      {log.activity_name}{" "}
                      <span className="t-size2 font-normal text-slate-400">
                        ({log.input_value}{" "}
                        {log.input_type === "distance" ? "km" : "min"})
                      </span>
                    </div>
                    <div className="t-size2 text-green-600 font-semibold mt-0.5">
                      🔥 {log.calories_burned} kcal
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteActivity(log.id)}
                    className="text-red-500 t-size3 leading-none p-1 font-medium"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ─── Sleep Card ─── */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="t-size3 font-bold text-slate-900 mb-4 tracking-tight">
            {t("habits.tracker.sleepLog")}
          </div>
          <div className="flex flex-col gap-3">
            {[
              { key: "sleepStart", labelKey: "bedtime", icon: "🌙" },
              { key: "sleepEnd", labelKey: "wakeUp", icon: "☀️" },
            ].map(({ key, labelKey, icon }) => (
              <div key={key} className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0" />
                <div className="flex-1">
                  <div className="t-size2 text-slate-400 mb-1 font-medium">
                    {icon} {t(`habits.tracker.${labelKey}`)}
                  </div>
                  <input
                    type="time"
                    value={key === "sleepStart" ? sleepStart : sleepEnd}
                    onChange={(e) =>
                      key === "sleepStart"
                        ? setSleepStart(e.target.value)
                        : setSleepEnd(e.target.value)
                    }
                    className="w-full px-3 py-2 bg-slate-50 border-2 border-transparent rounded-lg t-size3 text-slate-900 focus:outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-200 font-medium"
                  />
                </div>
              </div>
            ))}
          </div>
          {sleepDuration && (
            <div className="mt-3.5 flex items-center justify-between bg-green-50 rounded-lg py-2.5 px-3.5">
              <span className="t-size2 font-medium text-green-700">
                {t("habits.tracker.totalSleep")}
              </span>
              <span className="t-size3 font-bold text-green-600">
                {sleepDuration}
              </span>
            </div>
          )}
          {msgSleep && (
            <div
              className={`t-size2 font-medium text-center mt-3 ${
                msgSleep.includes("✅") ? "text-green-600" : "text-red-600"
              }`}
            >
              {msgSleep}
            </div>
          )}
          <button
            onClick={handleSaveSleep}
            disabled={savingSleep}
            className={`w-full py-2 mt-3 rounded-lg t-size3 font-semibold text-white transition-colors ${
              savingSleep
                ? "bg-green-300 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 cursor-pointer"
            }`}
          >
            {savingSleep
              ? t("habits.tracker.saving")
              : t("habits.tracker.saveSleep")}
          </button>
          {(savedSleepStart || savedSleepEnd) && (
            <div className="border-t border-slate-100 pt-3 mt-4">
              <div className="t-size2 font-semibold text-slate-400 mb-2">
                {t("habits.tracker.todayRecord")}
              </div>
              <div className="bg-slate-50 p-2.5 rounded-md border border-slate-100 flex items-center gap-2">
                <span className="t-size4 font-medium">🛌</span>
                <div className="t-size2 font-semibold text-slate-700">
                  {savedSleepStart || "--:--"} - {savedSleepEnd || "--:--"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── Summary Card ─── */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="t-size3 font-bold text-slate-900 mb-4 tracking-tight">
            {t("habits.tracker.summary")}
          </div>
          <div className="flex flex-col gap-3">
            {summaryMetrics.map(({ label, value }) => (
              <div key={label} className="flex items-center gap-2.5">
                <div className="t-size2 text-slate-700 w-18.5 shrink-0 font-medium">
                  {label}
                </div>
                <div className="flex-1 h-1.5 rounded bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded bg-green-600 transition-all duration-500"
                    style={{ width: `${value}%` }}
                  />
                </div>
                <div className="t-size2 text-slate-400 w-8.5 text-right shrink-0 font-medium">
                  {value}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
