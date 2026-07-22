import { useLocation, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { useApp } from "../hooks/useApp";
import { useLocale } from "../i18n/locale-context";
import { LanguageToggle } from "./LanguageToggle";

const PAGE_TITLES = {
  "/": "topbar.dashboard",
  "/habit-tracker": "topbar.habits",
  "/weekly-activity": "topbar.habits",
  "/daily-log-history": "topbar.history",
  "/nutrition-log-history": "topbar.history",
  "/activity-log-history": "topbar.history",
  "/recommendations": "topbar.recommendations",
  "/progress": "topbar.progress",
  "/profile": "topbar.profile",
};

export const TopBar = ({ onMenuClick }) => {
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
    <header className="sticky top-0 z-50 h-14 bg-white border-b border-slate-100 px-4 md:px-7 flex items-center justify-between shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        {/* Logo — mobile only */}
        <button
          type="button"
          aria-label={t("common.openNavigation")}
          onClick={onMenuClick}
          className="flex items-center cursor-pointer justify-center p-1.5 rounded-lg text-slate-500 transition-all bg-slate-100 duration-300 ease-in-out hover:bg-slate-200 hover:text-slate-900 active:bg-slate-200 active:text-slate-900 lg:hidden"
        >
          <Menu className="size-6 bp360:size-6.25 bp400:size-6.5 md:size-6.75" />
        </button>
        <div>
          <div className="t-size4 font-semibold text-slate-900 leading-tight">
            {t(`${titleKey}.title`)}
          </div>
          <div className="hidden sm:block t-size3 text-slate-400 mt-0.5 font-medium">
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
          className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white t-size2 font-semibold shrink-0 hover:bg-orange-600 transition-colors"
        >
          {initials}
        </button>
      </div>
    </header>
  );
};
