import { Link, Outlet, useLocation } from "react-router-dom";
import { useLocale } from "../../i18n/locale-context";

export const Habits = () => {
  const { t } = useLocale();
  const { pathname } = useLocation();
  const isHistory = [
    "/daily-log-history",
    "/nutrition-log-history",
    "/activity-log-history",
  ].includes(pathname);
  const tabs = isHistory
    ? [
        { id: "daily", path: "/daily-log-history" },
        { id: "nutrition", path: "/nutrition-log-history" },
        { id: "activity", path: "/activity-log-history" },
      ]
    : [
        { id: "habit", path: "/habit-tracker" },
        { id: "activity", path: "/weekly-activity" },
      ];
  const section = isHistory ? "history" : "habits";

  return (
    <div className="flex flex-col gap-5 font-sans">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="t-size7 font-bold text-slate-900 tracking-tight">
            {t(`${section}.title`)}
          </h1>
          <p className="t-size3 text-slate-400 mt-1 font-medium">
            {t(`${section}.description`)}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
          <span className="size-2 rounded-full bg-green-500 animate-pulse" />
          <span className="t-size2 font-semibold text-green-700">
            {t("habits.live")}
          </span>
        </div>
      </div>

      <div className="border-b border-slate-200">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              to={tab.path}
              className={`border-b-2 px-1 pb-3 t-size3 transition-colors ${
                pathname === tab.path
                  ? "border-green-600 font-semibold text-green-600"
                  : "border-transparent font-medium text-slate-500 hover:text-slate-800"
              }`}
            >
              {t(`${section}.tabs.${tab.id}`)}
            </Link>
          ))}
        </div>
      </div>

      <Outlet />
    </div>
  );
};
