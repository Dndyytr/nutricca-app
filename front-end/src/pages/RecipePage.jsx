import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getRecommendationByDateApi } from '../services/api';

/* ─── SVG Icons ──────────────────────────────────────── */
const Icons = {
  Back: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  Star: () => (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  Flame: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0011 17c1.38 0 2.5-1.12 2.5-2.5 0-1.38-.77-2.77-2.5-4.5-1.73 1.73-2.5 3.12-2.5 4.5z" />
      <path d="M12 22c4.97 0 9-4.03 9-9 0-3.5-2-6.5-5-8.5 0 2-1 4-3 5.5C11 8 9 5 9 3c-3 2-5 5-5 8.5C4 17.97 8.03 22 12 22z" />
    </svg>
  ),
  Activity: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  Droplet: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" />
    </svg>
  ),
  Heart: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  ),
  Grid: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  Leaf: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 8C8 10 5.9 16.17 3.82 19.34l1.4.92a1 1 0 001.35-.24 6.99 6.99 0 0011.46-8 1 1 0 01-.03-1.02z" />
    </svg>
  ),
  Zap: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Salt: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 2h6l1 7H8L9 2z" />
      <path d="M8 9a5 5 0 000 10h8a5 5 0 000-10" />
    </svg>
  ),
  Circle: () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
  FileText: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  Cart: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  ),
  CookingPot: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12h20" />
      <path d="M20 12v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8" />
      <path d="M4 12V8a8 8 0 0116 0v4" />
      <path d="M15 2l1 2" />
      <path d="M9 2l-1 2" />
    </svg>
  ),
  Tag: () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
};

/* ─── Nutrition icon map ── */
const nutrIcons = {
  calories: <Icons.Flame />,
  protein: <Icons.Activity />,
  fat: <Icons.Droplet />,
  saturated: <Icons.Heart />,
  carbs: <Icons.Grid />,
  fiber: <Icons.Leaf />,
  sugar: <Icons.Zap />,
  sodium: <Icons.Salt />,
  cholesterol: <Icons.Circle />,
};

