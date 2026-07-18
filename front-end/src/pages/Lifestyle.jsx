import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { lifestyleApi } from "../services/api";
import { OnboardingLayout } from "../components/ui/OnboardingLayout";
import {
  FormField,
  Input,
  Select,
  ErrorAlert,
  FormActions,
} from "../components/ui/FormComponents";
import {
  showLoading,
  showSuccess,
  showError,
  closeFeedback,
} from "../shared/ui/feedback";
import { useLocale } from "../i18n/locale-context";

export const Lifestyle = () => {
  const navigate = useNavigate();
  const { completeOnboardingStep } = useAuth();
  const { t } = useLocale();

  const [form, setForm] = useState({
    dietaryPattern: "High Protein",
    mealsPerDay: 3,
    dailyWaterIntakeGoal: 2000,
    avgSleepHours: 7,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.avgSleepHours < 4 || form.avgSleepHours > 12) {
      setError(t("onboarding.lifestyle.validation.sleep"));
      return;
    }
    setLoading(true);
    showLoading(t("onboarding.lifestyle.saving"), t("onboarding.lifestyle.savingDescription"));
    try {
      const payload = {
        dietary_pattern: form.dietaryPattern,
        meals_per_day: Number(form.mealsPerDay),
        daily_water_intake_goal: Number(form.dailyWaterIntakeGoal),
        avg_sleep_hours: Number(form.avgSleepHours),
      };
      await lifestyleApi(payload);
      completeOnboardingStep(form);
      closeFeedback();
      await showSuccess(
        t("onboarding.lifestyle.saved"),
        t("onboarding.lifestyle.savedDescription"),
      );
      navigate("/onboarding/health-security");
    } catch (err) {
      closeFeedback();
      const msg =
        err?.response?.data?.message ||
        err.message ||
        t("onboarding.lifestyle.saveFailed");
      setError(msg);
      showError(t("onboarding.lifestyle.saveFailedTitle"), msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout currentStep={2}>
      <div className="mb-8 md:mb-10">
        <h1 className="t-size9 font-extrabold tracking-tight text-slate-900 mb-3">
          {t("onboarding.lifestyle.heading")}
        </h1>
        <p className="t-size4 text-slate-500 font-medium">
          {t("onboarding.lifestyle.introduction")}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField label={t("onboarding.lifestyle.fields.dietaryPattern")} required>
            <Select
              name="dietaryPattern"
              value={form.dietaryPattern}
              onChange={handleChange}
            >
              <option value="High Protein">{t("onboarding.lifestyle.patterns.highProtein")}</option>
              <option value="Low Protein">{t("onboarding.lifestyle.patterns.lowProtein")}</option>
              <option value="High Fiber">{t("onboarding.lifestyle.patterns.highFiber")}</option>
              <option value="Vegan">{t("onboarding.lifestyle.patterns.vegan")}</option>
            </Select>
          </FormField>
          <FormField label={t("onboarding.lifestyle.fields.mealsPerDay")} required>
            <Input
              type="number"
              name="mealsPerDay"
              min="1"
              max="10"
              value={form.mealsPerDay}
              onChange={handleChange}
              placeholder={t("onboarding.lifestyle.placeholders.meals")}
            />
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField label={t("onboarding.lifestyle.fields.waterGoal")} required>
            <Input
              type="number"
              name="dailyWaterIntakeGoal"
              value={form.dailyWaterIntakeGoal}
              onChange={handleChange}
              placeholder={t("onboarding.lifestyle.placeholders.water")}
            />
          </FormField>
          <FormField label={t("onboarding.lifestyle.fields.sleepHours")} required>
            <Input
              type="number"
              name="avgSleepHours"
              step="0.1"
              min="4"
              max="12"
              value={form.avgSleepHours}
              onChange={handleChange}
              placeholder={t("onboarding.lifestyle.placeholders.sleep")}
            />
          </FormField>
        </div>
        <ErrorAlert message={error} />
        <FormActions
          onBack={() => navigate("/onboarding/basic-identity")}
          submitLabel={t("onboarding.lifestyle.continue")}
          loading={loading}
        />
      </form>
    </OnboardingLayout>
  );
};

export default Lifestyle;
