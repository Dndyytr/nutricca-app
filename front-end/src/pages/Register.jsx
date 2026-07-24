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
import { getUserProfile } from "../services/api";
import { requestOtp } from "../services/api.js";

export const Register = () => {
  const navigate = useNavigate();

  const { register, loginWithGoogle } = useAuth();
  const { t } = useLocale();

  const [step, setStep] = useState(1); // 1: Form, 2: OTP
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setFormData((prev) => ({ ...prev, otp: value }));
    setError("");
  };

  const startResendCooldown = () => {
    setResendCooldown(30);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");

    // Validasi data awal
    if (!formData.fullName.trim())
      return setError(t("auth.register.validation.fullName"));
    if (!formData.email.trim())
      return setError(t("auth.register.validation.email"));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      return setError(t("auth.register.validation.invalidEmail"));
    if (formData.password.length < 6)
      return setError(t("auth.register.validation.passwordLength"));
    if (formData.password !== formData.confirmPassword)
      return setError(t("auth.register.validation.passwordMatch"));

    setLoading(true);
    showLoading(t("auth.register.otp.sending"), t("auth.register.setup"));

    try {
      await requestOtp(formData.email);
      closeFeedback();
      setStep(2);
      startResendCooldown();
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

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setLoading(true);
    showLoading(t("auth.register.otp.resending"), t("auth.register.setup"));
    try {
      await requestOtp(formData.email);
      closeFeedback();
      startResendCooldown();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.otp.length !== 6) {
      setError(t("auth.register.otp.validation"));
      return;
    }

    setLoading(true);
    showLoading(t("auth.register.loading"), t("auth.register.setup"));
    try {
      await register(
        formData.fullName,
        formData.email,
        formData.password,
        formData.otp,
      );

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

  const handleLoginWithGoogle = async () => {
    setError("");
    setLoading(true);
    showLoading(t("auth.login.loading"), t("auth.login.verifying"));

    try {
      const rawClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
      const clientId = rawClientId.replace(/^https?:\/\//i, "").trim();

      // Gunakan google.accounts.id.initialize untuk mendapatkan ID Token (JWT)
      window.google.accounts.id.initialize({
        client_id: clientId, // Pastikan ini ada di .env React
        callback: async (response) => {
          try {
            // response.credential berisi ID Token yang dibutuhkan Backend
            await loginWithGoogle(response.credential);

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
              err?.response?.data?.message ||
              err.message ||
              t("auth.login.failed");
            setError(msg);
            showError(t("auth.login.failedTitle"), msg);
          } finally {
            setLoading(false);
          }
        },
      });

      // Memunculkan popup login Google
      window.google.accounts.id.prompt();
    } catch (err) {
      closeFeedback();
      const msg = err?.message || t("auth.login.failed");
      setError(msg);
      showError(t("auth.login.failedTitle"), msg);
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
          {step === 1 ? (
            <>
              <div className="mb-10">
                <h2 className="t-size9 font-extrabold tracking-tight">
                  {t("auth.register.formTitle")}
                </h2>
                <p className="mt-2 t-size4 font-medium text-slate-500">
                  {t("auth.register.subtitle")}
                </p>
              </div>

              <form onSubmit={handleRequestOtp} className="space-y-6">
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
                      placeholder={t(
                        `auth.register.fields.${name}.placeholder`,
                      )}
                      className="w-full px-4 py-3.5 rounded-xl bg-slate-100 border-2 border-transparent text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-300 ease-in-out outline-none"
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
                  className={`w-full py-3.5 rounded-xl font-bold text-white transition-all duration-300 ease-in-out ${
                    loading
                      ? "bg-green-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 hover:shadow-xl hover:-translate-y-0.5 active:bg-green-700 active:scale-95 active:shadow-none"
                  }`}
                >
                  {loading
                    ? t("auth.register.loading")
                    : t("auth.register.submit")}
                </button>
              </form>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleLoginWithGoogle}
                  disabled={loading}
                  className="w-full flex items-center duration-300 ease-in-out justify-center gap-3 py-3.5 rounded-xl font-bold bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-50 active:border-slate-300 transition-all"
                >
                  <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt={t("auth.register.googleAlt")}
                    className="w-5 h-5"
                  />
                  {t("auth.register.google")}
                </button>
              </div>

              <div className="mt-8 text-center text-slate-500">
                {t("auth.register.hasAccount")}{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="font-bold text-green-600 hover:text-green-700 active:text-green-700 transition-all duration-300 ease-in-out"
                >
                  {t("auth.register.signIn")}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-10">
                <button
                  onClick={() => setStep(1)}
                  className="mb-4 t-size3 font-bold text-slate-500 hover:text-slate-700 transition-colors"
                >
                  &larr; {t("auth.register.otp.back")}
                </button>
                <h2 className="t-size9 font-extrabold tracking-tight">
                  {t("auth.register.otp.title")}
                </h2>
                <p className="mt-2 t-size4 font-medium text-slate-500">
                  {t("auth.register.otp.subtitle")}{" "}
                  <span className="font-bold text-slate-700">
                    {formData.email}
                  </span>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block t-size2 font-bold uppercase tracking-wide text-slate-700 mb-2">
                    {t("auth.register.otp.label")}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    name="otp"
                    value={formData.otp}
                    onChange={handleOtpChange}
                    placeholder={t("auth.register.otp.placeholder")}
                    maxLength={6}
                    autoFocus
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-100 border-2 border-transparent text-slate-900 text-center tracking-[0.5em] font-bold placeholder:text-slate-400 placeholder:tracking-normal placeholder:font-medium focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-300 ease-in-out outline-none"
                  />
                </div>

                {error && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                    <p className="t-size3 font-medium text-red-600">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || formData.otp.length !== 6}
                  className={`w-full py-3.5 rounded-xl font-bold text-white transition-all duration-300 ${
                    loading || formData.otp.length !== 6
                      ? "bg-green-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 hover:shadow-xl hover:-translate-y-0.5 active:bg-green-700 active:scale-95 active:shadow-none"
                  }`}
                >
                  {loading
                    ? t("auth.register.loading")
                    : t("auth.register.otp.submit")}
                </button>
              </form>

              <div className="mt-8 text-center text-slate-500 t-size3">
                {t("auth.register.otp.noCode")}{" "}
                <button
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                  className={`font-bold transition-colors ${
                    resendCooldown > 0 || loading
                      ? "text-slate-400 cursor-not-allowed"
                      : "text-green-600 hover:text-green-700 active:text-green-700"
                  }`}
                >
                  {resendCooldown > 0
                    ? t("auth.register.otp.resendCooldown", {
                        seconds: resendCooldown,
                      })
                    : t("auth.register.otp.resend")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
