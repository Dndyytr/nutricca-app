import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getUserProfile } from "../services/api";
import { showLoading, showError, closeFeedback } from "../shared/ui/feedback";
import { LanguageToggle } from "../components/LanguageToggle";
import { useLocale } from "../i18n/locale-context";

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLocale();
  const [formData, setFormData] = useState({ email: "", password: "" });
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
    if (!formData.email.trim() || !formData.password.trim()) {
      setError(t("auth.login.validation"));
      return;
    }
    setLoading(true);
    showLoading(t("auth.login.loading"), t("auth.login.verifying"));
    try {
      await login(formData.email, formData.password);
      const userIsOnboarded = await getUserProfile().then(
        (res) => res.data.user.is_onboarding_completed,
      );
      closeFeedback();
      if (userIsOnboarded === true) {
        navigate("/");
      } else {
        navigate("/onboarding/basic-identity");
      }
    } catch (err) {
      closeFeedback();
      const msg =
        err?.response?.data?.message || err.message || t("auth.login.failed");
      setError(msg);
      showError(t("auth.login.failedTitle"), msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row text-slate-900">
      <div className="fixed top-4 right-4 z-10">
        <LanguageToggle />
      </div>
      {/* LEFT PANEL */}
      {/* <Toaster /> */}
      <div className="hidden lg:flex w-[42%] bg-slate-50 border-r border-slate-200 px-14 py-16 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-11 h-11 rounded-xl bg-green-600 flex items-center justify-center shadow-lg shadow-green-600/30">
              <img
                src="/favicon.svg"
                alt={t("auth.login.logoAlt")}
                className="w-6 h-6 brightness-0 invert"
              />
            </div>
            <span className="t-size7 font-extrabold tracking-tight">
              Nutricca
            </span>
          </div>
          <span className="inline-flex px-3 py-1 rounded-full bg-green-100 text-green-700 t-size2 font-bold uppercase tracking-wider mb-6">
            {t("auth.login.platform")}
          </span>
          <h1 className="t-size10 font-extrabold leading-tight tracking-tight text-slate-900">
            {t("auth.login.welcome")}
          </h1>
          <p className="mt-6 t-size5 leading-8 text-slate-500 max-w-md font-medium">
            {t("auth.login.description")}
          </p>
        </div>
        <div className="pt-10 border-t border-slate-200">
          <p className="t-size3 text-slate-400 font-medium">
            {t("auth.login.footer")}
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="t-size9 font-extrabold tracking-tight">
              {t("auth.login.title")}
            </h2>
            <p className="mt-2 t-size4 font-medium text-slate-500">
              {t("auth.login.subtitle")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block t-size2 font-bold uppercase tracking-wide text-slate-700 mb-2">
                {t("auth.login.email")}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3.5 rounded-xl bg-slate-100 border-2 border-transparent focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block t-size2 font-bold uppercase tracking-wide text-slate-700 mb-2">
                {t("auth.login.password")}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3.5 rounded-xl bg-slate-100 border-2 border-transparent focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none"
              />
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                <p className="t-size3 font-medium text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-bold text-white transition-all ${
                loading
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 hover:shadow-xl hover:-translate-y-0.5"
              }`}
            >
              {loading ? t("auth.login.loading") : t("auth.login.submit")}
            </button>
          </form>

          <div className="mt-8 text-center text-slate-500">
            {t("auth.login.noAccount")}{" "}
            <button
              onClick={() => navigate("/register")}
              className="font-bold text-green-600 hover:text-green-700"
            >
              {t("auth.login.createAccount")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
