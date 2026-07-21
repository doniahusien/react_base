import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AtSign, Lock, LogIn, Moon, Sun } from "lucide-react";
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
    <div className="lp-root">
      <div className="lp-bg-grid" aria-hidden="true" />
      <div className="lp-bg-glow lp-bg-glow-1" aria-hidden="true" />
      <div className="lp-bg-glow lp-bg-glow-2" aria-hidden="true" />
      <div className="lp-bg-glow lp-bg-glow-3" aria-hidden="true" />

      <div className="lp-controls">
        <div className="lp-pill">
          {(["en", "ar"] as Locale[]).map((l) => (
            <button key={l} onClick={() => setLang(l)} className={`lp-pill-btn ${lang === l ? "lp-pill-btn--active" : "lp-pill-btn--idle"}`} aria-label={`Switch to ${l.toUpperCase()}`}>{l.toUpperCase()}</button>
          ))}
        </div>
        <button onClick={() => setTheme(isDark ? "light" : "dark")} className="lp-theme-btn" aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}>
          {isDark ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}
        </button>
      </div>

      <main className="lp-center">
        <div className="lp-logo-wrap">
          <div className="lp-logo-ring" />
          <div className="lp-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="white" fillOpacity=".95" />
              <path d="M2 17l10 5 10-5" stroke="white" strokeOpacity=".7" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M2 12l10 5 10-5" stroke="white" strokeOpacity=".85" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        <div className="lp-title-block">
          <h1 className="lp-title">{t("TITLES.welcome")}</h1>
          <p className="lp-subtitle">{t("TITLES.signinPrompt")}</p>
        </div>

        <div className="lp-card">
          <div className="lp-card-accent" aria-hidden="true" />
          <Form schema={schemas.login} values={values} onSubmit={handleSubmit} className="lp-form">
            {({ errors, field, touch }) => (
              <>
                <BaseTextInput name="email" label={t("TITLES.email")} placeholder={t("LABELS.email")} type="email" value={values.email} onInput={(v) => { set("email")(v); touch("email"); }} prependInputIcon={AtSign} {...field("email", errors)} />
                <BaseTextInput name="password" label={t("TITLES.password")} placeholder={t("LABELS.password")} type="password" value={values.password} onInput={(v) => { set("password")(v); touch("password"); }} prependInputIcon={Lock} {...field("password", errors)} />
                <button type="submit" disabled={loading} className="lp-submit">
                  <span className="lp-submit-bg" aria-hidden="true" />
                  {loading ? (<><span className="lp-spinner" /><span>...</span></>) : (<><LogIn size={16} strokeWidth={2.4} /><span>{t("TITLES.login")}</span></>)}
                </button>
              </>
            )}
          </Form>
        </div>
      </main>
    </div>
  );
}


