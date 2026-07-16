import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { healthGoalsApi, generateDailyPlanApi, updateOnboardingStatus } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useApp } from '../hooks/useApp';
import { OnboardingLayout } from '../components/ui/OnboardingLayout';
import { FormField, ToggleChip, ErrorAlert, FormActions } from '../components/ui/FormComponents';
import { showLoading, showSuccess, showError, closeSwal } from '../utils/swal';
import Swal from 'sweetalert2';

const GOALS = ['Weight Loss', 'Muscle Gain', 'Endurance', 'General Well-being'];
const ACTIVITIES = ['Yoga', 'Running', 'Weight Training', 'Walking', 'Swimming', 'Cycling', 'HIIT', 'Pilates'];

export const GoalSetting = () => {
  const navigate = useNavigate();
  const { completeOnboardingStep } = useAuth();
  const { userProfile } = useApp();

  const [formData, setFormData] = useState({
    primaryGoal: 'Weight Loss', targetWeight: '', commitmentDays: 5, preferredActivities: [],
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleActivity = (a) => {
    setFormData((prev) => ({
      ...prev,
      preferredActivities: prev.preferredActivities.includes(a)
        ? prev.preferredActivities.filter((x) => x !== a)
        : [...prev.preferredActivities, a],
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.targetWeight) { setError('Target weight is required'); return; }
    if (formData.preferredActivities.length === 0) { setError('Select at least one preferred activity'); return; }
    const tw = Number(formData.targetWeight);
    if (tw < 30 || tw > 300) { setError('Target weight must be between 30-300 kg'); return; }

    setLoading(true);
    showLoading('Saving goals...', 'Almost done! Setting up your health plan.');
    try {
      const payload = {
        primary_goal: formData.primaryGoal,
        target_weight_kg: tw,
        commitment_days: Number(formData.commitmentDays),
        preferred_activity: formData.preferredActivities.join(', '),
      };
      await healthGoalsApi(payload);
      await updateOnboardingStatus();
      await completeOnboardingStep(payload);

      // Show AI generation loading
      Swal.fire({
        title: '✨ Generating your AI plan...',
        html: 'Our AI is crafting a personalized daily plan based on your goals.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        customClass: {
          popup: '!rounded-2xl !font-sans !shadow-2xl',
          title: '!text-slate-900 !text-lg !font-bold',
          htmlContainer: '!text-slate-500 !text-sm',
        },
        didOpen: () => Swal.showLoading(),
      });

      const today = new Date().toISOString().split('T')[0];
      await generateDailyPlanApi(today).catch((err) => console.warn('AI generation failed silently:', err));

      closeSwal();
      await showSuccess('All done! 🎉', 'Your personalized health plan is ready. Welcome to Nutricca!');
      navigate('/');
    } catch (err) {
      closeSwal();
      const msg = err?.response?.data?.message || err?.message || 'Failed to save data';
      setError(msg);
      showError('Failed to Save', msg);
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
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">Set your health goals.</h1>
        <p className="text-base text-slate-500">Tell us your targets and commitment so we can build a personalized plan just for you.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <FormField label="Primary Health Goal" required>
          <div className="grid grid-cols-2 gap-3">
            {GOALS.map((g) => (
              <ToggleChip key={g} label={g} selected={formData.primaryGoal === g} onClick={() => setFormData((p) => ({ ...p, primaryGoal: g }))} />
            ))}
          </div>
        </FormField>

        <FormField label="Target Weight (kg)" required>
          <div className="flex items-center gap-4">
            <input
              type="number" name="targetWeight" step="0.1" min="30" max="300"
              value={formData.targetWeight}
              onChange={(e) => { setFormData((p) => ({ ...p, targetWeight: e.target.value })); setError(''); }}
              placeholder="e.g. 65"
              className="flex-1 px-4 py-3.5 border-2 border-transparent rounded-xl text-sm text-slate-900 bg-slate-100 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-200"
            />
            {weightDiff !== null && (
              <div className="flex-shrink-0 text-right">
                <p className="text-xs text-slate-400 mb-0.5">Difference from now</p>
                <p className={`text-2xl font-extrabold ${Number(weightDiff) < 0 ? 'text-green-600' : 'text-amber-500'}`}>
                  {Number(weightDiff) > 0 ? '+' : ''}{weightDiff} kg
                </p>
              </div>
            )}
          </div>
        </FormField>

        <FormField label="Exercise Days Per Week" required>
          <div className="flex items-center gap-6">
            <input
              type="range" name="commitmentDays" min="1" max="7"
              value={formData.commitmentDays}
              onChange={(e) => setFormData((p) => ({ ...p, commitmentDays: e.target.value }))}
              className="flex-1 accent-green-600 h-2"
            />
            <div className="flex-shrink-0 text-center w-14">
              <span className="text-3xl font-extrabold text-green-600">{formData.commitmentDays}</span>
              <p className="text-xs text-slate-400 mt-0.5">days/week</p>
            </div>
          </div>
          <div className="flex justify-between px-0.5 mt-1">
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <span key={d} className={`text-xs font-bold ${d <= formData.commitmentDays ? 'text-green-600' : 'text-slate-300'}`}>{d}</span>
            ))}
          </div>
        </FormField>

        <FormField label="Preferred Activities" required>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ACTIVITIES.map((a) => (
              <ToggleChip key={a} label={a} selected={formData.preferredActivities.includes(a)} onClick={() => toggleActivity(a)} />
            ))}
          </div>
        </FormField>

        <ErrorAlert message={error} />
        <FormActions onBack={() => navigate('/onboarding/health-security')} submitLabel="Finish & Go to Dashboard" loading={loading} />
      </form>
    </OnboardingLayout>
  );
};
