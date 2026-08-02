import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AtSign, Lock, LogIn, Moon, Sun, Shield, Zap, Clock } from "lucide-react";
import { BaseTextInput } from "../../components/Inputs/BaseTextInput";
import { Form } from "../../components/Inputs/Form";
import { useAuthStore } from "../../stores/auth";
import { toast } from "../../stores/toast";
import api from "../../lib/axios";
import { useAppStore } from "../../store";
import type { Locale } from "../../i18n";
import { schemas } from "../../lib/schemas";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { theme, lang, setTheme, setLang } = useAppStore();
  const [values, setValues] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof values) => (v: string) => setValues((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("login", values.email);
      fd.append("password", values.password);
      const res = await api.post("auth/login", fd);
      setAuth(res.data?.data);
      toast.success(t("MESSAGES.welcome"), res.data?.message);
      navigate("/");
    } catch (err: any) {
      toast.error("Login failed", err?.response?.data?.message);
    } finally { setLoading(false); }
  };

  const isDark = theme === "dark";

  return (
    <div className="lp-root-v2">
      {/* Animated Background Elements */}
      <div className="lp-bg-pattern" aria-hidden="true" />
      <div className="lp-gradient-orb lp-gradient-orb-1" aria-hidden="true" />
      <div className="lp-gradient-orb lp-gradient-orb-2" aria-hidden="true" />
      <div className="lp-gradient-orb lp-gradient-orb-3" aria-hidden="true" />
      <div className="lp-floating-shapes" aria-hidden="true">
        <div className="lp-shape lp-shape-1" />
        <div className="lp-shape lp-shape-2" />
        <div className="lp-shape lp-shape-3" />
        <div className="lp-shape lp-shape-4" />
      </div>

      {/* Mesh Gradient Overlay */}
      <div className="lp-mesh-gradient" aria-hidden="true" />

      {/* Top Controls */}
      <div className="lp-controls-v2">
        <div className="lp-pill-v2">
          {(["en", "ar"] as Locale[]).map((l) => (
            <button 
              key={l} 
              onClick={() => setLang(l)} 
              className={`lp-pill-btn-v2 ${lang === l ? "lp-pill-btn-v2--active" : ""}`} 
              aria-label={`Switch to ${l.toUpperCase()}`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <button 
          onClick={() => setTheme(isDark ? "light" : "dark")} 
          className="lp-theme-btn-v2" 
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
        </button>
      </div>

      {/* Main Container */}
      <div className="lp-container">
        {/* Left Side - Branding */}
        <div className="lp-brand-side">
          <div className="lp-brand-content">
            {/* Logo Section */}
            <div className="lp-logo-section">
              <div className="lp-logo-badge">
                <div className="lp-logo-shine" aria-hidden="true" />
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" fillOpacity=".95" />
                  <path d="M2 17l10 5 10-5" stroke="white" strokeOpacity=".8" strokeWidth="1.6" strokeLinecap="round" />
                  <path d="M2 12l10 5 10-5" stroke="white" strokeOpacity=".9" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>
              <div className="lp-logo-glow" aria-hidden="true" />
            </div>
            
            {/* Brand Text */}
            <div className="lp-brand-text">
              <h1 className="lp-brand-title">{t("TITLES.welcome")}</h1>
              <p className="lp-brand-subtitle">{t("TITLES.signinPrompt")}</p>
            </div>

            {/* Features List */}
            <div className="lp-features">
              <div className="lp-feature-item">
                <div className="lp-feature-icon">
                  <Shield size={22} strokeWidth={2} />
                </div>
                <div className="lp-feature-content">
                  <span className="lp-feature-title">{t("LOGIN.secureAuth")}</span>
                  <span className="lp-feature-desc">{t("LOGIN.secureAuthDesc")}</span>
                </div>
              </div>
              <div className="lp-feature-item">
                <div className="lp-feature-icon">
                  <Clock size={22} strokeWidth={2} />
                </div>
                <div className="lp-feature-content">
                  <span className="lp-feature-title">{t("LOGIN.availability")}</span>
                  <span className="lp-feature-desc">{t("LOGIN.availabilityDesc")}</span>
                </div>
              </div>
              <div className="lp-feature-item">
                <div className="lp-feature-icon">
                  <Zap size={22} strokeWidth={2} />
                </div>
                <div className="lp-feature-content">
                  <span className="lp-feature-title">{t("LOGIN.lightning")}</span>
                  <span className="lp-feature-desc">{t("LOGIN.lightningDesc")}</span>
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="lp-stats">
              <div className="lp-stat-item">
                <div className="lp-stat-number">99.9%</div>
                <div className="lp-stat-label">{t("LOGIN.uptime")}</div>
              </div>
              <div className="lp-stat-divider" />
              <div className="lp-stat-item">
                <div className="lp-stat-number">50K+</div>
                <div className="lp-stat-label">{t("LOGIN.activeUsers")}</div>
              </div>
              <div className="lp-stat-divider" />
              <div className="lp-stat-item">
                <div className="lp-stat-number">A+</div>
                <div className="lp-stat-label">{t("LOGIN.security")}</div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="lp-decorative-line" aria-hidden="true" />
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="lp-form-side">
          <div className="lp-glass-card">
            <div className="lp-glass-shine" aria-hidden="true" />
            <div className="lp-card-noise" aria-hidden="true" />
            
            {/* Form Header */}
            <div className="lp-form-header">
              <div className="lp-form-header-content">
                <h2 className="lp-form-title">{t("TITLES.login")}</h2>
                <div className="lp-form-badge">
                  <div className="lp-badge-dot" />
                  <span>{t("LOGIN.secureLogin")}</span>
                </div>
              </div>
              <p className="lp-form-subtitle">{t("LOGIN.enterCredentials")}</p>
            </div>

            {/* Form */}
            <Form schema={schemas.login} values={values} onSubmit={handleSubmit} className="lp-form-v2">
              {({ errors, field, touch }) => (
                <>
                  <div className="lp-input-group">
                    <BaseTextInput 
                      name="email" 
                      label={t("TITLES.email")} 
                      placeholder={t("LABELS.email")} 
                      type="email" 
                      value={values.email} 
                      onInput={(v) => { set("email")(v); touch("email"); }} 
                      prependInputIcon={AtSign} 
                      {...field("email", errors)} 
                    />
                  </div>
                  
                  <div className="lp-input-group">
                    <BaseTextInput 
                      name="password" 
                      label={t("TITLES.password")} 
                      placeholder={t("LABELS.password")} 
                      type="password" 
                      value={values.password} 
                      onInput={(v) => { set("password")(v); touch("password"); }} 
                      prependInputIcon={Lock} 
                      {...field("password", errors)} 
                    />
                  </div>

                  <button type="submit" disabled={loading} className="lp-submit-v2">
                    <span className="lp-submit-glow" aria-hidden="true" />
                    <span className="lp-submit-content">
                      {loading ? (
                        <>
                          <span className="lp-spinner-v2" />
                          <span>{t("LOGIN.authenticating")}</span>
                        </>
                      ) : (
                        <>
                          <LogIn size={18} strokeWidth={2.2} />
                          <span>{t("TITLES.login")}</span>
                        </>
                      )}
                    </span>
                  </button>
                </>
              )}
            </Form>

            {/* Trust Indicators */}
            <div className="lp-trust-badges">
              <div className="lp-trust-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>{t("LOGIN.sslSecured")}</span>
              </div>
              <div className="lp-trust-divider" />
              <div className="lp-trust-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span>{t("LOGIN.encrypted")}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="lp-form-footer">
            <p className="lp-footer-text">
              {t("LOGIN.termsFooter")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


