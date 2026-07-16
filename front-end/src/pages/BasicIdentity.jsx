import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { basicIdentityApi } from '../services/api.js';
import { OnboardingLayout } from '../components/ui/OnboardingLayout';
import { FormField, Input, Select, ErrorAlert, FormActions } from '../components/ui/FormComponents';
import { showLoading, showSuccess, showError, closeSwal } from '../utils/swal';

export const BasicIdentity = () => {
  const navigate = useNavigate();
  const { completeOnboardingStep } = useAuth();

  const [formData, setFormData] = useState({
    age: '', gender: 'Male', weight: '', height: '', activityLevel: 'Lightly Active',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.age || !formData.weight || !formData.height) {
      setError('All fields are required'); return;
    }
    if (formData.age < 18 || formData.age > 120) {
      setError('Age must be between 18-120 years'); return;
    }
    setLoading(true);
    showLoading('Saving...', 'Storing your basic information.');
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
      closeSwal();
      await showSuccess('Saved!', 'Basic identity recorded. Moving to lifestyle.');
      navigate('/onboarding/lifestyle');
    } catch (err) {
      closeSwal();
      const msg = err?.response?.data?.message || err.message || 'Failed to save data';
      setError(msg);
      showError('Failed to Save', msg);
    } finally {
      setLoading(false);
    }
  };

  const activityLevels = [
    { value: 'Sedentary', label: 'Sedentary (Little/No activity)' },
    { value: 'Lightly Active', label: 'Lightly Active (Light)' },
    { value: 'Moderately Active', label: 'Moderately Active (Moderate)' },
    { value: 'Very Active', label: 'Very Active (Active)' },
    { value: 'Extra Active', label: 'Extra Active (Very active)' },
  ];

  return (
    <OnboardingLayout currentStep={1}>
      <div className="mb-8 md:mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">Let's get to know you.</h1>
        <p className="text-base text-slate-500">We need some basic biometric information to personalize your health dashboard and daily targets.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField label="Age" required>
            <Input type="number" name="age" min="18" max="120" value={formData.age} onChange={handleChange} placeholder="e.g. 24" />
          </FormField>
          <FormField label="Gender" required>
            <Select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </Select>
          </FormField>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField label="Weight (kg)" required>
            <Input type="number" name="weight" step="0.1" min="30" max="300" value={formData.weight} onChange={handleChange} placeholder="e.g. 68" />
          </FormField>
          <FormField label="Height (cm)" required>
            <Input type="number" name="height" min="100" max="250" value={formData.height} onChange={handleChange} placeholder="e.g. 170" />
          </FormField>
        </div>
        <FormField label="Daily Physical Activity Level" required>
          <Select name="activityLevel" value={formData.activityLevel} onChange={handleChange}>
            {activityLevels.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </Select>
        </FormField>
        <ErrorAlert message={error} />
        <FormActions onBack={() => navigate('/onboarding')} submitLabel="Continue to Lifestyle" loading={loading} />
      </form>
    </OnboardingLayout>
  );
};
