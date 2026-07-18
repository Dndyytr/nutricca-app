import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../hooks/useApp";
import { useAuth } from "../hooks/useAuth";
import {
  updateUserProfile,
  updateBasicIdentity as updateBasicIdentityApi,
} from "../services/api.js";
import {
  showLoading,
  showSuccess,
  showError,
  closeFeedback,
} from "../shared/ui/feedback";
import { useConfirm } from "../shared/ui/use-confirm";
import { useLocale } from "../i18n/locale-context";

const TAB_LIST = [
  { key: "general" },
  { key: "health" },
  { key: "lifestyle" },
  { key: "goals" },
  { key: "settings" },
];

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0">
    <span className="t-size3 text-slate-400 font-medium">{label}</span>
    <span className="t-size3 font-medium text-slate-900">{value || "-"}</span>
  </div>
);

const Field = ({ label, children }) => (
  <div>
    <label className="block t-size2 text-slate-400 mb-1.5 font-medium">
      {label}
    </label>
    {children}
  </div>
);

const inputClass = (editing) =>
  `w-full px-3 py-2 rounded-lg t-size3 font-medium outline-none transition-all duration-200 ${
    editing
      ? "bg-white border-2 border-green-500 text-slate-900 focus:ring-4 focus:ring-green-500/10"
      : "bg-slate-50 border-2 border-slate-100 text-slate-500 cursor-not-allowed"
  }`;

