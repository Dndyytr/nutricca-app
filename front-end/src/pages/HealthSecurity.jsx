import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../hooks/useApp";
import { useAuth } from "../hooks/useAuth";
import { healthSecurityApi } from "../services/api.js";
import { OnboardingLayout } from "../components/ui/OnboardingLayout";
import {
  FormField,
  Input,
  Textarea,
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
import { useLocale } from "../i18n/locale-context";

const MEDICAL_OPTIONS = [
  "Hypertension",
  "Diabetes",
  "Asthma",
  "Cholesterol",
  "Heart Disease",
  "Other",
];
const ALLERGY_OPTIONS = [
  "Peanuts",
  "Gluten",
  "Dairy",
  "Eggs",
  "Shellfish",
  "Tree Nuts",
  "Fish",
  "Soy",
];

export const HealthSecurity = () => {
  const navigate = useNavigate();
  const { t } = useLocale();
  const { updateHealthSecurity } = useApp();
  const { completeOnboardingStep } = useAuth();

  const [formData, setFormData] = useState({
    medicalHistory: [],
    physicalInjuries: "",
    currentMedication: "",
    bloodPressure: { systolic: "", diastolic: "" },
    heartRate: "",
    allergies: [],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleList = (key, value) =>
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "systolic" || name === "diastolic") {
      setFormData((prev) => ({
        ...prev,
        bloodPressure: { ...prev.bloodPressure, [name]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (formData.bloodPressure.systolic && formData.bloodPressure.diastolic) {
      const s = Number(formData.bloodPressure.systolic);
      const d = Number(formData.bloodPressure.diastolic);
      if (s < 60 || s > 200 || d < 40 || d > 150) {
        setError(t("onboarding.medical.validation.bloodPressure"));
        return;
      }
    }
    const hr = Number(formData.heartRate);
    if (formData.heartRate && (hr < 30 || hr > 200)) {
      setError(t("onboarding.medical.validation.heartRate"));
      return;
    }

    setLoading(true);
    showLoading(t("onboarding.medical.saving"), t("onboarding.medical.savingDescription"));
    try {
      const payload = {
        medical_history: formData.medicalHistory.join(", "),
        physical_injuries: formData.physicalInjuries || null,
        current_medication: formData.currentMedication || null,
        blood_pressure:
          formData.bloodPressure.systolic && formData.bloodPressure.diastolic
            ? `${formData.bloodPressure.systolic}/${formData.bloodPressure.diastolic}`
            : null,
        heart_rate: formData.heartRate ? Number(formData.heartRate) : null,
        allergy: formData.allergies.join(", ") || null,
      };
      await healthSecurityApi(payload);
      updateHealthSecurity(payload);
      completeOnboardingStep(payload);
      closeFeedback();
      await showSuccess(
        t("onboarding.medical.saved"),
        t("onboarding.medical.savedDescription"),
      );
      navigate("/onboarding/goal-setting");
    } catch (err) {
      closeFeedback();
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        t("onboarding.medical.saveFailed");
      setError(msg);
      showError(t("onboarding.medical.saveFailedTitle"), msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout currentStep={3}>
      <div className="mb-8 md:mb-10">
        <h1 className="t-size9 font-extrabold tracking-tight text-slate-900 mb-3">
          {t("onboarding.medical.heading")}
        </h1>
        <p className="t-size4 text-slate-500 font-medium">
          {t("onboarding.medical.introduction")}
        </p>
      </div>
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 mb-6">
        <span className="text-amber-500 mt-0.5 flex-shrink-0">⚠️</span>
        <p className="t-size3 text-amber-700 font-medium">
          {t("onboarding.medical.warning")}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <FormField label={t("onboarding.medical.fields.medicalHistory")}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {MEDICAL_OPTIONS.map((c) => (
              <ToggleChip
                key={c}
                label={t(`onboarding.medical.conditions.${c}`)}
                selected={formData.medicalHistory.includes(c)}
                onClick={() => toggleList("medicalHistory", c)}
                withCheckbox
              />
            ))}
          </div>
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField label={t("onboarding.medical.fields.injuries")}>
            <Textarea
              name="physicalInjuries"
              value={formData.physicalInjuries}
              onChange={handleInputChange}
              placeholder={t("onboarding.medical.placeholders.injuries")}
              rows="3"
            />
          </FormField>
          <FormField label={t("onboarding.medical.fields.medication")}>
            <Textarea
              name="currentMedication"
              value={formData.currentMedication}
              onChange={handleInputChange}
              placeholder={t("onboarding.medical.placeholders.medication")}
              rows="3"
            />
          </FormField>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <FormField label={t("onboarding.medical.fields.systolic")}>
            <Input
              type="number"
              name="systolic"
              min="60"
              max="200"
              value={formData.bloodPressure.systolic}
              onChange={handleInputChange}
              placeholder="120"
            />
          </FormField>
          <FormField label={t("onboarding.medical.fields.diastolic")}>
            <Input
              type="number"
              name="diastolic"
              min="40"
              max="150"
              value={formData.bloodPressure.diastolic}
              onChange={handleInputChange}
              placeholder="80"
            />
          </FormField>
          <FormField label={t("onboarding.medical.fields.heartRate")}>
            <Input
              type="number"
              name="heartRate"
              min="30"
              max="200"
              value={formData.heartRate}
              onChange={handleInputChange}
              placeholder="72"
            />
          </FormField>
        </div>
        <FormField label={t("onboarding.medical.fields.allergies")}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ALLERGY_OPTIONS.map((a) => (
              <ToggleChip
                key={a}
                label={t(`onboarding.medical.allergies.${a}`)}
                selected={formData.allergies.includes(a)}
                onClick={() => toggleList("allergies", a)}
                withCheckbox
              />
            ))}
          </div>
        </FormField>
        <ErrorAlert message={error} />
        <FormActions
          onBack={() => navigate("/onboarding/lifestyle")}
          submitLabel={t("onboarding.medical.continue")}
          loading={loading}
        />
      </form>
    </OnboardingLayout>
  );
};
