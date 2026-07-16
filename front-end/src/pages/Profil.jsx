import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../hooks/useApp';
import { useAuth } from '../hooks/useAuth';
import {
  updateUserProfile,
  updateBasicIdentity as updateBasicIdentityApi,
} from '../services/api.js';
import { showLoading, showSuccess, showError, showConfirm, closeSwal } from '../utils/swal';

const TAB_LIST = [
  { key: 'general', label: 'General Info' },
  { key: 'health', label: 'Health' },
  { key: 'lifestyle', label: 'Lifestyle' },
  { key: 'goals', label: 'Goals' },
  { key: 'settings', label: 'Settings' },
];

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0">
    <span className="text-sm text-slate-400">{label}</span>
    <span className="text-sm font-medium text-slate-900">{value || '-'}</span>
  </div>
);

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs text-slate-400 mb-1.5">{label}</label>
    {children}
  </div>
);

const inputClass = (editing) =>
  `w-full px-3 py-2 rounded-lg text-sm outline-none transition-all duration-200 ${
    editing
      ? 'bg-white border-2 border-green-500 text-slate-900 focus:ring-4 focus:ring-green-500/10'
      : 'bg-slate-50 border-2 border-slate-100 text-slate-500 cursor-not-allowed'
  }`;

export const Profil = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { userProfile, fetchUserProfile } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(userProfile);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    setFormData(userProfile);
  }, [userProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    showLoading('Saving profile...', 'Updating your information.');
    try {
      await Promise.all([
        updateUserProfile({ fullname: formData.fullName }),
        updateBasicIdentityApi({
          age: parseInt(formData.age),
          gender: formData.gender,
          weight: parseFloat(formData.weight),
          height: parseFloat(formData.height),
          activity_level: formData.activityLevel,
        }),
      ]);
      if (typeof fetchUserProfile === 'function') await fetchUserProfile();
      setIsEditing(false);
      closeSwal();
      showSuccess('Profile Updated!', 'Your changes have been saved.');
    } catch (err) {
      closeSwal();
      showError('Failed to Save', err.response?.data?.message || err.message);
    }
  };

  const handleCancel = () => {
    setFormData(userProfile);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    const confirmed = await showConfirm(
      'Logout?',
      'Are you sure you want to sign out of Nutricca?',
      'Yes, logout',
      'Cancel',
    );
    if (!confirmed) return;
    logout();
    navigate('/login');
  };

  const initials = userProfile?.fullName
    ? userProfile.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <div className="flex flex-col gap-4 font-sans">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-xl py-5 px-6 flex items-center justify-between shadow-md shadow-green-600/15">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold text-white shrink-0 backdrop-blur-sm">
            {initials}
          </div>
          <div>
            <div className="text-lg font-bold text-white">
              {userProfile?.fullName}
            </div>
            <div className="text-xs text-white/80 mt-0.5">
              {userProfile?.email}
            </div>
            <div className="flex gap-3 mt-1.5">
              <span className="text-[11px] bg-white/20 text-white px-2.5 py-0.5 rounded-full font-medium">
                BMI {userProfile?.bmi?.toFixed(1)} · {userProfile?.bmiCategory}
              </span>
              <span className="text-[11px] bg-white/20 text-white px-2.5 py-0.5 rounded-full font-medium">
                {userProfile?.activityPoints || 0} pts
              </span>
            </div>
          </div>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 rounded-lg bg-white text-green-700 text-sm font-semibold hover:bg-green-50 transition-colors cursor-pointer"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg bg-white/20 text-white text-sm font-medium hover:bg-white/30 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-white text-green-700 text-sm font-semibold hover:bg-green-50 transition-colors cursor-pointer"
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Weight', value: `${userProfile?.weight} kg` },
          { label: 'Height', value: `${userProfile?.height} cm` },
          { label: 'Age', value: `${userProfile?.age} years` },
          { label: 'Target Weight', value: `${userProfile?.targetWeight} kg` },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white border border-slate-200 rounded-xl py-3.5 px-4 shadow-sm"
          >
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              {label}
            </div>
            <div className="text-xl font-bold text-slate-900">{value}</div>
          </div>
        ))}
      </div>

      {/* Tabs + Content */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {/* Tab bar */}
        <div className="flex overflow-x-auto border-b border-slate-100 px-5 scrollbar-none">
          {TAB_LIST.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-5 py-3.5 text-sm font-semibold cursor-pointer transition-all border-b-2 -mb-px whitespace-nowrap ${
                activeTab === key
                  ? 'text-green-700 border-green-600'
                  : 'text-slate-400 border-transparent hover:text-slate-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-6">
          {/* General */}
          {activeTab === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-3.5">
                <div className="text-sm font-bold text-slate-900 mb-1">
                  Basic Information
                </div>
                <Field label="Full Name">
                  <input
                    type="text"
                    name="fullName"
                    value={formData?.fullName || ''}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={inputClass(isEditing)}
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    name="email"
                    value={formData?.email || ''}
                    disabled
                    className={inputClass(false)}
                  />
                  <div className="text-[11px] text-slate-400 mt-1">
                    Email cannot be changed
                  </div>
                </Field>
              </div>
              <div className="flex flex-col gap-3.5">
                <div className="text-sm font-bold text-slate-900 mb-1">
                  Biometric Data
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Age">
                    <input
                      type="number"
                      name="age"
                      value={formData?.age || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={inputClass(isEditing)}
                    />
                  </Field>
                  <Field label="Gender">
                    <select
                      name="gender"
                      value={formData?.gender || 'Laki-laki'}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={inputClass(isEditing)}
                    >
                      <option value="Laki-laki">Male</option>
                      <option value="Perempuan">Female</option>
                    </select>
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* Health */}
          {activeTab === 'health' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <div className="text-sm font-bold text-slate-900 mb-3.5">
                  Body Measurements
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Weight (kg)">
                    <input
                      type="number"
                      name="weight"
                      step="0.1"
                      value={formData?.weight || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={inputClass(isEditing)}
                    />
                  </Field>
                  <Field label="Height (cm)">
                    <input
                      type="number"
                      name="height"
                      value={formData?.height || ''}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={inputClass(isEditing)}
                    />
                  </Field>
                </div>
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 mb-3.5">
                  Health Information
                </div>
                <InfoRow
                  label="Medical History"
                  value={
                    userProfile?.medicalHistory?.length > 0
                      ? userProfile.medicalHistory.join(', ')
                      : 'None'
                  }
                />
                <InfoRow
                  label="Allergies"
                  value={
                    userProfile?.allergies?.length > 0
                      ? userProfile.allergies.join(', ')
                      : 'None'
                  }
                />
                <InfoRow
                  label="Blood Pressure"
                  value={
                    userProfile?.bloodPressure?.systolic
                      ? `${userProfile.bloodPressure.systolic}/${userProfile.bloodPressure.diastolic} mmHg`
                      : '-'
                  }
                />
              </div>
            </div>
          )}

          {/* Lifestyle */}
          {activeTab === 'lifestyle' && (
            <div>
              <div className="text-sm font-bold text-slate-900 mb-3.5">
                Lifestyle
              </div>
              <div className="grid grid-cols-2 gap-x-5">
                <InfoRow
                  label="Dietary Pattern"
                  value={userProfile?.dietaryPattern}
                />
                <InfoRow
                  label="Meal Frequency"
                  value={
                    userProfile?.mealsPerDay
                      ? `${userProfile.mealsPerDay} times/day`
                      : '-'
                  }
                />
                <InfoRow
                  label="Daily Water Goal"
                  value={
                    userProfile?.dailyWaterIntakeGoal
                      ? `${userProfile.dailyWaterIntakeGoal} ml/day`
                      : '-'
                  }
                />
                <InfoRow
                  label="Avg Sleep Hours"
                  value={
                    userProfile?.avgSleepHours
                      ? `${userProfile.avgSleepHours} hours`
                      : '-'
                  }
                />
                <InfoRow
                  label="Activity Level"
                  value={userProfile?.activityLevel}
                />
              </div>
            </div>
          )}

          {/* Goals */}
          {activeTab === 'goals' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <div className="text-sm font-bold text-slate-900 mb-3.5">
                  Health Goals
                </div>
                <InfoRow
                  label="Primary Goal"
                  value={userProfile?.primaryGoal}
                />
                <InfoRow
                  label="Target Weight"
                  value={
                    userProfile?.targetWeight
                      ? `${userProfile.targetWeight} kg`
                      : '-'
                  }
                />
                <div className="flex justify-between items-center py-2.5 border-b border-slate-50">
                  <span className="text-sm text-slate-400">Gap to Target</span>
                  <span className="text-sm font-semibold text-green-600">
                    {userProfile?.weight && userProfile?.targetWeight
                      ? `${(userProfile.weight - userProfile.targetWeight).toFixed(1)} kg`
                      : '-'}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 mb-3.5">
                  Commitment
                </div>
                <InfoRow
                  label="Workouts Per Week"
                  value={
                    userProfile?.commitmentDays
                      ? `${userProfile.commitmentDays} days`
                      : '-'
                  }
                />
                <div className="py-2.5">
                  <div className="text-sm text-slate-400 mb-2">
                    Preferred Activities
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {userProfile?.preferredActivities?.map((activity) => (
                      <span
                        key={activity}
                        className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium"
                      >
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <div className="flex flex-col gap-4">
              <div>
                <div className="text-sm font-bold text-slate-900 mb-3.5">
                  Account
                </div>
                <InfoRow label="Email" value={userProfile?.email} />
                <InfoRow
                  label="Joined"
                  value={
                    userProfile?.registeredAt
                      ? new Date(userProfile.registeredAt).toLocaleDateString(
                          'en-US',
                        )
                      : '-'
                  }
                />
              </div>
              <div className="border-t border-slate-100 pt-4">
                <div className="text-sm font-bold text-red-600 mb-3">
                  Danger Zone
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors cursor-pointer"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
