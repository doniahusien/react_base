import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AtSign, Lock, Moon, Sun } from "lucide-react";
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
    <div className="relative min-h-screen overflow-hidden bg-background p-4 transition-colors duration-300">
      <div className="mx-auto grid h-screen max-w-[1600px] gap-4 md:grid-cols-2 p-[clamp(1rem,2vw,2rem)]">
        <div className="relative flex flex-col overflow-hidden rounded-[2.5rem] p-10 gap-10 bg-[linear-gradient(145deg,rgba(139,125,216,0.95),rgba(106,90,205,0.85))] shadow-[0_20px_60px_rgba(71,85,105,0.15),inset_0_1px_2px_rgba(255,255,255,0.1)]">
          <div className="flex justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-white bg-[rgba(255,255,255,0.15)] backdrop-blur-md">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" fillOpacity=".95" />
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeOpacity=".85" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">Orelin</span>
            </div>
            <div className="flex items-center justify-end gap-3">
              <div className="flex items-center gap-1.5 rounded-xl border border-border/50 bg-card/80 p-1 backdrop-blur-md">
                {(["en", "ar"] as Locale[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold tracking-wide transition-all duration-200 ${lang === l ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}
                    aria-label={`Switch to ${l.toUpperCase()}`}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-card/80 text-muted-foreground backdrop-blur-md transition-all duration-200 hover:bg-primary/10 hover:text-primary"
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
              </button>
            </div>

          </div>

          <div className="flex flex-1 items-center justify-center text-white/80 drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
            <svg width="280" height="280" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="12" y1="22.08" x2="12" y2="12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div className="flex items-center justify-center overflow-hidden rounded-[2.5rem] bg-card p-4 shadow-[0_20px_60px_rgba(71,85,105,0.1)]">
          <div className="w-full max-w-[480px] py-8">
            <div className="mb-8">
              <h2 className="m-0 mb-3 text-3xl font-bold text-foreground">{t("LOGIN.secureLogin")}</h2>
              <p className="m-0 text-sm leading-relaxed text-muted-foreground">
                {t("LOGIN.enterCredentials")}
              </p>
            </div>

            <Form
              schema={schemas.login}
              values={values}
              onSubmit={handleSubmit}
              className="flex flex-col gap-5"
            >
              {({ errors, field, touch }) => (
                <>
                  <BaseTextInput
                    name="email"
                    label={`${t("TITLES.email")} *`}
                    placeholder={t("LABELS.email")}
                    type="email"
                    value={values.email}
                    onInput={(v) => { set("email")(v); touch("email"); }}
                    prependInputIcon={AtSign}
                    {...field("email", errors)}
                  />

                  <BaseTextInput
                    name="password"
                    label={`${t("TITLES.password")} *`}
                    placeholder={t("LABELS.password")}
                    type="password"
                    value={values.password}
                    onInput={(v) => { set("password")(v); touch("password"); }}
                    prependInputIcon={Lock}
                    {...field("password", errors)}
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 flex h-14 w-full items-center justify-center gap-2 rounded-xl border-none bg-foreground text-base font-bold text-background transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                  >
                    {loading ? (
                      <>
                        <span className="inline-block h-5 w-5 rounded-full border-2 border-background/30 border-t-primary-foreground animate-spin" />
                        <span>{t("LOGIN.authenticating")}</span>
                      </>
                    ) : (
                      t("TITLES.login")
                    )}
                  </button>
                </>
              )}
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
