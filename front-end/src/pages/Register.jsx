import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  showLoading,
  showSuccess,
  showError,
  closeFeedback,
} from "../shared/ui/feedback";
import { LanguageToggle } from "../components/LanguageToggle";
import { useLocale } from "../i18n/locale-context";

export const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useLocale();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
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
    if (!formData.fullName.trim()) {
      setError(t("auth.register.validation.fullName"));
      return;
    }
    if (!formData.email.trim()) {
      setError(t("auth.register.validation.email"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError(t("auth.register.validation.invalidEmail"));
      return;
    }
    if (formData.password.length < 6) {
      setError(t("auth.register.validation.passwordLength"));
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError(t("auth.register.validation.passwordMatch"));
      return;
    }

    setLoading(true);
    showLoading(t("auth.register.loading"), t("auth.register.setup"));
    try {
      await register(formData.fullName, formData.email, formData.password);
      closeFeedback();
      await showSuccess(
        t("auth.register.success"),
        t("auth.register.successDescription"),
      );
      navigate("/onboarding/basic-identity");
    } catch (err) {
      closeFeedback();
      const msg =
        err?.response?.data?.message ||
        err.message ||
        t("auth.register.failed");
      setError(msg);
      showError(t("auth.register.failedTitle"), msg);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "fullName", type: "text" },
    { name: "email", type: "email" },
    { name: "password", type: "password" },
    { name: "confirmPassword", type: "password" },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row text-slate-900">
      <div className="fixed top-4 right-4 z-10">
        <LanguageToggle />
      </div>
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-[42%] bg-slate-50 border-r border-slate-200 px-14 py-16 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-11 h-11 rounded-xl bg-green-600 flex items-center justify-center shadow-lg shadow-green-600/30">
              <img
                src="/favicon.svg"
                alt={t("auth.register.logoAlt")}
                className="w-6 h-6 brightness-0 invert"
              />
            </div>
            <span className="t-size7 font-extrabold tracking-tight">
              Nutricca
            </span>
          </div>
          <span className="inline-flex px-3 py-1 rounded-full bg-green-100 text-green-700 t-size2 font-bold uppercase tracking-wider mb-6">
            {t("auth.register.platform")}
          </span>
          <h1 className="t-size10 font-extrabold leading-tight tracking-tight">
            {t("auth.register.title")}
          </h1>
          <p className="mt-6 t-size5 leading-8 text-slate-500 max-w-md font-medium">
            {t("auth.register.description")}
          </p>
        </div>
        <div className="pt-10 border-t border-slate-200">
          <p className="t-size3 text-slate-400 font-medium">
            {t("auth.register.footer")}
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="t-size9 font-extrabold tracking-tight">
              {t("auth.register.formTitle")}
            </h2>
            <p className="mt-2 t-size4 font-medium text-slate-500">
              {t("auth.register.subtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {fields.map(({ name, type }) => (
              <div key={name}>
                <label className="block t-size2 font-bold uppercase tracking-wide text-slate-700 mb-2">
                  {t(`auth.register.fields.${name}.label`)}
                </label>
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  placeholder={t(`auth.register.fields.${name}.placeholder`)}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-100 border-2 border-transparent text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-200 outline-none"
                />
              </div>
            ))}

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                <p className="t-size3 font-medium text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-bold text-white transition-all duration-200 ${
                loading
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 hover:shadow-xl hover:-translate-y-0.5"
              }`}
            >
              {loading ? t("auth.register.loading") : t("auth.register.submit")}
            </button>
          </form>

          <div className="mt-8 text-center text-slate-500">
            {t("auth.register.hasAccount")}{" "}
            <button
              onClick={() => navigate("/login")}
              className="font-bold text-green-600 hover:text-green-700 transition-colors"
            >
              {t("auth.register.signIn")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
