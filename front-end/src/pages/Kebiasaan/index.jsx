import { useState } from 'react';
import { HabitTracker } from './HabitTracker';
import { WeeklyRunTracker } from './WeeklyRunTracker';
import { WeeklyExercise } from './WeeklyExercise';

const TABS = [
  { key: 'habit', label: 'Habit Tracker' },
  { key: 'run', label: 'Weekly Run' },
  { key: 'exercise', label: 'Weekly Exercise' },
];

export const Kebiasaan = () => {
  const [activeTab, setActiveTab] = useState('habit');

  return (
    <div className="flex flex-col gap-5 font-sans">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Habit Tracker
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">
            Complete your daily habits and track your progress.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-semibold text-green-700">Live Tracking</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              relative px-5 py-3 text-sm font-semibold transition-all duration-200 cursor-pointer
              border-b-2 -mb-px bg-transparent border-none outline-none
              ${activeTab === tab.key
                ? 'text-green-700 border-green-600'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50/50 border-transparent'
              }
            `}
            style={{
              borderBottomWidth: '2px',
              borderBottomStyle: 'solid',
              borderBottomColor: activeTab === tab.key ? '#16A34A' : 'transparent',
            }}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-green-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'habit' && <HabitTracker />}
        {activeTab === 'run' && <WeeklyRunTracker />}
        {activeTab === 'exercise' && <WeeklyExercise />}
      </div>
    </div>
  );
};