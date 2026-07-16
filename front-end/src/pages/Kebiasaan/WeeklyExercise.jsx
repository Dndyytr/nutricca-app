import { useState, useEffect } from 'react';
import {
  getWeeklyExercise,
  postWeeklyExercise,
  putWeeklyExercise,
} from '../../services/api';
import { DAYS, LEVEL_CONFIG, fmtSets } from './constants';
import { SaveBar } from './SaveBar';

export const WeeklyExercise = () => {
  const [level, setLevel] = useState('beginner');
  const [checks, setChecks] = useState({});
  const [exerciseId, setExerciseId] = useState(null);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const cfg = LEVEL_CONFIG[level];
  const allItems = cfg.groups.flatMap((g) => g.items);
  const totalTarget = allItems.reduce((sum, ex) => sum + ex.days, 0);
  const totalDone = allItems.reduce((sum, ex) => {
    const doneDays = DAYS.filter(
      (d) => checks[`${level}_${ex.id}_${d}`],
    ).length;
    return sum + Math.min(doneDays, ex.days);
  }, 0);
  const weekPct =
    totalTarget > 0 ? Math.round((totalDone / totalTarget) * 100) : 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getWeeklyExercise();
        const data = res?.data?.weekly_exercise?.[0];
        if (data) {
          setExerciseId(data.id);
          const savedLevel = data.level || 'beginner';
          setLevel(savedLevel);

          const restoredChecks = {};
          (data.exercises_data || []).forEach((ex) => {
            DAYS.forEach((day) => {
              const dayKey = day.toLowerCase().slice(0, 3);
              if (ex[dayKey]) {
                const match = LEVEL_CONFIG[savedLevel]?.groups
                  .flatMap((g) => g.items)
                  .find((item) => item.name === ex.exercise_name);
                if (match)
                  restoredChecks[`${savedLevel}_${match.id}_${day}`] = true;
              }
            });
          });
          setChecks(restoredChecks);
        }
      } catch (err) {
        console.error('Failed to load weekly exercise:', err);
      }
    };
    fetchData();
  }, []);

  const toggle = (key) => setChecks((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSave = async () => {
    setStatus('saving');
    setErrorMsg('');

    const exercisesData = allItems.map((ex) => ({
      exercise_name: ex.name,
      mon: !!checks[`${level}_${ex.id}_Mon`],
      tue: !!checks[`${level}_${ex.id}_Tue`],
      wed: !!checks[`${level}_${ex.id}_Wed`],
      thu: !!checks[`${level}_${ex.id}_Thu`],
      fri: !!checks[`${level}_${ex.id}_Fri`],
      sat: !!checks[`${level}_${ex.id}_Sat`],
      sun: !!checks[`${level}_${ex.id}_Sun`],
    }));

    const payload = { level, exercises_data: exercisesData };

    try {
      if (exerciseId) {
        await putWeeklyExercise(exerciseId, payload);
      } else {
        const res = await postWeeklyExercise(payload);
        setExerciseId(res?.data?.weekly_exercise?.id);
      }
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.response?.data?.message || 'Failed to save.');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="flex flex-col gap-5 font-sans">
      {/* Level selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-slate-500">Level:</span>
        <select
          value={level}
          onChange={(e) => {
            setLevel(e.target.value);
            setChecks({});
          }}
          className="px-3 py-1.5 bg-slate-50 border-2 border-transparent rounded-lg text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-200 cursor-pointer w-auto"
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <span
          className="text-xs font-semibold px-3 py-1 rounded-full"
          style={{ background: cfg.pillBg, color: cfg.pillColor }}
        >
          {cfg.label}
        </span>
      </div>

      <div className="text-sm text-amber-800 bg-amber-50 rounded-lg py-2.5 px-3.5 border-l-4 border-green-600">
        {cfg.desc}
      </div>

      {/* Day header */}
      <div className="flex gap-1.5 flex-wrap">
        {DAYS.map((d) => (
          <span
            key={d}
            className="text-xs font-semibold text-slate-500 bg-slate-100 rounded-md px-2 py-1"
          >
            {d}
          </span>
        ))}
      </div>

      {/* Exercise list */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="text-sm font-bold text-slate-900 mb-4 tracking-tight">
          💪 Weekly Exercise
        </div>
        {cfg.groups.map((group) => (
          <div key={group.section} className="mb-4">
            <div className="text-[10px] font-bold tracking-widest text-slate-300 uppercase pb-1.5 border-b border-slate-100 mb-2">
              {group.section}
            </div>
            {group.items.map((ex) => {
              const doneDays = DAYS.filter(
                (d) => checks[`${level}_${ex.id}_${d}`],
              ).length;
              const exPct = Math.min(
                100,
                Math.round((doneDays / ex.days) * 100),
              );
              const isReached = doneDays >= ex.days;
              return (
                <div
                  key={ex.id}
                  className="mb-2.5 pb-2.5 border-b border-slate-50 last:border-0"
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <span
                      className={`flex-1 text-sm font-medium ${isReached ? 'text-slate-400 line-through' : 'text-slate-900'}`}
                    >
                      {ex.name}
                    </span>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded whitespace-nowrap shrink-0">
                      {fmtSets(ex)}
                    </span>
                    <span className="text-xs font-bold min-w-[32px] text-right shrink-0 text-green-600">
                      {doneDays}/{ex.days}
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-slate-100 overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${isReached ? 'bg-green-500' : 'bg-green-600'}`}
                      style={{ width: `${exPct}%` }}
                    />
                  </div>
                  <div className="flex gap-1.5">
                    {DAYS.map((day) => {
                      const key = `${level}_${ex.id}_${day}`;
                      const checked = !!checks[key];
                      return (
                        <button
                          key={day}
                          onClick={() => toggle(key)}
                          title={day}
                          className={`
                            w-8 h-7 rounded-md flex items-center justify-center text-xs font-semibold transition-all duration-150 shrink-0 cursor-pointer
                            ${
                              checked
                                ? 'bg-green-600 text-white border-0'
                                : 'bg-slate-50 text-slate-400 border-2 border-slate-200 hover:border-slate-300'
                            }
                          `}
                        >
                          {checked ? (
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 12 12"
                              fill="none"
                            >
                              <path
                                d="M2 6l3 3 5-5"
                                stroke="#fff"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          ) : (
                            day.slice(0, 1)
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Weekly overall progress */}
        <div className="mt-1 pt-3.5 border-t border-slate-100 flex items-center gap-3.5">
          <div className="flex-1">
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${weekPct >= 100 ? 'bg-green-500' : 'bg-green-600'}`}
                style={{ width: `${weekPct}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-xs text-slate-400">
              <span>Weekly Progress</span>
              <span>
                {totalDone} / {totalTarget} sessions
              </span>
            </div>
          </div>
          <div
            className={`text-2xl font-bold shrink-0 ${weekPct >= 100 ? 'text-green-500' : 'text-green-600'}`}
          >
            {weekPct}%
          </div>
        </div>
      </div>

      <SaveBar
        onSave={handleSave}
        status={status}
        errorMsg={errorMsg}
        label={exerciseId ? 'Update weekly exercise' : 'Save weekly exercise'}
      />
    </div>
  );
};
