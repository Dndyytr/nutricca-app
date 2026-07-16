import { useState, useEffect } from 'react';
import { getWeeklyRun, postWeeklyRun, putWeeklyRun } from '../../services/api';
import { DAYS, LEVEL_CONFIG, LEVEL_TO_INT, INT_TO_LEVEL } from './constants';
import { SaveBar } from './SaveBar';

export const WeeklyRunTracker = () => {
  const [level, setLevel] = useState('beginner');
  const [runs, setRuns] = useState({});
  const [runId, setRunId] = useState(null);
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const cfg = LEVEL_CONFIG[level];
  const target = cfg.runTarget;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getWeeklyRun();
        const data = res?.data?.weekly_run?.[0];
        if (data) {
          setRunId(data.id);
          setLevel(INT_TO_LEVEL[data.level] || 'beginner');
          setRuns({
            Mon: { km: data.mon ?? 0 },
            Tue: { km: data.tue ?? 0 },
            Wed: { km: data.wed ?? 0 },
            Thu: { km: data.thu ?? 0 },
            Fri: { km: data.fri ?? 0 },
            Sat: { km: data.sat ?? 0 },
            Sun: { km: data.sun ?? 0 },
          });
        }
      } catch (err) {
        console.error('Failed to load weekly run:', err);
      }
    };
    fetchData();
  }, []);

  const totalKm = DAYS.reduce((sum, d) => sum + (parseFloat(runs[d]?.km) || 0), 0);
  const pct = Math.min(100, Math.round((totalKm / target) * 100));
  const updateKm = (day, val) => setRuns((prev) => ({ ...prev, [day]: { km: val } }));

  const handleSave = async () => {
    setStatus('saving');
    setErrorMsg('');
    const payload = {
      level: LEVEL_TO_INT[level],
      target_distance: target,
      mon: parseFloat(runs['Mon']?.km) || 0,
      tue: parseFloat(runs['Tue']?.km) || 0,
      wed: parseFloat(runs['Wed']?.km) || 0,
      thu: parseFloat(runs['Thu']?.km) || 0,
      fri: parseFloat(runs['Fri']?.km) || 0,
      sat: parseFloat(runs['Sat']?.km) || 0,
      sun: parseFloat(runs['Sun']?.km) || 0,
    };
    try {
      if (runId) {
        await putWeeklyRun(runId, payload);
      } else {
        const res = await postWeeklyRun(payload);
        setRunId(res?.data?.weekly_run?.id);
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
          onChange={(e) => setLevel(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border-2 border-transparent rounded-lg text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-200 cursor-pointer w-auto"
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: cfg.pillBg, color: cfg.pillColor }}>
          {cfg.label}
        </span>
      </div>

      {/* Target + progress */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm font-bold text-slate-900 tracking-tight">🏃 Weekly Run Target</div>
          <span className="text-sm font-bold text-green-600">
            {totalKm.toFixed(1)} / {target} km
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mb-4">
          <div
            className={`h-full rounded-full transition-all duration-500 ${pct >= 100 ? 'bg-green-500' : 'bg-green-600'}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className="flex flex-col gap-2">
          {DAYS.map((day) => {
            const km = parseFloat(runs[day]?.km) || 0;
            const dayPct = Math.min(100, Math.round((km / (target / 7)) * 100));
            return (
              <div key={day} className="grid grid-cols-[44px_1fr_60px_70px] items-center gap-2.5">
                <span className="text-xs font-semibold text-slate-700">{day}</span>
                <input
                  type="number" min="0" step="0.1" placeholder="0"
                  value={runs[day]?.km || ''}
                  onChange={(e) => updateKm(day, e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-transparent rounded-lg text-sm text-slate-900 focus:outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-200 text-center"
                />
                <span className="text-xs text-slate-400">km</span>
                <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${dayPct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <SaveBar onSave={handleSave} status={status} errorMsg={errorMsg} label={runId ? 'Update weekly run' : 'Save weekly run'} />
    </div>
  );
};