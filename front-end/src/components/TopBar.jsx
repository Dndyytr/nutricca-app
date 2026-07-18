import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../hooks/useApp";
import { useLocale } from "../i18n/locale-context";
import { LanguageToggle } from "./LanguageToggle";

const PAGE_TITLES = {
  "/": "topbar.dashboard",
  "/habits": "topbar.habits",
  "/recommendations": "topbar.recommendations",
  "/progress": "topbar.progress",
  "/profile": "topbar.profile",
};

export const TopBar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { userProfile } = useApp();
  const { locale, t } = useLocale();

  const match = Object.keys(PAGE_TITLES)
    .sort((a, b) => b.length - a.length)
    .find((k) => pathname === k || (k !== "/" && pathname.startsWith(k)));
  const titleKey = PAGE_TITLES[match] || PAGE_TITLES["/"];

  const initials = userProfile?.fullName
    ? userProfile.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const today = new Date().toLocaleDateString(
    locale === "id" ? "id-ID" : "en-US",
    {
      weekday: "short",
      day: "numeric",
      month: "short",
    },
  );

  return (
    <header className="sticky top-0 z-50 h-14 bg-white border-b border-slate-100 px-4 md:px-7 flex items-center justify-between flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Logo — mobile only */}
        <div className="flex md:hidden items-center gap-2 mr-1">
          <div className="w-7 h-7 bg-green-600 rounded-lg flex items-center justify-center">
            <img
              src="/favicon.svg"
              alt="Logo"
              className="w-4 h-4 brightness-0 invert"
            />
          </div>
        </div>
        <div>
          <div className="t-size4 font-semibold text-slate-900 leading-tight">
            {t(`${titleKey}.title`)}
          </div>
          <div className="hidden sm:block t-size2 text-slate-400 mt-0.5 font-medium">
            {t(`${titleKey}.subtitle`)} — {today}
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <LanguageToggle />
        {/* Avatar */}
        <button
          onClick={() => navigate("/profile")}
          className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white t-size2 font-semibold flex-shrink-0 hover:bg-orange-600 transition-colors"
        >
          {initials}
        </button>
      </div>
    </header>
  );
};
