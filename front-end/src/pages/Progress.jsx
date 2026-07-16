import { useState, useEffect } from 'react';
import { useApp } from '../hooks/useApp';
import { showLoading, showSuccess, showError, closeSwal } from '../utils/swal';
import {
  getDailyLogByDate,
  getNutritionLogsByDailyLogId,
  getGamificationApi,
  getWeightLogs,
  postWeightLog,
} from '../services/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

/* ── Sub-components ── */

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg py-2 px-3 text-xs shadow-lg">
      <div className="text-slate-400 mb-0.5">{label}</div>
      <div className="font-semibold text-green-600">{payload[0].value} kg</div>
    </div>
  );
};

const NutritionBar = ({ label, value, target, color }) => {
  const safeValue = typeof value === 'number' ? value : 0;
  const safeTarget = typeof target === 'number' && target > 0 ? target : 1;
  const pct =
    value === '-'
      ? 0
      : Math.min(Math.round((safeValue / safeTarget) * 100), 100);
  return (
    <div className="flex items-center gap-2.5">
      <div className="text-xs text-slate-700 w-24 shrink-0">{label}</div>
      <div className="flex-1 h-2 rounded bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <div className="text-xs text-slate-400 w-10 text-right">
        {value === '-' ? '-' : `${safeValue}${label === 'Water' ? 'ml' : 'g'}`}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, unit, sub, subColor }) => (
  <div className="bg-white border border-slate-200 rounded-xl py-3.5 px-4 shadow-sm">
    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
      {label}
    </div>
    <div className="text-xl font-bold text-slate-900 leading-tight">
      {value}
      {unit && value !== '-' && (
        <span className="text-xs font-medium text-slate-400 ml-1">{unit}</span>
      )}
    </div>
    {sub && (
      <div
        className="text-xs mt-1 font-medium"
        style={{ color: subColor || '#94A3B8' }}
      >
        {sub}
      </div>
    )}
  </div>
);

const StreakCard = ({ icon, value, label }) => (
  <div className="bg-green-50 rounded-xl py-3.5 px-3 text-center">
    <div className="text-xl mb-1.5">{icon}</div>
    <div className="text-2xl font-bold text-green-600 leading-none">
      {value}
    </div>
    <div className="text-xs text-green-700 mt-1 font-medium">{label}</div>
  </div>
);

