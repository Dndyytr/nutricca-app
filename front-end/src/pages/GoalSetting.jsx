import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  healthGoalsApi,
  generateDailyPlanApi,
  updateOnboardingStatus,
} from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { useApp } from "../hooks/useApp";
import { OnboardingLayout } from "../components/ui/OnboardingLayout";
import {
  FormField,
  ToggleChip,
  ErrorAlert,
  FormActions,
} from "../components/ui/FormComponents";
import {
  showLoading,
  showSuccess,
  showError,
  closeFeedback,
} from "../shared/ui/feedback";
import { todayInAppTimeZone } from "../shared/lib/date";
import { useLocale } from "../i18n/locale-context";

const GOALS = ["Weight Loss", "Muscle Gain", "Endurance", "General Well-being"];
const ACTIVITIES = [
  "Yoga",
  "Running",
  "Weight Training",
  "Walking",
  "Swimming",
  "Cycling",
  "HIIT",
  "Pilates",
];

export const GoalSetting = () => {
  const navigate = useNavigate();
  const { t } = useLocale();
  const { completeOnboardingStep } = useAuth();
  const { userProfile } = useApp();

  const [formData, setFormData] = useState({
    primaryGoal: "Weight Loss",
    targetWeight: "",
    commitmentDays: 5,
    preferredActivities: [],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleActivity = (a) => {
    setFormData((prev) => ({
      ...prev,
      preferredActivities: prev.preferredActivities.includes(a)
        ? prev.preferredActivities.filter((x) => x !== a)
        : [...prev.preferredActivities, a],
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.targetWeight) {
      setError(t("onboarding.goals.validation.targetWeight"));
      return;
    }
    if (formData.preferredActivities.length === 0) {
      setError(t("onboarding.goals.validation.activity"));
      return;
    }
    const tw = Number(formData.targetWeight);
    if (tw < 30 || tw > 300) {
      setError(t("onboarding.goals.validation.weightRange"));
      return;
    }

    setLoading(true);
    showLoading(
      t("onboarding.goals.saving"),
      t("onboarding.goals.savingDescription"),
    );
    try {
      const payload = {
        primary_goal: formData.primaryGoal,
        target_weight_kg: tw,
        commitment_days: Number(formData.commitmentDays),
        preferred_activity: formData.preferredActivities.join(", "),
      };
      await healthGoalsApi(payload);
      await updateOnboardingStatus();
      await completeOnboardingStep(payload);

      showLoading(
        t("onboarding.goals.generating"),
        t("onboarding.goals.generatingDescription"),
      );

      const today = todayInAppTimeZone();
      await generateDailyPlanApi(today).catch((err) =>
        console.warn("AI generation failed silently:", err),
      );

      closeFeedback();
      await showSuccess(
        t("onboarding.goals.done"),
        t("onboarding.goals.doneDescription"),
      );
      navigate("/");
    } catch (err) {
      closeFeedback();
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        t("onboarding.goals.saveFailed");
      setError(msg);
      showError(t("onboarding.goals.saveFailedTitle"), msg);
    } finally {
      setLoading(false);
    }
  };

  const weightDiff =
    userProfile?.weight && formData.targetWeight
      ? (Number(formData.targetWeight) - Number(userProfile.weight)).toFixed(1)
      : null;

  return (
    <OnboardingLayout currentStep={4}>
      <div className="mb-8 md:mb-10">
        <h1 className="t-size9 font-extrabold tracking-tight text-slate-900 mb-3">
          {t("onboarding.goals.heading")}
        </h1>
        <p className="t-size4 text-slate-500 font-medium">
          {t("onboarding.goals.introduction")}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <FormField label={t("onboarding.goals.fields.primaryGoal")} required>
          <div className="grid grid-cols-2 gap-3">
            {GOALS.map((g) => (
              <ToggleChip
                key={g}
                label={t(`onboarding.goals.goalOptions.${g}`)}
                selected={formData.primaryGoal === g}
                onClick={() => setFormData((p) => ({ ...p, primaryGoal: g }))}
              />
            ))}
          </div>
        </FormField>

        <FormField label={t("onboarding.goals.fields.targetWeight")} required>
          <div className="flex items-center gap-4">
            <input
              type="number"
              name="targetWeight"
              step="0.1"
              min="30"
              max="300"
              value={formData.targetWeight}
              onChange={(e) => {
                setFormData((p) => ({ ...p, targetWeight: e.target.value }));
                setError("");
              }}
              placeholder={t("onboarding.goals.placeholder")}
              className="flex-1 px-4 py-3.5 border-2 border-transparent rounded-xl t-size3 text-slate-900 bg-slate-100 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-200 font-medium"
            />
            {weightDiff !== null && (
              <div className="shrink-0 text-right">
                <p className="t-size2 text-slate-400 mb-0.5 font-medium">
                  {t("onboarding.goals.difference")}
                </p>
                <p
                  className={`t-size7 font-extrabold ${Number(weightDiff) < 0 ? "text-green-600" : "text-amber-500"}`}
                >
                  {Number(weightDiff) > 0 ? "+" : ""}
                  {weightDiff} kg
                </p>
              </div>
            )}
          </div>
        </FormField>

        <FormField label={t("onboarding.goals.fields.exerciseDays")} required>
          <div className="flex items-center gap-6">
            <input
              type="range"
              name="commitmentDays"
              min="1"
              max="7"
              value={formData.commitmentDays}
              onChange={(e) =>
                setFormData((p) => ({ ...p, commitmentDays: e.target.value }))
              }
              className="flex-1 accent-green-600 h-2"
            />
            <div className="flex-shrink-0 text-center w-14">
              <span className="t-size8 font-extrabold text-green-600">
                {formData.commitmentDays}
              </span>
              <p className="t-size2 text-slate-400 mt-0.5 font-medium">
                {t("onboarding.goals.daysPerWeek")}
              </p>
            </div>
          </div>
          <div className="flex justify-between px-0.5 mt-1">
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <span
                key={d}
                className={`t-size2 font-bold ${d <= formData.commitmentDays ? "text-green-600" : "text-slate-300"}`}
              >
                {d}
              </span>
            ))}
          </div>
        </FormField>

        <FormField label={t("onboarding.goals.fields.activities")} required>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ACTIVITIES.map((a) => (
              <ToggleChip
                key={a}
                label={t(`onboarding.goals.activities.${a}`)}
                selected={formData.preferredActivities.includes(a)}
                onClick={() => toggleActivity(a)}
              />
            ))}
          </div>
        </FormField>

        <ErrorAlert message={error} />
        <FormActions
          onBack={() => navigate("/onboarding/health-security")}
          submitLabel={t("onboarding.goals.finish")}
          loading={loading}
        />
      </form>
    </OnboardingLayout>
  );
};
