import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../hooks/useApp";
import { useAuth } from "../hooks/useAuth";
import { useLocale } from "../i18n/locale-context";
import { ArrowLeft } from "lucide-react";

const NAV_ITEMS = [
  {
    path: "/",
    labelKey: "nav.dashboard",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    path: "/habit-tracker",
    labelKey: "nav.habits",
    children: [
      { path: "/habit-tracker", labelKey: "nav.tracker" },
      { path: "/daily-log-history", labelKey: "nav.history" },
    ],
    icon: (
      <svg
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

export const Sidebar = ({ open = false, onClose = () => {} }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile } = useApp();
  const { logout } = useAuth();
  const { t } = useLocale();
  const [habitsOpen, setHabitsOpen] = useState(() =>
    [
      "/habit-tracker",
      "/weekly-activity",
      "/daily-log-history",
      "/nutrition-log-history",
      "/activity-log-history",
    ].some((path) => isActive(path, location.pathname)),
  );

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const initials = userProfile?.fullName
    ? userProfile.fullName
        .split(" ")
        .map((name) => name[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label={t("common.closeNavigation")}
          onClick={onClose}
          className="fixed inset-0 z-[90] bg-slate-900/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-100 flex h-dvh w-55 flex-col overflow-hidden border-r border-slate-200 bg-slate-50 transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex shrink-0 items-center gap-2.5 border-b border-slate-200 px-4.5 py-5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-green-600 shadow-[0_4px_6px_-1px_rgba(22,163,74,0.3)]">
            <img
              src="/favicon.svg"
              alt="Logo"
              className="h-6 w-6 brightness-0 invert"
            />
          </div>
          <div>
            <div className="t-size3 font-bold leading-tight tracking-tight text-slate-900">
              Nutricca
            </div>
            <div className="t-size1 mt-0.5 font-medium text-slate-400">
              {t("brand.tagline")}
            </div>
          </div>
          <button
            type="button"
            aria-label={t("common.closeNavigation")}
            onClick={onClose}
            className="cursor-pointer rounded-full bg-(--color-primary) p-1.5 text-white transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-green-400 active:bg-green-400 hover:shadow-[0_5px_7px_0_rgba(0,0,0,0.2)] active:scale-95 active:shadow-none lg:hidden"
          >
            <ArrowLeft
              strokeWidth={2.5}
              className="size-5 bp360:size-5.25 bp400:size-5.5 md:size-5.75"
            />
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-2.5 py-3">
          {NAV_ITEMS.map(({ path, labelKey, icon, children }) => {
            const active = children
              ? [
                  path,
                  "/weekly-activity",
                  "/daily-log-history",
                  "/nutrition-log-history",
                  "/activity-log-history",
                ].some((childPath) => isActive(childPath, location.pathname))
              : isActive(path, location.pathname);
            const expanded = active || habitsOpen;

            if (!children) {
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={onClose}
                  className={`mb-0.5 flex items-center gap-2.5 rounded-[9px] px-3 py-2.5 t-size3 transition-all duration-150 ${
                    active
                      ? "bg-green-50 font-semibold text-green-700"
                      : "font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  <span
                    className={`h-4.5 w-4.5 ${active ? "text-green-600" : "text-current"}`}
                  >
                    {icon}
                  </span>
                  {t(labelKey)}
                </Link>
              );
            }

            return (
              <div key={path} className="mb-0.5">
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setHabitsOpen((value) => !value)}
                  className={`flex w-full items-center cursor-pointer gap-2.5 rounded-[9px] px-3 py-2.5 text-left t-size3 transition-all duration-150 ${
                    active
                      ? "font-semibold text-green-700"
                      : "font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  <span
                    className={`size-4.5 ${active ? "text-green-600" : "text-current"}`}
                  >
                    {icon}
                  </span>
                  <span className="flex-1">{t(labelKey)}</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                <div
                  className={`grid transition-all duration-200 ${
                    expanded
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    {children.map((child) => {
                      const childActive =
                        isActive(child.path, location.pathname) ||
                        (child.path === "/habit-tracker" &&
                          isActive("/weekly-activity", location.pathname)) ||
                        (child.path === "/daily-log-history" &&
                          [
                            "/nutrition-log-history",
                            "/activity-log-history",
                          ].some((path) => isActive(path, location.pathname)));

                      return (
                        <div
                          key={child.path}
                          className={`ml-5 border-l pl-3 ${
                            childActive
                              ? "border-green-500"
                              : "border-slate-200"
                          }`}
                        >
                          <Link
                            to={child.path}
                            onClick={onClose}
                            className={`flex rounded-r-lg px-2 py-2 t-size2 transition-colors ${
                              childActive
                                ? "font-semibold text-green-700"
                                : "font-medium text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            {t(child.labelKey)}
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-slate-200 px-3.5 py-4">
          <button
            type="button"
            onClick={() => {
              navigate("/profile");
              onClose();
            }}
            className="mb-2.5 flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-left transition-colors hover:bg-slate-100"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600 text-white t-size2 font-bold">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="t-size2 truncate font-semibold text-slate-900">
                {userProfile?.fullName || t("common.user")}
              </div>
              <div className="t-size1 font-medium text-slate-400">
                {userProfile?.bmiCategory || "BMI Normal"}
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 t-size2 font-semibold text-red-600 transition-all duration-300 hover:bg-red-100"
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
    </>
  );
};
