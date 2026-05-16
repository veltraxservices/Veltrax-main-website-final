import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { formatApiError } from "../lib/api";

const AdminLoginPage = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || t("admin.invalid"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-testid="admin-login-page"
      className="min-h-screen bg-[#0A0A0A] text-white flex flex-col"
    >
      <div className="vx-container py-8 flex items-center justify-between">
        <Link
          to="/"
          data-testid="admin-back-home"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white text-xs uppercase tracking-[0.18em] font-display"
        >
          <ArrowLeft size={14} />
          <img
            src="/brand/veltrax-logo.png"
            alt="Veltrax"
            className="h-12 w-12"
            style={{ objectFit: "contain" }}
          />
        </Link>
        <span className="vx-overline">Admin</span>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 hidden lg:flex relative items-end p-16 border-r border-white/10 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=85"
            alt=""
            className="absolute inset-0 w-full h-full object-cover vx-grayscale opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="relative z-10 max-w-lg"
          >
            <span className="vx-overline">— Internal</span>
            <h1 className="mt-4 font-display text-white text-5xl xl:text-6xl font-light tracking-[-0.03em] uppercase leading-[1.04]">
              Control room.
              <br />
              Stay premium.
            </h1>
            <p className="mt-6 text-white/60 font-light">
              Edit social links, portfolio and read incoming messages — all in one place.
            </p>
          </motion.div>
        </div>

        <div className="lg:col-span-5 flex items-center justify-center p-8 sm:p-16">
          <motion.form
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            data-testid="admin-login-form"
            className="w-full max-w-sm"
          >
            <span className="vx-overline">— {t("admin.login_title")}</span>
            <h2 className="mt-4 font-display text-white text-3xl sm:text-4xl font-light tracking-tight uppercase">
              {t("admin.login_title")}
            </h2>
            <p className="mt-3 text-white/55 font-light">{t("admin.login_subtitle")}</p>

            <div className="mt-10 space-y-8">
              <div>
                <label className="vx-overline block mb-2">{t("admin.email")}</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  data-testid="admin-login-email"
                  className="vx-input"
                  placeholder="admin@velstrax.com"
                />
              </div>
              <div>
                <label className="vx-overline block mb-2">{t("admin.password")}</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="admin-login-password"
                  className="vx-input"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <p
                data-testid="admin-login-error"
                className="mt-6 text-red-300/80 text-sm font-light"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              data-testid="admin-login-submit"
              className="vx-btn-primary mt-10 w-full disabled:opacity-50"
            >
              {loading ? t("admin.signing_in") : t("admin.sign_in")}
              <ArrowUpRight size={16} />
            </button>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
