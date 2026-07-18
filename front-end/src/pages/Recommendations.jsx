import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getRecommendationByDateApi,
  generateDailyPlanApi,
} from "../services/api";
import { todayInAppTimeZone } from "../shared/lib/date";
import { useLocale } from "../i18n/locale-context";

/* ── Tag generator ─────────────────────────────────────── */
const generateTags = (nutrition = {}) => {
  const tags = [];
  if ((nutrition.fiber ?? 0) >= 8) tags.push("High Fiber");
  if ((nutrition.protein ?? 0) >= 20) tags.push("High Protein");
  if ((nutrition.sugar ?? 999) <= 5) tags.push("Low Sugar");
  if ((nutrition.calories ?? 9999) <= 400) tags.push("Low Calorie");
  if ((nutrition.sodium ?? 9999) <= 500) tags.push("Low Sodium");
  return tags;
};

const TAG_STYLE = {
  "High Fiber": { bg: "#F0FDF4", color: "#15803D" },
  "High Protein": { bg: "#EFF6FF", color: "#1D4ED8" },
  "Low Sugar": { bg: "#FAF5FF", color: "#6B21A8" },
  "Low Calorie": { bg: "#FFF7ED", color: "#C2410C" },
  "Low Sodium": { bg: "#F0FDF4", color: "#065F46" },
};

