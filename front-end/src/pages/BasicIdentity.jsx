import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { basicIdentityApi } from "../services/api.js";
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

export const BasicIdentity = () => {
  const navigate = useNavigate();
  const { completeOnboardingStep } = useAuth();
  const { t } = useLocale();

  const [formData, setFormData] = useState({
    age: "",
    gender: "Male",
    weight: "",
    height: "",
    activityLevel: "Lightly Active",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.age || !formData.weight || !formData.height) {
      setError(t("onboarding.basicIdentity.validation.required"));
      return;
    }
    if (formData.age < 18 || formData.age > 120) {
      setError(t("onboarding.basicIdentity.validation.age"));
      return;
    }
    setLoading(true);
    showLoading(
      t("onboarding.basicIdentity.saving"),
      t("onboarding.basicIdentity.savingDescription"),
    );
    try {
      const payload = {
        ...formData,
        age: Number(formData.age),
        weight: Number(formData.weight),
        height: Number(formData.height),
        activity_level: formData.activityLevel,
      };
      await basicIdentityApi(payload);
      completeOnboardingStep(payload);
      closeFeedback();
      await showSuccess(
        t("onboarding.basicIdentity.saved"),
        t("onboarding.basicIdentity.savedDescription"),
      );
      navigate("/onboarding/lifestyle");
    } catch (err) {
      closeFeedback();
      const msg =
        err?.response?.data?.message ||
        err.message ||
        t("onboarding.basicIdentity.saveFailed");
      setError(msg);
      showError(t("onboarding.basicIdentity.saveFailedTitle"), msg);
    } finally {
      setLoading(false);
    }
  };

  const activityLevels = [
    "Sedentary",
    "Lightly Active",
    "Moderately Active",
    "Very Active",
    "Extra Active",
  ];

  return (
    <OnboardingLayout currentStep={1}>
      <div className="mb-8 md:mb-10">
        <h1 className="t-size9 font-extrabold tracking-tight text-slate-900 mb-3">
          {t("onboarding.basicIdentity.heading")}
        </h1>
        <p className="t-size4 text-slate-500 font-medium">
          {t("onboarding.basicIdentity.introduction")}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField label={t("onboarding.basicIdentity.fields.age")} required>
            <Input
              type="number"
              name="age"
              min="18"
              max="120"
              value={formData.age}
              onChange={handleChange}
              placeholder={t("onboarding.basicIdentity.placeholders.age")}
            />
          </FormField>
          <FormField
            label={t("onboarding.basicIdentity.fields.gender")}
            required
          >
            <Select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="Male">{t("onboarding.basicIdentity.male")}</option>
              <option value="Female">
                {t("onboarding.basicIdentity.female")}
              </option>
            </Select>
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField
            label={t("onboarding.basicIdentity.fields.weight")}
            required
          >
            <Input
              type="number"
              name="weight"
              step="0.1"
              min="30"
              max="300"
              value={formData.weight}
              onChange={handleChange}
              placeholder={t("onboarding.basicIdentity.placeholders.weight")}
            />
          </FormField>
          <FormField
            label={t("onboarding.basicIdentity.fields.height")}
            required
          >
            <Input
              type="number"
              name="height"
              min="100"
              max="250"
              value={formData.height}
              onChange={handleChange}
              placeholder={t("onboarding.basicIdentity.placeholders.height")}
            />
          </FormField>
        </div>
        <FormField
          label={t("onboarding.basicIdentity.fields.activityLevel")}
          required
        >
          <Select
            name="activityLevel"
            value={formData.activityLevel}
            onChange={handleChange}
          >
            {activityLevels.map((level) => (
              <option key={level} value={level}>
                {t(`onboarding.basicIdentity.activityLevels.${level}`)}
              </option>
            ))}
          </Select>
        </FormField>
        <ErrorAlert message={error} />
        <FormActions
          onBack={() => navigate("/onboarding")}
          submitLabel={t("onboarding.basicIdentity.continue")}
          loading={loading}
        />
      </form>
    </OnboardingLayout>
  );
};
