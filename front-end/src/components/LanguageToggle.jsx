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
        className="relative cursor-pointer h-7 bp360:h-7.25 w-16 bp360:w-16.25 bp400:h-7.5 bp400:w-16.5 md:h-7.75 md:w-16.75 lg:h-8 lg:w-17 rounded-full border border-slate-200 bg-slate-100 p-0.5 shadow-sm transition-all duration-200 hover:border-green-300 hover:bg-green-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-500/15"
        aria-label={t("common.switchLanguage", { language: nextLanguage })}
      >
        <span
          className={`absolute inset-y-0.5 left-0.5 flex w-6.5 bp360:w-6.75 bp400:w-7 md:w-7.25 lg:w-7.5 items-center justify-center rounded-full bg-green-600 t-size1 font-bold text-white shadow-sm transition-transform duration-350 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            locale === "id" ? "translate-x-8" : "translate-x-0"
          }`}
        >
          {locale.toUpperCase()}
        </span>
        <span
          className={`absolute inset-y-0 flex w-7.5 bp360:w-7.75 bp400:w-8 md:w-8.25 lg:w-8.5 items-center justify-center t-size1 font-bold text-slate-400 transition-all duration-300 ${
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