/* ─── Component ──────────────────────────────────────── */
export const RecipePage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const [meal, setMeal] = useState(state?.meal || null);
  const [loading, setLoading] = useState(!state?.meal);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (meal) return;

    const fetchRecipeFromPlan = async () => {
      setLoading(true);
      try {
        const today = new Date().toISOString().split('T')[0];
        const res = await getRecommendationByDateApi(today);
        const plan = res?.data?.recommendation?.meal_plan_json || [];

        const found = plan.find(
          (m) =>
            String(m.recipe_id) === String(id) || String(m.id) === String(id),
        );

        if (found) {
          setMeal({
            id: found.recipe_id || found.id,
            name: found.recipe_name || found.name || 'Unknown Recipe',
            emoji: '🍽️',
            image_url: found.image_url || null,
            recommendation_score:
              found.recommendation_score > 0
                ? found.recommendation_score
                : 0.85,
            cuisine_type: found.cuisine_type || 'Balanced',
            health_tag: found.health_tag || 'AI Pick',
            main_protein_source: found.main_protein_source || 'Mixed',
            servings: found.servings || 1,
            description:
              found.description ||
              'A nutritious and balanced meal recommended by your AI plan for sustained energy.',
            nutrition: {
              calories: Math.round(found.calories || 0),
              protein: Math.round(found.protein || 0),
              fat: Math.round(found.fat || 0),
              carbs: Math.round(found.carbs || 0),
              fiber: Math.round(found.fiber || 0),
              sugar: Math.round(found.sugar || 0),
              sodium: Math.round(found.sodium || 0),
              cholesterol: Math.round(found.cholesterol || 0),
            },
            recipe: found.recipe || {
              description:
                'Recipe details are currently generated by AI. Enjoy your healthy meal!',
              ingredients: [
                'Follow detailed recipe link or check standard preparations.',
                'Salt and pepper to taste.',
                'Olive oil for cooking.',
              ],
              steps: [
                'Prepare and wash all ingredients.',
                'Cook according to standard procedures.',
                'Serve warm and enjoy!',
              ],
            },
            
          });
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to fetch recipe:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeFromPlan();
  }, [id, meal]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-sm text-slate-400">Loading recipe...</div>
      </div>
    );
  }

  if (error || !meal) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="text-sm text-slate-400 mb-4">Recipe not found.</div>
          <button
            onClick={() => navigate('/recommendations')}
            className="px-5 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors cursor-pointer"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  const n = meal.nutrition || {};
  const r = meal.recipe || {};

  const nutrRows = [
    { key: 'calories', label: 'Calories', val: n.calories, unit: 'kcal' },
    { key: 'protein', label: 'Protein', val: n.protein, unit: 'g' },
    { key: 'fat', label: 'Fat', val: n.fat, unit: 'g' },
    { key: 'saturated', label: 'Saturated Fat', val: n.saturated, unit: 'g' },
    { key: 'carbs', label: 'Carbohydrates', val: n.carbs, unit: 'g' },
    { key: 'fiber', label: 'Fiber', val: n.fiber, unit: 'g' },
    { key: 'sugar', label: 'Sugar', val: n.sugar, unit: 'g' },
    { key: 'sodium', label: 'Sodium', val: n.sodium, unit: 'mg' },
    {
      key: 'cholesterol',
      label: 'Cholesterol',
      val: n.cholesterol,
      unit: 'mg',
    },
  ];

  return (
    <div className="min-h-screen font-sans">
      <div className="max-w-[860px] mx-auto py-3 pb-14 max-[560px]:px-4 max-[560px]:py-6 max-[560px]:pb-10">
        {/* Back */}
        <button
          onClick={() => navigate('/recommendations')}
          className="inline-flex items-center gap-1.5 text-green-600 text-sm font-medium mb-5 hover:opacity-70 transition-opacity cursor-pointer bg-transparent border-0 p-0"
        >
          <Icons.Back /> Back to recommendations
        </button>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          <span className="inline-flex items-center gap-1 bg-gradient-to-br from-green-600 to-green-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            <Icons.Star />{' '}
            {((meal.recommendation_score || 0.85) * 100).toFixed(0)}% match
          </span>
          {meal.cuisine_type && (
            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-sky-50 text-sky-700 border border-sky-200">
              {meal.cuisine_type}
            </span>
          )}
          {meal.health_tag && (
            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-green-50 text-green-700 border border-green-200">
              {meal.health_tag}
            </span>
          )}
          {meal.main_protein_source && (
            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-medium bg-amber-50 text-amber-700 border border-amber-200">
              {meal.main_protein_source}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl font-extrabold text-slate-900 mb-6 tracking-tight max-[560px]:text-2xl">
          {meal.name}
        </h1>

        {/* ── Nutrition box: image left + nutrition list right ── */}
        <div className="bg-slate-100 rounded-2xl p-5 mb-4 flex gap-5 items-start max-[560px]:flex-col">
          {/* Food image / emoji */}
          <div className="w-40 h-40 rounded-xl bg-slate-200 flex items-center justify-center shrink-0 text-6xl overflow-hidden max-[560px]:w-full max-[560px]:h-44">
            {meal.image_url ? (
              <img
                src={meal.image_url}
                alt={meal.name}
                className="w-full h-full object-cover"
              />
            ) : (
              meal.emoji || '🍽'
            )}
          </div>

          {/* Nutrition list */}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-slate-700 mb-2.5 uppercase tracking-wider">
              Contains:
            </div>
            <div className="flex flex-col gap-1">
              {nutrRows.map(({ key, label, val, unit }) => {
                const display =
                  val !== null && val !== undefined && val !== '' ? val : null;
                if (display === null) return null;
                return (
                  <div
                    key={key}
                    className="flex items-center gap-2 text-sm leading-snug"
                  >
                    <span className="text-green-600 flex items-center shrink-0">
                      {nutrIcons[key]}
                    </span>
                    <span>
                      <span className="font-bold text-slate-800">
                        {display}
                        {unit}{' '}
                      </span>
                      <span className="text-slate-600">{label}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Description ── */}
        <div className="bg-slate-100 rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-green-600 shrink-0 shadow-sm">
              <Icons.FileText />
            </div>
            <span className="text-base font-bold text-slate-900 tracking-tight">
              Description
            </span>
          </div>
          <p className="text-sm text-slate-600 leading-7">{meal.description}</p>
        </div>

        {/* ── Ingredients ── */}
        <div className="bg-slate-100 rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-green-600 shrink-0 shadow-sm">
              <Icons.Cart />
            </div>
            <span className="text-base font-bold text-slate-900 tracking-tight">
              Ingredients
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {(r.ingredients || []).map((ing, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 text-sm text-slate-700"
              >
                <span className="w-[22px] h-[22px] rounded-md shrink-0 bg-white border border-green-300 flex items-center justify-center text-[11px] font-bold text-green-600 shadow-sm">
                  {i + 1}
                </span>
                {ing}
              </div>
            ))}
          </div>
        </div>

        {/* ── Steps ── */}
        <div className="bg-slate-100 rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-green-600 shrink-0 shadow-sm">
              <Icons.CookingPot />
            </div>
            <span className="text-base font-bold text-slate-900 tracking-tight">
              How to cook
            </span>
          </div>
          <div className="flex flex-col gap-2.5">
            {(r.steps || []).map((step, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div
                  className={`w-[26px] h-[26px] rounded-lg shrink-0 flex items-center justify-center text-[11.5px] font-bold mt-0.5 ${
                    i % 2 === 0
                      ? 'bg-gradient-to-br from-green-600 to-green-500 text-white shadow-md shadow-green-600/20'
                      : 'bg-white border border-green-300 text-green-700'
                  }`}
                >
                  {i + 1}
                </div>
                <p className="text-sm text-slate-700 leading-7 pt-1">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
