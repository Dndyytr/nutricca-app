import { LanguageToggle } from "../LanguageToggle";
import { useLocale } from "../../i18n/locale-context";

const ONBOARDING_STEPS = [
  { id: 1, key: "basicIdentity" },
  { id: 2, key: "lifestyle" },
  { id: 3, key: "medical" },
  { id: 4, key: "goals" },
];

/**
 * @param {{ currentStep: number, children: React.ReactNode }} props
 */
export const OnboardingLayout = ({ currentStep, children }) => {
  const { t } = useLocale();
  const currentStepData = ONBOARDING_STEPS[currentStep - 1];

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans text-slate-900">
      {/* Sidebar */}
      <div className="w-full md:w-72 lg:w-80 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 px-6 py-6 md:px-10 md:py-10 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center justify-between gap-3 mb-6 md:mb-12">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-600 rounded-xl shadow-lg shadow-green-600/30 flex items-center justify-center">
              <img
                src="/favicon.svg"
                alt="Logo"
                className="w-5 h-5 brightness-0 invert"
              />
            </div>
            <span className="t-size5 font-extrabold tracking-tight">
              Nutricca
            </span>
          </div>
          <LanguageToggle />
        </div>

        {/* Mobile: horizontal step dots */}
        <div className="flex md:hidden items-center gap-2 mb-2">
          {ONBOARDING_STEPS.map((s) => (
            <div
              key={s.id}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s.id <= currentStep ? "bg-green-600" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
        <p className="md:hidden t-size2 text-slate-400 font-medium mb-1">
          {t("common.step", {
            current: currentStep,
            total: ONBOARDING_STEPS.length,
          })}{" "}
          — {t(`onboarding.${currentStepData?.key}.title`)}
        </p>

        {/* Desktop: vertical stepper */}
        <div className="hidden md:block">
          <h3 className="t-size2 font-bold text-slate-400 uppercase tracking-wider mb-6">
            {t("onboarding.progress")}
          </h3>
          <div className="flex flex-col gap-7 relative">
            <div className="absolute left-4 top-2 bottom-2 w-[2px] bg-slate-200 z-0" />
            {ONBOARDING_STEPS.map((step) => {
              const status =
                step.id < currentStep
                  ? "completed"
                  : step.id === currentStep
                    ? "current"
                    : "upcoming";
              return (
                <div
                  key={step.id}
                  className="relative z-10 flex items-start gap-4"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center t-size3 font-bold border-2 transition-colors flex-shrink-0 ${
                      status === "current"
                        ? "bg-green-600 border-green-600 text-white shadow-md shadow-green-600/30"
                        : status === "completed"
                          ? "bg-green-600 border-green-600 text-white"
                          : "bg-slate-50 border-slate-300 text-slate-400"
                    }`}
                  >
                    {step.id}
                  </div>
                  <div className="pt-1">
                    <p
                      className={`t-size3 font-bold ${status === "current" ? "text-green-700" : "text-slate-600"}`}
                    >
                      {t(`onboarding.${step.key}.title`)}
                    </p>
                    <p className="t-size2 text-slate-500 mt-0.5 font-medium">
                      {t(`onboarding.${step.key}.description`)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8 md:px-14 lg:px-20 bg-white overflow-y-auto">
        <div className="max-w-2xl w-full mx-auto">{children}</div>
      </div>
    </div>
  );
};
