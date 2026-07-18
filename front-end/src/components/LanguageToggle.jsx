import { useLocale } from "../i18n/locale-context";

export const LanguageToggle = () => {
  const { locale, setLocale, t } = useLocale();
  const nextLocale = locale === "en" ? "id" : "en";
  const nextLanguage = t(
    nextLocale === "en" ? "common.english" : "common.indonesian",
  );

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => setLocale(nextLocale)}
        className="relative cursor-pointer h-8 w-16 rounded-full border border-slate-200 bg-slate-100 p-0.5 shadow-sm transition-all duration-200 hover:border-green-300 hover:bg-green-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/15"
        aria-label={t("common.switchLanguage", { language: nextLanguage })}
      >
        <span
          className={`absolute inset-y-0.5 left-0.5 flex w-7 items-center justify-center rounded-full bg-green-600 t-size1 font-bold text-white shadow-sm transition-transform duration-300 ease-out ${
            locale === "id" ? "translate-x-8" : "translate-x-0"
          }`}
        >
          {locale.toUpperCase()}
        </span>
        <span
          className={`absolute inset-y-0 flex w-8 items-center justify-center t-size1 font-bold text-slate-400 transition-all duration-300 ${
            locale === "id" ? "left-0" : "right-0"
          }`}
        >
          {nextLocale.toUpperCase()}
        </span>
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute right-0 top-full z-50 mt-2 w-max rounded-md bg-(--color-primary) px-2 py-1 t-size1 font-medium text-white opacity-0 translate-y-1 shadow-lg transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
      >
        {t("common.switchLanguage", { language: nextLanguage })}
      </span>
    </div>
  );
};
