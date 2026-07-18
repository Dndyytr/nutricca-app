import { Link, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../hooks/useApp";
import { useAuth } from "../hooks/useAuth";
import { useLocale } from "../i18n/locale-context";

const NAV_ITEMS = [
  {
    path: "/",
    labelKey: "nav.dashboard",
    icon: (
      <svg
        width="18"
        height="18"
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
  },
  {
    path: "/habits",
    labelKey: "nav.habits",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
  },
  {
    path: "/recommendations",
    labelKey: "nav.plan",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    path: "/progress",
    labelKey: "nav.progress",
    icon: (
      <svg
        width="18"
        height="18"
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
  },
  {
    path: "/profile",
    labelKey: "nav.profile",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

const isActive = (path, pathname) =>
  path === "/" ? pathname === "/" : pathname.startsWith(path);

/* ── Desktop Sidebar ── */
export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile } = useApp();
  const { logout } = useAuth();
  const { t } = useLocale();

  const initials = userProfile?.fullName
    ? userProfile.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <aside className="hidden md:flex fixed top-0 left-0 h-screen w-[220px] bg-slate-50 border-r border-slate-200 flex-col z-[100] overflow-y-auto">
      {/* Logo */}
      <div className="px-[18px] py-5 border-b border-slate-200 flex items-center gap-2.5 flex-shrink-0">
        <div className="w-9 h-9 rounded-[10px] bg-green-600 flex items-center justify-center flex-shrink-0 shadow-[0_4px_6px_-1px_rgba(22,163,74,0.3)]">
          <img
            src="/favicon.svg"
            alt="Logo"
            className="w-6 h-6 brightness-0 invert"
          />
        </div>
        <div>
          <div className="t-size3 font-bold text-slate-900 leading-tight tracking-tight">
            Nutricca
          </div>
          <div className="t-size1 text-slate-400 mt-0.5 font-medium">
            {t("brand.tagline")}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-3">
        {NAV_ITEMS.map(({ path, labelKey, icon }) => {
          const active = isActive(path, location.pathname);
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[9px] t-size3 mb-0.5 transition-all duration-150 ${
                active
                  ? "bg-green-50 text-green-700 font-semibold"
                  : "text-slate-500 font-medium hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              <span className={active ? "text-green-600" : "text-current"}>
                {icon}
              </span>
              {t(labelKey)}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3.5 py-4 border-t border-slate-200">
        <div
          onClick={() => navigate("/profile")}
          className="flex items-center gap-2.5 mb-2.5 cursor-pointer px-1.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white t-size2 font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="t-size2 font-semibold text-slate-900 truncate">
              {userProfile?.fullName || t("common.user")}
            </div>
            <div className="t-size1 text-slate-400 font-medium">
              {userProfile?.bmiCategory || "BMI Normal"}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full py-1.5 px-3 bg-red-50 text-red-600 border border-red-200 rounded-lg t-size2 font-semibold flex items-center justify-center gap-1.5 hover:bg-red-100 transition-colors"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {t("common.logout")}
        </button>
      </div>
    </aside>
  );
};

/* ── Mobile Bottom Navigation ── */
export const BottomNav = () => {
  const location = useLocation();
  const { t } = useLocale();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-slate-200 flex md:hidden">
      {NAV_ITEMS.map(({ path, labelKey, icon }) => {
        const active = isActive(path, location.pathname);
        return (
          <Link
            key={path}
            to={path}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 t-size1 font-semibold transition-colors ${
              active ? "text-green-600" : "text-slate-400"
            }`}
          >
            <span>{icon}</span>
            {t(labelKey)}
          </Link>
        );
      })}
    </nav>
  );
};
