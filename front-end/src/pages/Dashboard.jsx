import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import {
  getTodayScheduleApi,
  getDailyLogByDate,
  getActivitiesByDailyLog,
  getNutritionLogsByDailyLogId,
  getWeightLogs,
} from '../services/api';

/* ── Sub-components ── */

const MetricCard = ({ label, value, unit, sub, subColor = '#94A3B8', barPct, barColor = '#38BDF8' }) => (
  <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.04)' }}>
    <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', marginBottom: 6, letterSpacing: '0.03em', textTransform: 'uppercase' }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
      {value}
      {unit && <span style={{ fontSize: 12, fontWeight: 500, color: '#94A3B8', marginLeft: 5 }}>{unit}</span>}
    </div>
    {sub && <div style={{ fontSize: 11, color: subColor, marginTop: 6, fontWeight: 500 }}>{sub}</div>}
    {barPct !== undefined && (
      <div style={{ height: 4, borderRadius: 4, background: '#F1F5F9', marginTop: 12, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${Math.min(barPct, 100)}%`, background: barColor, borderRadius: 4, transition: 'width 0.6s ease-out' }} />
      </div>
    )}
  </div>
);

const HABIT_TYPE = {
  food:  { bg: '#F0FDF4', color: '#15803D', label: 'Food' },
  water: { bg: '#EFF6FF', color: '#1D4ED8', label: 'Water' },
  sport: { bg: '#F0FDF4', color: '#166534', label: 'Sport' },
  sleep: { bg: '#FAF5FF', color: '#6B21A8', label: 'Sleep' },
};

/* ── Main Dashboard ── */

export const Dashboard = () => {
  const { userProfile } = useApp();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [dailyLogId, setDailyLogId] = useState(null);
  const [waterMl, setWaterMl] = useState(0);
  const [caloriesIn, setCaloriesIn] = useState(0);
  const [caloriesOut, setCaloriesOut] = useState(0);
  const [habits, setHabits] = useState([]);
  const [initialWeight, setInitialWeight] = useState(null);
  const [currentWeight, setCurrentWeight] = useState(null);

  const today = new Date().toISOString().split('T')[0];
  const waterTarget = userProfile?.dailyWaterIntakeGoal || 2000;
  const waterGlasses = Math.round(waterMl / 250);
  const waterGoalGlasses = Math.round(waterTarget / 250);
  const waterPct = Math.round((waterMl / waterTarget) * 100);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        // 1. Today schedule (lazy init daily log)
        const schedRes = await getTodayScheduleApi();
        const progress = schedRes?.data?.progress;
        setWaterMl(progress?.water_ml || 0);
        setCaloriesIn(progress?.calories_in || 0);
        setCaloriesOut(progress?.calories_out || 0);

        // 2. Get daily log id for today
        const logRes = await getDailyLogByDate(today);
        const logId = logRes?.data?.dailyLog?.id;
        setDailyLogId(logId);

        // 3. Nutrition + Activity logs untuk habits
        let nutritionLogs = [];
        let activityLogs = [];
        let sleepStart = null;

        if (logId) {
          const [nutriRes, actRes] = await Promise.allSettled([
            getNutritionLogsByDailyLogId(logId),
            getActivitiesByDailyLog(logId),
          ]);
          nutritionLogs = nutriRes.status === 'fulfilled' ? (nutriRes.value?.data?.nutritionLogs || []) : [];
          activityLogs = actRes.status === 'fulfilled' ? (actRes.value?.data?.activityLogs || []) : [];
          sleepStart = logRes?.data?.dailyLog?.sleep_start_time || null;
        }

        // 4. Build today's habits dari data real
        const loggedMealTypes = nutritionLogs.flatMap((n) => (n.meals || []).map((m) => m.meal_type?.toLowerCase()));
        buildHabits(loggedMealTypes, progress?.water_ml || 0, waterTarget, activityLogs, sleepStart);

        // 5. Weight logs — current dari log terbaru, initial dari userProfile
        const wRes = await getWeightLogs().catch(() => null);
        const wLogs = wRes?.data?.weight_logs || [];
        if (wLogs.length > 0) {
          setCurrentWeight(parseFloat(wLogs[wLogs.length - 1].weight_kg));
        } else {
          setCurrentWeight(userProfile?.weight || null);
        }
        // Initial weight selalu dari profil (basic identity saat onboarding)
        setInitialWeight(userProfile?.weight || null);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [userProfile?.weight]);

  const buildHabits = (loggedMealTypes, waterMlVal, waterTargetVal, activityLogs, sleepStart) => {
    setHabits([
      {
        id: 'breakfast',
        name: 'Breakfast',
        time: '07:00',
        type: 'food',
        completed: loggedMealTypes.includes('breakfast'),
      },
      {
        id: 'lunch',
        name: 'Lunch',
        time: '12:00',
        type: 'food',
        completed: loggedMealTypes.includes('lunch'),
      },
      {
        id: 'dinner',
        name: 'Dinner',
        time: '19:00',
        type: 'food',
        completed: loggedMealTypes.includes('dinner'),
      },
      {
        id: 'water',
        name: `Drink water (${Math.round(waterTargetVal / 1000 * 10) / 10}L goal)`,
        time: 'All day',
        type: 'water',
        completed: waterMlVal >= waterTargetVal,
      },
      {
        id: 'activity',
        name: 'Exercise / Activity',
        time: 'Any time',
        type: 'sport',
        completed: activityLogs.length > 0,
      },
      {
        id: 'sleep',
        name: 'Log sleep time',
        time: '22:00',
        type: 'sleep',
        completed: !!sleepStart,
      },
    ]);
  };

  const done = habits.filter((h) => h.completed).length;

  if (isLoading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        Memuat aktivitas hari ini...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* AI Banner */}
      <div style={{ background: 'linear-gradient(135deg, #16A34A 0%, #22C55E 100%)', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.15), 0 2px 4px -2px rgba(22, 163, 74, 0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.01em' }}>Your daily plan is ready!</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 3, fontWeight: 500 }}>AI has generated today's personalized recommendations</div>
          </div>
        </div>
        <button onClick={() => navigate('/recommendations')} style={{ background: '#FFFFFF', color: '#15803D', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'all 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#F0FDF4'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}>
          View plan →
        </button>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <MetricCard
          label="Initial weight"
          value={initialWeight ?? '-'}
          unit={initialWeight ? 'kg' : ''}
          sub={initialWeight ? `First recorded weight` : 'No weight logged yet'}
          barColor="#94A3B8"
        />
        <MetricCard
          label="Current weight"
          value={currentWeight ?? userProfile?.weight ?? '-'}
          unit={currentWeight || userProfile?.weight ? 'kg' : ''}
          sub={initialWeight && currentWeight
            ? `${(currentWeight - initialWeight) > 0 ? '+' : ''}${(currentWeight - initialWeight).toFixed(1)} kg from initial`
            : userProfile?.targetWeight ? `Target: ${userProfile.targetWeight} kg` : '-'}
          subColor={initialWeight && currentWeight
            ? (currentWeight - initialWeight) <= 0 ? '#16A34A' : '#DC2626'
            : '#94A3B8'}
          barPct={userProfile?.targetWeight && currentWeight
            ? Math.round((currentWeight / userProfile.targetWeight) * 100)
            : undefined}
          barColor="#16A34A"
        />
        <MetricCard
          label="Water intake today"
          value={`${waterGlasses} / ${waterGoalGlasses}`}
          unit="glasses"
          sub={`${waterMl} ml · ${waterPct}% of daily goal`}
          subColor={waterMl >= waterTarget ? '#16A34A' : '#CA8A04'}
          barPct={waterPct}
          barColor="#38BDF8"
        />
      </div>

      {/* Today's habits */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, padding: '20px 22px', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>Today's habits</div>
          <span style={{ fontSize: 11, fontWeight: 700, background: '#F0FDF4', color: '#15803D', padding: '3px 10px', borderRadius: 99 }}>
            {done}/{habits.length}
          </span>
        </div>
        <div>
          {habits.map((h) => {
            const t = HABIT_TYPE[h.type] || HABIT_TYPE.food;
            return (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, background: h.completed ? '#16A34A' : 'transparent', border: h.completed ? 'none' : '2px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                  {h.completed && (
                    <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: h.completed ? '#94A3B8' : '#0F172A', textDecoration: h.completed ? 'line-through' : 'none', transition: 'color 0.2s' }}>{h.name}</div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2, fontWeight: 500 }}>{h.time}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: t.bg, color: t.color, flexShrink: 0, letterSpacing: '0.02em' }}>{t.label}</span>
              </div>
            );
          })}
        </div>
        <button onClick={() => navigate('/habits')} style={{ width: '100%', marginTop: 14, padding: '10px', borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: 12, fontWeight: 600, color: '#334155', cursor: 'pointer', transition: 'all 0.15s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.borderColor = '#CBD5E1'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0'; }}>
          Update today's habits →
        </button>
      </div>

      {/* Calorie balance */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 14, padding: '18px 22px', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.04)' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', marginBottom: 16, letterSpacing: '-0.01em' }}>Calorie balance</div>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 14, alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          {[
            { label: 'Calories in', value: caloriesIn, color: '#0F172A' },
            { label: '−', value: null },
            { label: 'Burned', value: caloriesOut, color: '#0F172A' },
            { label: '=', value: null },
            { label: 'Net', value: caloriesIn - caloriesOut, color: '#16A34A' },
          ].map((item, i) =>
            item.value === null ? (
              <div key={i} style={{ display: 'flex', alignItems: 'center', color: '#CBD5E1', fontSize: 20, fontWeight: 700 }}>{item.label}</div>
            ) : (
              <div key={i} style={{ textAlign: 'center', minWidth: 80 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: item.color, letterSpacing: '-0.02em' }}>{item.value.toLocaleString()}</div>
                <div style={{ fontSize: 10, color: '#94A3B8', marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{item.label}</div>
              </div>
            )
          )}
        </div>
        <div style={{ height: 6, borderRadius: 6, background: '#F1F5F9', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(Math.round((caloriesIn / (userProfile?.calorieTarget || 2000)) * 100), 100)}%`, background: '#16A34A', borderRadius: 6, transition: 'width 0.6s ease-out' }} />
        </div>
        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 6, textAlign: 'right', fontWeight: 500 }}>
          {caloriesOut} kcal burned
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/habits')} style={{ flex: '1 1 140px', padding: '10px 16px', borderRadius: 10, background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: 12, fontWeight: 600, color: '#334155', cursor: 'pointer', transition: 'all 0.15s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.borderColor = '#CBD5E1'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0'; }}>
          Update habits
        </button>
        <button onClick={() => navigate('/recommendations')} style={{ flex: '1 1 140px', padding: '10px 16px', borderRadius: 10, background: '#16A34A', border: 'none', fontSize: 12, fontWeight: 700, color: '#FFFFFF', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.2), 0 2px 4px -2px rgba(22, 163, 74, 0.1)', transition: 'all 0.15s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#15803D'; e.currentTarget.style.transform = 'translateY(-1px)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#16A34A'; e.currentTarget.style.transform = 'translateY(0)'; }}>
          See today's recommendations →
        </button>
      </div>
    </div>
  );
};