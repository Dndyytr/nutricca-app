const ONBOARDING_STEPS = [
  { id: 1, title: 'Basic Identity', desc: 'Age, Weight, Height' },
  { id: 2, title: 'Lifestyle', desc: 'Diet & Sleep habits' },
  { id: 3, title: 'Medical', desc: 'Health conditions' },
  { id: 4, title: 'Goals', desc: 'Your main objectives' },
];

/**
 * @param {{ currentStep: number, children: React.ReactNode }} props
 */
export const OnboardingLayout = ({ currentStep, children }) => (
  <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans text-slate-900">
    {/* Sidebar */}
    <div className="w-full md:w-72 lg:w-80 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 px-6 py-6 md:px-10 md:py-10 flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-6 md:mb-12">
        <div className="w-9 h-9 bg-green-600 rounded-xl shadow-lg shadow-green-600/30 flex items-center justify-center">
          <img src="/favicon.svg" alt="Logo" className="w-5 h-5 brightness-0 invert" />
        </div>
        <span className="text-lg font-extrabold tracking-tight">Nutricca</span>
      </div>

      {/* Mobile: horizontal step dots */}
      <div className="flex md:hidden items-center gap-2 mb-2">
        {ONBOARDING_STEPS.map((s) => (
          <div
            key={s.id}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              s.id <= currentStep ? 'bg-green-600' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      <p className="md:hidden text-xs text-slate-400 font-medium mb-1">
        Step {currentStep} of {ONBOARDING_STEPS.length} — {ONBOARDING_STEPS[currentStep - 1]?.title}
      </p>

      {/* Desktop: vertical stepper */}
      <div className="hidden md:block">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
          Onboarding Progress
        </h3>
        <div className="flex flex-col gap-7 relative">
          <div className="absolute left-4 top-2 bottom-2 w-[2px] bg-slate-200 z-0" />
          {ONBOARDING_STEPS.map((step) => {
            const status =
              step.id < currentStep ? 'completed' : step.id === currentStep ? 'current' : 'upcoming';
            return (
              <div key={step.id} className="relative z-10 flex items-start gap-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors flex-shrink-0 ${
                    status === 'current'
                      ? 'bg-green-600 border-green-600 text-white shadow-md shadow-green-600/30'
                      : status === 'completed'
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'bg-slate-50 border-slate-300 text-slate-400'
                  }`}
                >
                  {step.id}
                </div>
                <div className="pt-1">
                  <p className={`text-sm font-bold ${status === 'current' ? 'text-green-700' : 'text-slate-600'}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
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
