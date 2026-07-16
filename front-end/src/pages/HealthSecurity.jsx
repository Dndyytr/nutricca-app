import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { useAuth } from '../hooks/useAuth';
import { healthSecurityApi } from '../services/api.js';
import { OnboardingLayout } from '../components/ui/OnboardingLayout';
import { FormField, Input, Textarea, ToggleChip, ErrorAlert, FormActions } from '../components/ui/FormComponents';
import { showLoading, showSuccess, showError, closeSwal } from '../utils/swal';

const MEDICAL_OPTIONS = ['Hypertension', 'Diabetes', 'Asthma', 'Cholesterol', 'Heart Disease', 'Other'];
const ALLERGY_OPTIONS = ['Peanuts', 'Gluten', 'Dairy', 'Eggs', 'Shellfish', 'Tree Nuts', 'Fish', 'Soy'];

export const HealthSecurity = () => {
  const navigate = useNavigate();
  const { updateHealthSecurity } = useApp();
  const { completeOnboardingStep } = useAuth();

  const [formData, setFormData] = useState({
    medicalHistory: [], physicalInjuries: '', currentMedication: '',
    bloodPressure: { systolic: '', diastolic: '' }, heartRate: '', allergies: [],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleList = (key, value) =>
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter((v) => v !== value) : [...prev[key], value],
    }));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'systolic' || name === 'diastolic') {
      setFormData((prev) => ({ ...prev, bloodPressure: { ...prev.bloodPressure, [name]: value } }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.bloodPressure.systolic && formData.bloodPressure.diastolic) {
      const s = Number(formData.bloodPressure.systolic);
      const d = Number(formData.bloodPressure.diastolic);
      if (s < 60 || s > 200 || d < 40 || d > 150) { setError('Invalid blood pressure'); return; }
    }
    const hr = Number(formData.heartRate);
    if (formData.heartRate && (hr < 30 || hr > 200)) { setError('Heart rate must be between 30-200 bpm'); return; }

    setLoading(true);
    showLoading('Saving...', 'Storing your medical information securely.');
    try {
      const payload = {
        medical_history: formData.medicalHistory.join(', '),
        physical_injuries: formData.physicalInjuries || null,
        current_medication: formData.currentMedication || null,
        blood_pressure: formData.bloodPressure.systolic && formData.bloodPressure.diastolic
          ? `${formData.bloodPressure.systolic}/${formData.bloodPressure.diastolic}` : null,
        heart_rate: formData.heartRate ? Number(formData.heartRate) : null,
        allergy: formData.allergies.join(', ') || null,
      };
      await healthSecurityApi(payload);
      updateHealthSecurity(payload);
      completeOnboardingStep(payload);
      closeSwal();
      await showSuccess('Saved!', 'Medical history recorded. One last step!');
      navigate('/onboarding/goal-setting');
    } catch (err) {
      closeSwal();
      const msg = err?.response?.data?.message || err?.message || 'Failed to save data';
      setError(msg);
      showError('Failed to Save', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout currentStep={3}>
      <div className="mb-8 md:mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">Health & Medical History.</h1>
        <p className="text-base text-slate-500">Your medical history and health restrictions help us ensure AI recommendations are safe for you.</p>
      </div>
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 mb-6">
        <span className="text-amber-500 mt-0.5 flex-shrink-0">⚠️</span>
        <p className="text-sm text-amber-700 font-medium">This information is very important to ensure AI recommendations are safe for your health condition.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <FormField label="Medical History">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {MEDICAL_OPTIONS.map((c) => (
              <ToggleChip key={c} label={c} selected={formData.medicalHistory.includes(c)} onClick={() => toggleList('medicalHistory', c)} withCheckbox />
            ))}
          </div>
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField label="Physical Injuries">
            <Textarea name="physicalInjuries" value={formData.physicalInjuries} onChange={handleInputChange} placeholder="e.g. Knee injury in 2023..." rows="3" />
          </FormField>
          <FormField label="Current Medication">
            <Textarea name="currentMedication" value={formData.currentMedication} onChange={handleInputChange} placeholder="e.g. Metformin, Atorvastatin..." rows="3" />
          </FormField>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Systolic">
            <Input type="number" name="systolic" min="60" max="200" value={formData.bloodPressure.systolic} onChange={handleInputChange} placeholder="120" />
          </FormField>
          <FormField label="Diastolic">
            <Input type="number" name="diastolic" min="40" max="150" value={formData.bloodPressure.diastolic} onChange={handleInputChange} placeholder="80" />
          </FormField>
          <FormField label="Heart Rate (bpm)">
            <Input type="number" name="heartRate" min="30" max="200" value={formData.heartRate} onChange={handleInputChange} placeholder="72" />
          </FormField>
        </div>
        <FormField label="Food Allergies">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ALLERGY_OPTIONS.map((a) => (
              <ToggleChip key={a} label={a} selected={formData.allergies.includes(a)} onClick={() => toggleList('allergies', a)} withCheckbox />
            ))}
          </div>
        </FormField>
        <ErrorAlert message={error} />
        <FormActions onBack={() => navigate('/onboarding/lifestyle')} submitLabel="Continue to Goals" loading={loading} />
      </form>
    </OnboardingLayout>
  );
};