export const Profile = () => {
  const { logout } = useAuth();
  const { locale, t } = useLocale();
  const { confirm } = useConfirm();
  const navigate = useNavigate();
  const { userProfile, fetchUserProfile } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [activeTab, setActiveTab] = useState("general");
  const formData = draft ?? userProfile;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDraft((prev) => ({ ...(prev ?? userProfile), [name]: value }));
  };

  const handleSave = async () => {
    showLoading(t("profile.saving"), t("profile.updating"));
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
      if (typeof fetchUserProfile === "function") await fetchUserProfile();
      setDraft(null);
      setIsEditing(false);
      closeFeedback();
      showSuccess(t("profile.updated"), t("profile.updatedDescription"));
    } catch (err) {
      closeFeedback();
      showError(t("profile.saveFailed"), err.response?.data?.message || err.message);
    }
  };

  const handleCancel = () => {
    setDraft(null);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: t("profile.logoutTitle"),
      description: t("profile.logoutDescription"),
      confirmLabel: t("profile.logoutConfirm"),
      cancelLabel: t("profile.cancel"),
      destructive: true,
    });
    if (!confirmed) return;
    logout();
    navigate("/login");
  };

  const initials = userProfile?.fullName
    ? userProfile.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <div className="flex flex-col gap-4 font-sans">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-xl py-5 px-6 flex items-center justify-between shadow-md shadow-green-600/15">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center t-size6 font-bold text-white shrink-0 backdrop-blur-sm">
            {initials}
          </div>
          <div>
            <div className="t-size5 font-bold text-white">
              {userProfile?.fullName}
            </div>
            <div className="t-size2 text-white/80 mt-0.5 font-medium">
              {userProfile?.email}
            </div>
            <div className="flex gap-3 mt-1.5">
              <span className="t-size2 bg-white/20 text-white px-2.5 py-0.5 rounded-full font-medium">
                BMI {userProfile?.bmi?.toFixed(1)} · {userProfile?.bmiCategory}
              </span>
              <span className="t-size2 bg-white/20 text-white px-2.5 py-0.5 rounded-full font-medium">
                {t("profile.points", { value: userProfile?.activityPoints || 0 })}
              </span>
            </div>
          </div>
        </div>
        {!isEditing ? (
          <button
            onClick={() => {
              setDraft({ ...userProfile });
              setIsEditing(true);
            }}
            className="px-4 py-2 rounded-lg bg-white text-green-700 t-size3 font-semibold hover:bg-green-50 transition-colors cursor-pointer"
          >
            {t("profile.edit")}
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg bg-white/20 text-white t-size3 font-medium hover:bg-white/30 transition-colors cursor-pointer"
            >
              {t("profile.cancel")}
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-white text-green-700 t-size3 font-semibold hover:bg-green-50 transition-colors cursor-pointer"
            >
              {t("profile.save")}
            </button>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t("profile.weight"), value: `${userProfile?.weight} kg` },
          { label: t("profile.height"), value: `${userProfile?.height} cm` },
          { label: t("profile.age"), value: t("profile.years", { value: userProfile?.age }) },
          { label: t("profile.targetWeight"), value: `${userProfile?.targetWeight} kg` },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white border border-slate-200 rounded-xl py-3.5 px-4 shadow-sm"
          >
            <div className="t-size2 font-semibold text-slate-400 uppercase tracking-wider mb-1">
              {label}
            </div>
            <div className="t-size6 font-bold text-slate-900">{value}</div>
          </div>
        ))}
      </div>

      {/* Tabs + Content */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {/* Tab bar */}
        <div className="flex overflow-x-auto border-b border-slate-100 px-5 scrollbar-none">
          {TAB_LIST.map(({ key }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-5 py-3.5 t-size3 font-semibold cursor-pointer transition-all border-b-2 -mb-px whitespace-nowrap ${
                activeTab === key
                  ? "text-green-700 border-green-600"
                  : "text-slate-400 border-transparent hover:text-slate-600"
              }`}
            >
              {t(`profile.tabs.${key}`)}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-6">
          {/* General */}
          {activeTab === "general" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-3.5">
                <div className="t-size3 font-bold text-slate-900 mb-1">
                  {t("profile.basicInformation")}
                </div>
                <Field label={t("profile.fullName")}>
                  <input
                    type="text"
                    name="fullName"
                    value={formData?.fullName || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={inputClass(isEditing)}
                  />
                </Field>
                <Field label={t("profile.email")}>
                  <input
                    type="email"
                    name="email"
                    value={formData?.email || ""}
                    disabled
                    className={inputClass(false)}
                  />
                  <div className="t-size2 text-slate-400 mt-1 font-medium">
                    {t("profile.emailImmutable")}
                  </div>
                </Field>
              </div>
              <div className="flex flex-col gap-3.5">
                <div className="t-size3 font-bold text-slate-900 mb-1">
                  {t("profile.biometricData")}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label={t("profile.age")}>
                    <input
                      type="number"
                      name="age"
                      value={formData?.age || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={inputClass(isEditing)}
                    />
                  </Field>
                  <Field label={t("profile.gender")}>
                    <select
                      name="gender"
                      value={formData?.gender || "Laki-laki"}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={inputClass(isEditing)}
                    >
                      <option value="Laki-laki">{t("profile.male")}</option>
                      <option value="Perempuan">{t("profile.female")}</option>
                    </select>
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* Health */}
          {activeTab === "health" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <div className="t-size3 font-bold text-slate-900 mb-3.5">
                  {t("profile.bodyMeasurements")}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label={t("profile.weightKg")}>
                    <input
                      type="number"
                      name="weight"
                      step="0.1"
                      value={formData?.weight || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={inputClass(isEditing)}
                    />
                  </Field>
                  <Field label={t("profile.heightCm")}>
                    <input
                      type="number"
                      name="height"
                      value={formData?.height || ""}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={inputClass(isEditing)}
                    />
                  </Field>
                </div>
              </div>
              <div>
                <div className="t-size3 font-bold text-slate-900 mb-3.5">
                  {t("profile.healthInformation")}
                </div>
                <InfoRow
                  label={t("profile.medicalHistory")}
                  value={
                    userProfile?.medicalHistory?.length > 0
                      ? userProfile.medicalHistory.join(", ")
                      : t("profile.none")
                  }
                />
                <InfoRow
                  label={t("profile.allergies")}
                  value={
                    userProfile?.allergies?.length > 0
                      ? userProfile.allergies.join(", ")
                      : t("profile.none")
                  }
                />
                <InfoRow
                  label={t("profile.bloodPressure")}
                  value={
                    userProfile?.bloodPressure?.systolic
                      ? `${userProfile.bloodPressure.systolic}/${userProfile.bloodPressure.diastolic} mmHg`
                      : "-"
                  }
                />
              </div>
            </div>
          )}

          {/* Lifestyle */}
          {activeTab === "lifestyle" && (
            <div>
              <div className="t-size3 font-bold text-slate-900 mb-3.5">
                {t("profile.tabs.lifestyle")}
              </div>
              <div className="grid grid-cols-2 gap-x-5">
                <InfoRow
                  label={t("profile.dietaryPattern")}
                  value={userProfile?.dietaryPattern}
                />
                <InfoRow
                  label={t("profile.mealFrequency")}
                  value={
                    userProfile?.mealsPerDay
                      ? t("profile.timesPerDay", { value: userProfile.mealsPerDay })
                      : "-"
                  }
                />
                <InfoRow
                  label={t("profile.dailyWaterGoal")}
                  value={
                    userProfile?.dailyWaterIntakeGoal
                      ? t("profile.mlPerDay", { value: userProfile.dailyWaterIntakeGoal })
                      : "-"
                  }
                />
                <InfoRow
                  label={t("profile.avgSleepHours")}
                  value={
                    userProfile?.avgSleepHours
                      ? t("profile.hours", { value: userProfile.avgSleepHours })
                      : "-"
                  }
                />
                <InfoRow
                  label={t("profile.activityLevel")}
                  value={userProfile?.activityLevel}
                />
              </div>
            </div>
          )}

          {/* Goals */}
          {activeTab === "goals" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <div className="t-size3 font-bold text-slate-900 mb-3.5">
                  {t("profile.healthGoals")}
                </div>
                <InfoRow
                  label={t("profile.primaryGoal")}
                  value={userProfile?.primaryGoal}
                />
                <InfoRow
                  label={t("profile.targetWeight")}
                  value={
                    userProfile?.targetWeight
                      ? `${userProfile.targetWeight} kg`
                      : "-"
                  }
                />
                <div className="flex justify-between items-center py-2.5 border-b border-slate-50">
                  <span className="t-size3 text-slate-400 font-medium">
                    {t("profile.gapToTarget")}
                  </span>
                  <span className="t-size3 font-semibold text-green-600">
                    {userProfile?.weight && userProfile?.targetWeight
                      ? `${(userProfile.weight - userProfile.targetWeight).toFixed(1)} kg`
                      : "-"}
                  </span>
                </div>
              </div>
              <div>
                <div className="t-size3 font-bold text-slate-900 mb-3.5">
                  {t("profile.commitment")}
                </div>
                <InfoRow
                  label={t("profile.workoutsPerWeek")}
                  value={
                    userProfile?.commitmentDays
                      ? t("profile.days", { value: userProfile.commitmentDays })
                      : "-"
                  }
                />
                <div className="py-2.5">
                  <div className="t-size3 text-slate-400 mb-2 font-medium">
                    {t("profile.preferredActivities")}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {userProfile?.preferredActivities?.map((activity) => (
                      <span
                        key={activity}
                        className="px-3 py-1 rounded-full bg-green-50 text-green-700 t-size2 font-medium"
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
          {activeTab === "settings" && (
            <div className="flex flex-col gap-4">
              <div>
                <div className="t-size3 font-bold text-slate-900 mb-3.5">
                  {t("profile.account")}
                </div>
                <InfoRow label={t("profile.email")} value={userProfile?.email} />
                <InfoRow
                  label={t("profile.joined")}
                  value={
                    userProfile?.registeredAt
                      ? new Date(userProfile.registeredAt).toLocaleDateString(
                          locale === "id" ? "id-ID" : "en-US",
                        )
                      : "-"
                  }
                />
              </div>
              <div className="border-t border-slate-100 pt-4">
                <div className="t-size3 font-bold text-red-600 mb-3">
                  {t("profile.dangerZone")}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 t-size3 font-semibold hover:bg-red-100 transition-colors cursor-pointer"
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
                  {t("common.logout")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
