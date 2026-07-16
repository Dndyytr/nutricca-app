import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { lifestyleApi } from '../services/api';
import { OnboardingLayout } from '../components/ui/OnboardingLayout';
import { FormField, Input, Select, ErrorAlert, FormActions } from '../components/ui/FormComponents';
import { showLoading, showSuccess, showError, closeSwal } from '../utils/swal';

export const Lifestyle = () => {
  const navigate = useNavigate();
  const { completeOnboardingStep } = useAuth();

  const [form, setForm] = useState({
    dietaryPattern: 'High Protein', mealsPerDay: 3, dailyWaterIntakeGoal: 2000, avgSleepHours: 7,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.avgSleepHours < 4 || form.avgSleepHours > 12) {
      setError('Average sleep hours must be between 4 and 12 hours.'); return;
    }
    setLoading(true);
    showLoading('Saving...', 'Storing your lifestyle preferences.');
    try {
      const payload = {
        dietary_pattern: form.dietaryPattern,
        meals_per_day: Number(form.mealsPerDay),
        daily_water_intake_goal: Number(form.dailyWaterIntakeGoal),
        avg_sleep_hours: Number(form.avgSleepHours),
      };
      await lifestyleApi(payload);
      completeOnboardingStep(form);
      closeSwal();
      await showSuccess('Saved!', 'Lifestyle data recorded. Moving to medical history.');
      navigate('/onboarding/health-security');
    } catch (err) {
      closeSwal();
      const msg = err?.response?.data?.message || err.message || 'Failed to save';
      setError(msg);
      showError('Failed to Save', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout currentStep={2}>
      <div className="mb-8 md:mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">Lifestyle & Diet Habits.</h1>
        <p className="text-base text-slate-500">Tell us about your daily habits so we can personalize your nutrition plan and wellness recommendations.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField label="Dietary Pattern" required>
            <Select name="dietaryPattern" value={form.dietaryPattern} onChange={handleChange}>
              <option>High Protein</option>
              <option>Low Protein</option>
              <option>High Fiber</option>
              <option>Vegan</option>
            </Select>
          </FormField>
          <FormField label="Meals Per Day" required>
            <Input type="number" name="mealsPerDay" min="1" max="10" value={form.mealsPerDay} onChange={handleChange} placeholder="e.g. 3" />
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField label="Daily Water Goal (ml)" required>
            <Input type="number" name="dailyWaterIntakeGoal" value={form.dailyWaterIntakeGoal} onChange={handleChange} placeholder="e.g. 2000" />
          </FormField>
          <FormField label="Avg Sleep Hours" required>
            <Input type="number" name="avgSleepHours" step="0.1" min="4" max="12" value={form.avgSleepHours} onChange={handleChange} placeholder="e.g. 7" />
          </FormField>
        </div>
        <ErrorAlert message={error} />
        <FormActions onBack={() => navigate('/onboarding/basic-identity')} submitLabel="Continue to Medical" loading={loading} />
      </form>
    </OnboardingLayout>
  );
};

export default Lifestyle;