const FilterBtn = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
      active
        ? 'bg-green-600 text-white border border-green-600'
        : 'bg-transparent text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-700'
    }`}
  >
    {label}
  </button>
);

const PERIODS = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '3 months', days: 90 },
];

/* ── Main ── */

export const Progress = () => {
  const { userProfile, progressData } = useApp();
  const [activePeriod, setActivePeriod] = useState('7 days');
  const [isLoading, setIsLoading] = useState(true);

  const [weightData, setWeightData] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [nutrition, setNutrition] = useState(null);
  const [gamification, setGamification] = useState(null);
  const [weightInput, setWeightInput] = useState('');
  const [savingWeight, setSavingWeight] = useState(false);

  const streak = gamification || progressData?.streak || {};
  const badges = gamification?.unlocked_badges || progressData?.badges || [];

  const today = new Date().toISOString().split('T')[0];

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
          weightRes.status === 'fulfilled'
            ? weightRes.value?.data?.weight_logs || []
            : [];
        setAllLogs(wlogs);
        buildWeightChart(wlogs, activePeriod);

        if (gamifRes.status === 'fulfilled') {
          setGamification(gamifRes.value?.data?.gamification || null);
        }

        const logId =
          logRes.status === 'fulfilled'
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
        console.error('Progress load error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const buildWeightChart = (logs, period) => {
    const days = PERIODS.find((p) => p.label === period)?.days || 7;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const filtered = logs.filter((l) => new Date(l.log_date) >= cutoff);
    setWeightData(
      filtered.map((l) => ({
        day: new Date(l.log_date).toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'numeric',
        }),
        weight: parseFloat(l.weight_kg),
      })),
    );
  };

  useEffect(() => {
    buildWeightChart(allLogs, activePeriod);
  }, [activePeriod, allLogs]);

  const handleLogWeight = async () => {
    if (!weightInput || parseFloat(weightInput) <= 0) return;
    setSavingWeight(true);
    showLoading('Saving weight...', 'Logging your weight entry.');
    try {
      await postWeightLog({
        weight_kg: parseFloat(weightInput),
        log_date: today,
      });
      setWeightInput('');
      const res = await getWeightLogs();
      const logs = res?.data?.weight_logs || [];
      setAllLogs(logs);
      buildWeightChart(logs, activePeriod);
      closeSwal();
      showSuccess('Weight Logged!', 'Your weight has been saved successfully.');
    } catch {
      closeSwal();
      showError('Failed to Save', 'Could not log your weight. Please try again.');
    } finally {
      setSavingWeight(false);
    }
  };

  const latestLog = allLogs.length > 0 ? allLogs[allLogs.length - 1] : null;
  const currentWeight = latestLog ? parseFloat(latestLog.weight_kg) : '-';
  const targetWeight = userProfile?.targetWeight ?? '-';
  const weightDiff =
    typeof currentWeight === 'number' && typeof targetWeight === 'number'
      ? (currentWeight - targetWeight).toFixed(1)
      : null;

  return (
    <div className="flex flex-col gap-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Health Progress
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track your health journey over time
          </p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {PERIODS.map((p) => (
            <FilterBtn
              key={p.label}
              label={p.label}
              active={activePeriod === p.label}
              onClick={() => setActivePeriod(p.label)}
            />
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Current weight"
          value={currentWeight}
          unit="kg"
          sub={
            weightDiff !== null
              ? `${weightDiff > 0 ? '+' : ''}${weightDiff} kg from target`
              : '-'
          }
          subColor={weightDiff <= 0 ? '#16A34A' : '#DC2626'}
        />
        <StatCard
          label="Target weight"
          value={targetWeight}
          unit="kg"
          sub={userProfile?.primaryGoal || '-'}
        />
        <StatCard
          label="BMI"
          value={userProfile?.bmi ?? '-'}
          sub={userProfile?.bmiCategory || '-'}
          subColor={
            userProfile?.bmiCategory === 'Normal' ? '#16A34A' : '#CA8A04'
          }
        />
        <StatCard
          label="Active streak"
          value={gamification?.current_streak ?? streak.consecutive ?? '-'}
          unit="days"
          sub={`Longest: ${gamification?.longest_streak ?? streak.longest ?? '-'} days`}
          subColor="#16A34A"
        />
      </div>

      {/* Weight log input */}
      <div className="bg-white border border-slate-200 rounded-xl py-3.5 px-5 flex items-center gap-3 flex-wrap shadow-sm">
        <div className="text-sm font-bold text-slate-900 shrink-0">
          ⚖️ Log today's weight
        </div>
        <input
          type="number"
          min="1"
          max="500"
          step="0.1"
          placeholder="e.g. 68.5"
          value={weightInput}
          onChange={(e) => setWeightInput(e.target.value)}
          className="px-3 py-1.5 border-2 border-slate-100 rounded-lg text-sm w-28 outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all"
        />
        <span className="text-xs text-slate-400">kg</span>
        <button
          onClick={handleLogWeight}
          disabled={savingWeight || !weightInput}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors ${
            weightInput
              ? 'bg-green-600 hover:bg-green-700 cursor-pointer'
              : 'bg-green-300 cursor-not-allowed'
          }`}
        >
          {savingWeight ? 'Saving...' : 'Save'}
        </button>
        <span className="text-xs text-slate-400 ml-auto">
          Current:{' '}
          {currentWeight !== '-' ? `${currentWeight} kg` : 'Not logged yet'} ·
          Target: {targetWeight !== '-' ? `${targetWeight} kg` : '-'}
        </span>
      </div>

      {/* Weight trend chart */}
      <div className="bg-white border border-slate-200 rounded-xl py-4 px-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-bold text-slate-900">Weight trend</div>
          <span className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full">
            {currentWeight !== '-' ? `${currentWeight} kg` : '-'} →{' '}
            {targetWeight !== '-' ? `${targetWeight} kg` : '-'}
          </span>
        </div>
        {weightData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={weightData}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                axisLine={false}
                tickLine={false}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#16A34A"
                strokeWidth={2.5}
                dot={{ fill: '#16A34A', r: 5, strokeWidth: 0 }}
                activeDot={{ r: 7, fill: '#16A34A' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-56 flex items-center justify-center text-slate-300 text-sm">
            {isLoading ? 'Loading...' : 'No data for this period'}
          </div>
        )}
      </div>

      {/* Nutrition + Streak & Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nutrition today */}
        <div className="bg-white border border-slate-200 rounded-xl py-4 px-5 shadow-sm">
          <div className="text-sm font-bold text-slate-900 mb-1">
            Today's nutrition
          </div>
          <div className="text-xs text-slate-400 mb-3.5">
            From all meals logged today
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="text-xs text-slate-700 w-24 shrink-0">
                Calories
              </div>
              <div className="flex-1 h-2 rounded bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded bg-green-600 transition-all duration-500"
                  style={{
                    width: `${Math.min(Math.round(((nutrition?.calories || 0) / 2000) * 100), 100)}%`,
                  }}
                />
              </div>
              <div className="text-xs text-slate-400 w-14 text-right">
                {nutrition?.calories || 0} kcal
              </div>
            </div>
            <NutritionBar
              label="Protein"
              value={nutrition?.protein ?? '-'}
              target={60}
              color="#22C55E"
            />
            <NutritionBar
              label="Carbs"
              value={nutrition?.carbs ?? '-'}
              target={250}
              color="#38BDF8"
            />
            <NutritionBar
              label="Fat"
              value={nutrition?.fat ?? '-'}
              target={65}
              color="#F59E0B"
            />
          </div>
          {!nutrition && (
            <div className="mt-3.5 text-xs text-slate-300 italic">
              No meals logged today.
            </div>
          )}
        </div>

        {/* Streak + Badges */}
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-xl py-4 px-5 shadow-sm">
            <div className="text-sm font-bold text-slate-900 mb-3">
              Streak &amp; consistency
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <StreakCard
                icon="🔥"
                value={
                  gamification?.current_streak ?? streak.consecutive ?? '-'
                }
                label="Days in a row"
              />
              <StreakCard
                icon="⚡"
                value={gamification?.xp_points ?? streak.total ?? '-'}
                label="Total XP"
              />
              <StreakCard
                icon="🏆"
                value={gamification?.longest_streak ?? streak.longest ?? '-'}
                label="Longest streak"
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl py-4 px-5 flex-1 shadow-sm">
            <div className="text-sm font-bold text-slate-900 mb-3">
              Achievements
            </div>
            <div className="flex flex-wrap gap-1.5">
              {badges.length > 0 ? (
                badges.map((badge, idx) => (
                  <div
                    key={idx}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      badge.earned
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-slate-50 text-slate-400 border border-slate-200'
                    }`}
                  >
                    <span className="text-[11px]">
                      {badge.earned ? '✓' : '🔒'}
                    </span>
                    {badge.name}
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400">
                  No badges earned yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
