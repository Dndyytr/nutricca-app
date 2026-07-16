import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';

const PAGE_TITLES = {
  '/': { title: 'Dashboard', subtitle: 'Your daily health overview' },
  '/habits': { title: 'Habit Tracker', subtitle: 'Log your daily habits' },
  '/recommendations': { title: 'AI Recommendation', subtitle: 'Personalized plan for today' },
  '/progress': { title: 'My Progress', subtitle: 'Track your health journey' },
  '/profile': { title: 'My Profile', subtitle: 'Account & settings' },
};

export const TopBar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { userProfile } = useApp();

  const match = Object.keys(PAGE_TITLES)
    .sort((a, b) => b.length - a.length)
    .find((k) => pathname === k || (k !== '/' && pathname.startsWith(k)));
  const { title, subtitle } = PAGE_TITLES[match] || PAGE_TITLES['/'];

  const initials = userProfile?.fullName
    ? userProfile.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short', day: 'numeric', month: 'short',
  });

  return (
    <header className="sticky top-0 z-50 h-14 bg-white border-b border-slate-100 px-4 md:px-7 flex items-center justify-between flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Logo — mobile only */}
        <div className="flex md:hidden items-center gap-2 mr-1">
          <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
            <img src="/favicon.svg" alt="Logo" className="w-4 h-4 brightness-0 invert" />
          </div>
        </div>
        <div>
          <div className="text-[15px] font-semibold text-slate-900 leading-tight">{title}</div>
          <div className="hidden sm:block text-[11px] text-slate-400 mt-0.5">{subtitle} — {today}</div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Avatar */}
        <button
          onClick={() => navigate('/profile')}
          className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-[12px] font-semibold flex-shrink-0 hover:bg-orange-600 transition-colors"
        >
          {initials}
        </button>
      </div>
    </header>
  );
};
