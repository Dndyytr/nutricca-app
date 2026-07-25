import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  getUserProfile,
  forgotPasswordApi,
  resetPasswordApi,
} from "../services/api";
import {
  showLoading,
  showError,
  showSuccess,
  closeFeedback,
} from "../shared/ui/feedback";
import { LanguageToggle } from "../components/LanguageToggle";
import { useLocale } from "../i18n/locale-context";

export const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const { t } = useLocale();

  // Mode: 'login' | 'forgot-email' | 'forgot-otp'
  const [mode, setMode] = useState("login");
  const [rememberMe, setRememberMe] = useState(true);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [forgotData, setForgotData] = useState({
    email: "",
    otp: "",
    newPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleForgotChange = (e) => {
    const { name, value } = e.target;
    setForgotData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleLoginWithGoogle = async () => {
    setError("");
    setLoading(true);
    showLoading(t("auth.login.loading"), t("auth.login.verifying"));

    try {
      const rawClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
      const clientId = rawClientId.replace(/^https?:\/\//i, "").trim();

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
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

      window.google.accounts.id.prompt();
    } catch (err) {
      closeFeedback();
      const msg = err?.message || t("auth.login.failed");
      setError(msg);
      showError(t("auth.login.failedTitle"), msg);
      setLoading(false);
    }
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
      await login(formData.email, formData.password, rememberMe);
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

  const handleRequestForgotOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!forgotData.email.trim()) {
      setError(t("register.validation.email") || "Email wajib diisi");
      return;
    }
    setLoading(true);
    showLoading(
      t("auth.login.sendingOtp") || "Mengirim OTP...",
      t("auth.login.loading"),
    );
    try {
      await forgotPasswordApi(forgotData.email);
      closeFeedback();
      showSuccess(
        t("auth.login.otpSentTitle") || "OTP Terkirim!",
        t("auth.login.otpSentDesc") || "Silakan periksa pesan email Anda.",
      );
      setMode("forgot-otp");
    } catch (err) {
      closeFeedback();
      const msg =
        err?.response?.data?.message || err.message || "Gagal mengirim OTP.";
      setError(msg);
      showError(t("auth.login.failedTitle"), msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!forgotData.otp.trim() || !forgotData.newPassword.trim()) {
      setError(t("auth.login.validation"));
      return;
    }
    if (forgotData.newPassword.length < 6) {
      setError(t("register.validation.passwordLength"));
      return;
    }
    setLoading(true);
    showLoading(
      t("auth.login.updatingPassword") || "Memperbarui Password...",
      t("auth.login.loading"),
    );
    try {
      await resetPasswordApi({
        email: forgotData.email,
        otp: forgotData.otp,
        newPassword: forgotData.newPassword,
      });
      closeFeedback();
      showSuccess(
        t("auth.login.passwordUpdatedTitle") || "Password Diperbarui!",
        t("auth.login.passwordUpdatedDesc") ||
          "Silakan masuk kembali dengan password baru Anda.",
      );
      setMode("login");
      setFormData((prev) => ({ ...prev, email: forgotData.email }));
      setForgotData({ email: "", otp: "", newPassword: "" });
    } catch (err) {
      closeFeedback();
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Gagal mereset password.";
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

      {/* RIGHT PANEL (IN-PLACE UI SWAP) */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* MODE: LOGIN */}
          {mode === "login" && (
            <>
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
                    placeholder={t("auth.login.emailPlaceholder")}
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

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-green-600 rounded border-slate-300 focus:ring-green-500 transition-all cursor-pointer"
                    />
                    <span className="t-size3 font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                      {t("auth.login.rememberMe") || "Ingatkan Saya"}
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setForgotData((prev) => ({
                        ...prev,
                        email: formData.email,
                      }));
                      setMode("forgot-email");
                    }}
                    className="t-size3 font-bold text-green-600 hover:text-green-700 transition-colors"
                  >
                    {t("auth.login.forgotPassword") || "Lupa Password?"}
                  </button>
                </div>

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
                  {loading ? t("auth.login.loading") : t("auth.login.submit")}
                </button>
              </form>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleLoginWithGoogle}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl font-bold bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-50 active:border-slate-300 transition-all duration-300 ease-in-out"
                >
                  <img
                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                    alt={t("auth.login.googleAlt")}
                    className="w-5 h-5"
                  />
                  {t("auth.login.google")}
                </button>
              </div>

              <div className="mt-8 text-center text-slate-500">
                {t("auth.login.noAccount")}{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="font-bold text-green-600 hover:text-green-700"
                >
                  {t("auth.login.createAccount")}
                </button>
              </div>
            </>
          )}

          {/* MODE: FORGOT-EMAIL */}
          {mode === "forgot-email" && (
            <>
              <div className="mb-10">
                <h2 className="t-size9 font-extrabold tracking-tight">
                  {t("auth.login.forgotTitle") || "Lupa Password"}
                </h2>
                <p className="mt-2 t-size4 font-medium text-slate-500">
                  {t("auth.login.forgotSubtitle") ||
                    "Masukkan email terdaftar kamu untuk menerima kode OTP verifikasi."}
                </p>
              </div>

              <form onSubmit={handleRequestForgotOtp} className="space-y-6">
                <div>
                  <label className="block t-size2 font-bold uppercase tracking-wide text-slate-700 mb-2">
                    {t("auth.login.registeredEmail") || "Email Terdaftar"}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={forgotData.email}
                    onChange={handleForgotChange}
                    placeholder="nama@email.com"
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
                  className="w-full py-3.5 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 active:scale-95"
                >
                  {t("auth.login.sendOtp") || "Kirim Kode OTP"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setMode("login");
                  }}
                  className="t-size3 font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  {t("auth.login.backToLogin") || "← Kembali ke Login"}
                </button>
              </div>
            </>
          )}

          {/* MODE: FORGOT-OTP */}
          {mode === "forgot-otp" && (
            <>
              <div className="mb-10">
                <h2 className="t-size9 font-extrabold tracking-tight">
                  {t("auth.login.resetTitle") || "Reset Password"}
                </h2>
                <p className="mt-2 t-size4 font-medium text-slate-500">
                  {t("auth.login.resetSubtitle", { email: forgotData.email }) ||
                    `Kode OTP telah dikirim ke ${forgotData.email}. Silakan periksa inbox/spam.`}
                </p>
              </div>

              <form onSubmit={handleResetPasswordSubmit} className="space-y-6">
                <div>
                  <label className="block t-size2 font-bold uppercase tracking-wide text-slate-700 mb-2">
                    {t("auth.login.otpCode") || "Kode OTP (6 Digit)"}
                  </label>
                  <input
                    type="text"
                    name="otp"
                    maxLength={6}
                    value={forgotData.otp}
                    onChange={handleForgotChange}
                    placeholder="123456"
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-100 border-2 border-transparent focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none font-mono text-center tracking-widest text-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block t-size2 font-bold uppercase tracking-wide text-slate-700 mb-2">
                    {t("auth.login.newPassword") || "Password Baru"}
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={forgotData.newPassword}
                    onChange={handleForgotChange}
                    placeholder={
                      t("auth.login.minCharacters") || "Minimal 6 karakter"
                    }
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
                  className="w-full py-3.5 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 active:scale-95"
                >
                  {t("auth.login.saveNewPassword") || "Simpan Password Baru"}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setMode("forgot-email");
                  }}
                  className="t-size3 font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  {t("auth.login.changeEmail") || "← Ubah Email"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