/* ── Meal Card ─────────────────────────────────────────── */
const MealCard = ({ meal, onViewRecipe, t }) => {
  const tags = generateTags(meal.nutrition);
  const n = meal.nutrition || {};

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col transition-shadow duration-150 hover:shadow-lg font-sans">
      {/* Image / emoji banner */}
      {meal.image_url ? (
        <img
          src={meal.image_url}
          alt={meal.name}
          className="w-full h-24 object-cover"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      ) : (
        <div className="h-24 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center t-size10 font-medium">
          {meal.emoji}
        </div>
      )}

      <div className="p-3.5 flex flex-col gap-2 flex-1">
        {/* Score + cuisine */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="t-size1 font-bold px-2 py-0.5 rounded-full bg-green-600 text-white">
            {t("recommendations.match", {
              score: (meal.recommendation_score * 100).toFixed(0),
            })}
          </span>
          {meal.cuisine_type && (
            <span className="t-size1 px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-medium">
              {meal.cuisine_type}
            </span>
          )}
        </div>

        {/* Name */}
        <div className="t-size3 font-bold text-slate-900 leading-snug">
          {meal.name}
        </div>

        {/* Health tag + protein */}
        <div className="flex gap-1.5 flex-wrap">
          {meal.health_tag && (
            <span className="t-size1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">
              {meal.health_tag}
            </span>
          )}
          {meal.main_protein_source && (
            <span className="t-size1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">
              🥩 {meal.main_protein_source}
            </span>
          )}
        </div>

        {/* Time + servings */}
        <div className="flex gap-2 t-size2 text-slate-400 font-medium">
          <span>⏰ {t("recommendations.minutes", { value: meal.total_time })}</span>
          <span>
            🍽 {t("recommendations.servings", { value: meal.servings })}
          </span>
        </div>

        {/* Macros */}
        <div className="grid grid-cols-4 gap-1 bg-slate-50 rounded-lg py-1.5 px-1">
          {[
            ["kcal", n.calories],
            ["pro", `${n.protein}g`],
            ["carb", `${n.carbs}g`],
            ["fat", `${n.fat}g`],
          ].map(([l, v]) => (
            <div key={l} className="text-center">
              <div className="t-size2 font-bold text-slate-900">{v}</div>
              <div className="t-size1 text-slate-400 uppercase font-medium">
                {l}
              </div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div className="t-size2 text-slate-500 leading-relaxed max-h-[38px] overflow-y-auto pr-0.5 font-medium">
          {meal.description}
        </div>

        {/* Auto-generated tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => {
              const s = TAG_STYLE[tag] || { bg: "#F5F5F5", color: "#6B7280" };
              return (
                <span
                  key={tag}
                  className="t-size1 font-medium px-2 py-0.5 rounded-full"
                  style={{ background: s.bg, color: s.color }}
                >
                  {t(`recommendations.tags.${tag}`)}
                </span>
              );
            })}
          </div>
        )}

        {/* View recipe button */}
        <button
          onClick={() => onViewRecipe(meal)}
          className="mt-auto py-2 rounded-lg bg-green-600 text-white t-size2 font-semibold w-full transition-colors hover:bg-green-700 cursor-pointer"
        >
          {t("recommendations.viewRecipe")}
        </button>
      </div>
    </div>
  );
};

/* ── Main Rekomendasi ──────────────────────────────────── */
export const Recommendations = () => {
  const navigate = useNavigate();
  const { t } = useLocale();
  const [refreshing, setRefreshing] = useState(false);
  const [mealPlan, setMealPlan] = useState([]);
  const [loadingPlan, setLoadingPlan] = useState(true);

  const today = todayInAppTimeZone();

  // Ambil data dari API
  useEffect(() => {
    const load = async () => {
      setLoadingPlan(true);
      try {
        const res = await getRecommendationByDateApi(today);
        const mealData =
          res?.data?.data?.recommendation?.meal_plan_json ||
          res?.data?.recommendation?.meal_plan_json ||
          [];
        setMealPlan(mealData);
      } catch (err) {
        if (err?.response?.status === 404) {
          try {
            const genRes = await generateDailyPlanApi(today);
            const newMealData =
              genRes?.data?.data?.recommendation?.meal_plan_json ||
              genRes?.data?.recommendation?.meal_plan_json ||
              [];
            setMealPlan(newMealData);
          } catch (genErr) {
            console.error("Generate failed:", genErr);
          }
        }
      } finally {
        setLoadingPlan(false);
      }
    };
    load();
  }, [today]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await generateDailyPlanApi(today);
      const refreshedMealData =
        res?.data?.data?.recommendation?.meal_plan_json ||
        res?.data?.recommendation?.meal_plan_json ||
        [];
      setMealPlan(refreshedMealData);
      console.log("Refresh berhasil! Data terbaru:", refreshedMealData);
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewRecipe = (meal) => {
    navigate(`/recommendation/recipe/${meal.id}`, { state: { meal } });
  };

  const normalizedMealPlan = mealPlan.map((m, index) => {
    const nutr = m.nutrition || {};
    const rec = m.recipe || {};
    const rawScore = m.recommendation_score;
    const boostedScore = rawScore > 0 ? Math.min(rawScore * 1.8, 0.99) : 0.85;

    return {
      id: m.id || m.recipe_id || `m${index}`,
      name: m.name || m.recipe_name || t("recommendations.unknownRecipe"),
      emoji: m.emoji || "🍽️",
      image_url: m.image_url || null,
      recommendation_score: boostedScore,
      cuisine_type: m.cuisine_type || t("recommendations.balanced"),
      health_tag: m.health_tag || t("recommendations.aiPick"),
      main_protein_source: m.main_protein_source || t("recommendations.mixed"),
      servings: m.servings || 1,
      total_time: m.total_time || 25,
      description:
        m.description ||
        rec.description ||
        t("recommendations.defaultDescription"),
      nutrition: {
        calories: Math.round(nutr.calories ?? m.calories ?? 0),
        protein: Math.round(nutr.protein ?? m.protein ?? 0),
        fat: Math.round(nutr.fat ?? m.fat ?? 0),
        carbs: Math.round(nutr.carbs ?? m.carbs ?? 0),
        fiber: Math.round(nutr.fiber ?? m.fiber ?? 0),
        sugar: Math.round(nutr.sugar ?? m.sugar ?? 0),
        sodium: Math.round(nutr.sodium ?? m.sodium ?? 0),
        cholesterol: Math.round(nutr.cholesterol ?? m.cholesterol ?? 0),
      },
      recipe: {
        description:
          rec.description ||
          m.description ||
          t("recommendations.recipeUnavailable"),
        ingredients:
          rec.ingredients && rec.ingredients.length > 0
            ? rec.ingredients
            : [t("recommendations.recipeUnavailable")],
        steps:
          rec.steps && rec.steps.length > 0
            ? rec.steps
            : [t("recommendations.defaultStep")],
      },
    };
  });

  return (
    <div className="flex flex-col gap-5 font-sans">
      {/* AI Banner */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-xl py-3.5 px-5 flex items-center justify-between shadow-md shadow-green-600/15">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <span className="t-size5 font-medium">✨</span>
          </div>
          <div>
            <div className="t-size3 font-bold text-white">
              {t("recommendations.banner.title")}
            </div>
            <div className="t-size2 text-white/80 mt-0.5 font-medium">
              {t("recommendations.banner.subtitle", { date: today })}
            </div>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing || loadingPlan}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-green-700 t-size2 font-bold transition-all ${
            refreshing || loadingPlan
              ? "opacity-70 cursor-not-allowed"
              : "hover:bg-green-50 cursor-pointer"
          }`}
        >
          <span className={refreshing ? "animate-spin inline-block" : ""}>
            ↻
          </span>
          {refreshing
            ? t("recommendations.refreshing")
            : t("recommendations.refresh")}
        </button>
      </div>

      {/* Header */}
      <div>
        <div className="t-size6 font-extrabold text-slate-900 tracking-tight">
          {t("recommendations.title")}
        </div>
        <div className="t-size3 text-slate-400 mt-0.5 font-medium">
          {t("recommendations.description")}
        </div>
      </div>

      {/* Grid State */}
      {loadingPlan ? (
        <div className="text-center py-14 text-slate-400 t-size3 font-medium">
          <div className="t-size8 mb-3 font-medium">✨</div>
          {t("recommendations.generating")}
        </div>
      ) : normalizedMealPlan.length === 0 ? (
        <div className="text-center py-14 text-slate-400 t-size3 font-medium">
          <div className="t-size8 mb-3 font-medium">🍽️</div>
          {t("recommendations.empty")}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {normalizedMealPlan.map((m) => (
            <MealCard key={m.id} meal={m} onViewRecipe={handleViewRecipe} t={t} />
          ))}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
