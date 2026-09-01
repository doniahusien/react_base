import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AtSymbolIcon as AtSign, LockClosedIcon as Lock } from "@heroicons/react/24/outline";
import { BaseTextInput } from "../../components/Inputs/BaseTextInput";
import { Button } from "../../components/UI/Button";
import { Form } from "../../components/Inputs/Form";
import { ThemeSwitcher, LanguageSwitcher, Logo, LogoShowcase } from "../../components/Shared";
import { useAuthStore } from "../../stores/auth";
import { toast } from "../../stores/toast";
import api from "../../lib/axios";
import { useAppStore } from "../../store";
import { schemas } from "../../lib/schemas";
import { firstAllowedPath } from "../../lib/permissions";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { theme } = useAppStore();
  const [values, setValues] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof values) => (v: string) => setValues((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await api.post("auth/login", {
        email: values.email,
        password: values.password,
      });
      setAuth(res.data?.data);
      toast.success(t("MESSAGES.welcome"), res.data?.message);
      const { permissions, user } = useAuthStore.getState();
      navigate(firstAllowedPath(permissions, user));
    } catch (err: any) {
      toast.error(t("LOGIN.loginFailed"), err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === "dark";

  // Get computed CSS variable colors for dynamic theming
  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
  const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-secondary').trim();

  return (
    <div className="relative min-h-screen overflow-hidden bg-background transition-colors duration-300">
      {/* Constellation Lines Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle gradient backdrop - more visible in light mode */}
        <div
          className="absolute inset-0"
          style={{
            opacity: isDark ? 0.3 : 0.5,
            background: isDark
              ? `
                radial-gradient(at 20% 30%, color-mix(in srgb, var(--color-primary) 15%, transparent) 0px, transparent 50%),
                radial-gradient(at 80% 70%, color-mix(in srgb, var(--color-secondary) 12%, transparent) 0px, transparent 50%)
              `
              : `
                radial-gradient(at 20% 30%, color-mix(in srgb, var(--color-primary) 25%, transparent) 0px, transparent 50%),
                radial-gradient(at 80% 70%, color-mix(in srgb, var(--color-secondary) 20%, transparent) 0px, transparent 50%)
              `,
          }}
        />

        {/* Constellation Network */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: isDark ? 0.7 : 0.85 }}>
          <defs>
            <filter id="glow-constellation">
              <feGaussianBlur stdDeviation={isDark ? "2" : "1.5"} result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Generate constellation nodes and connecting lines */}
          {(() => {
            const nodes = Array.from({ length: 35 }, (_, i) => ({
              id: i,
              x: Math.random() * 100,
              y: Math.random() * 100,
              radius: Math.random() * 2 + 1.5,
              gradientNum: (i % 3) + 1,
              animationDelay: Math.random() * 5,
              animationDuration: 3 + Math.random() * 2,
            }));

            // Create connections between nearby nodes
            const connections: Array<{ from: typeof nodes[0], to: typeof nodes[0], distance: number }> = [];
            const maxDistance = 20; // Maximum distance to connect nodes

            nodes.forEach((node, i) => {
              nodes.slice(i + 1).forEach(otherNode => {
                const distance = Math.sqrt(
                  Math.pow(node.x - otherNode.x, 2) +
                  Math.pow(node.y - otherNode.y, 2)
                );
                if (distance < maxDistance) {
                  connections.push({ from: node, to: otherNode, distance });
                }
              });
            });

            return (
              <>
                {/* Render connection lines */}
                {connections.map((conn, i) => {
                  const opacity = 1 - (conn.distance / maxDistance);
                  const delay = Math.random() * 5;
                  const duration = 4 + Math.random() * 3;
                  const baseOpacity = isDark ? 0.6 : 0.85;

                  return (
                    <line
                      key={`line-${i}`}
                      x1={`${conn.from.x}%`}
                      y1={`${conn.from.y}%`}
                      x2={`${conn.to.x}%`}
                      y2={`${conn.to.y}%`}
                      stroke={primaryColor}
                      strokeWidth={isDark ? "1" : "1.5"}
                      opacity="0"
                      filter="url(#glow-constellation)"
                      style={{
                        animation: `line-fade ${duration}s ease-in-out ${delay}s infinite`,
                        opacity: opacity * baseOpacity * (isDark ? 0.5 : 0.7),
                      }}
                    />
                  );
                })}

                {/* Render nodes */}
                {nodes.map((node) => {
                  const nodeColor = node.gradientNum === 1 ? primaryColor :
                    node.gradientNum === 2 ? secondaryColor : primaryColor;

                  return (
                    <g key={`node-${node.id}`}>
                      {/* Outer pulse ring */}
                      <circle
                        cx={`${node.x}%`}
                        cy={`${node.y}%`}
                        r={node.radius + 2}
                        fill="none"
                        stroke={nodeColor}
                        strokeWidth={isDark ? "0.5" : "1"}
                        opacity="0"
                        style={{
                          animation: `pulse-ring ${node.animationDuration}s ease-in-out ${node.animationDelay}s infinite`,
                        }}
                      />
                      {/* Main node */}
                      <circle
                        cx={`${node.x}%`}
                        cy={`${node.y}%`}
                        r={isDark ? node.radius : node.radius * 1.2}
                        fill={nodeColor}
                        filter="url(#glow-constellation)"
                        style={{
                          animation: `node-pulse ${node.animationDuration}s ease-in-out ${node.animationDelay}s infinite`,
                        }}
                      />
                    </g>
                  );
                })}
              </>
            );
          })()}
        </svg>

        {/* Floating ambient particles - more visible in light mode */}
        {[...Array(20)].map((_, i) => {
          const useSecondary = i % 3 === 0;
          const particleColor = useSecondary ? secondaryColor : primaryColor;

          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${Math.random() * 3 + 1.5}px`,
                height: `${Math.random() * 3 + 1.5}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: particleColor,
                opacity: isDark ? (0.3 + Math.random() * 0.4) : (0.5 + Math.random() * 0.4),
                boxShadow: `0 0 ${Math.random() * (isDark ? 8 : 10) + (isDark ? 4 : 6)}px ${particleColor}`,
                animation: `constellation-drift ${15 + Math.random() * 10}s ease-in-out ${Math.random() * 5}s infinite`,
                filter: isDark ? 'blur(0.5px)' : 'blur(0.8px)',
              }}
            />
          );
        })}
      </div>

      <div className="relative mx-auto grid min-h-screen w-full max-w-360 items-center px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-2 lg:px-8 lg:py-10 xl:px-10">
        <div
          className="relative hidden min-h-155 w-full flex-col justify-between overflow-hidden rounded-4xl p-8 shadow-[0_20px_60px_rgba(71,85,105,0.15),inset_0_1px_2px_rgba(255,255,255,0.1)] lg:flex xl:p-10"
          style={{
            background: 'linear-gradient(145deg, var(--color-primary), var(--color-secondary))'
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-white bg-[rgba(255,255,255,0.15)] backdrop-blur-md">
                <Logo variant="onBrand" className="h-7 w-7" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs md:text-base font-bold leading-snug text-white">{t("TITLES.dashName")}</span>
                <span className="text-xs text-gray-300/80">{t("TITLES.dashDescription")}</span>
              </div>            </div>
            <div className="flex items-center justify-end gap-3">
              <LanguageSwitcher variant="pills" className="flex w-fit items-center gap-1.5 rounded-xl border border-border/50 bg-card/80 p-1 backdrop-blur-md" />
              <ThemeSwitcher
                iconSize={18}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-card/80 text-muted-foreground backdrop-blur-md transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:bg-white"
              />
            </div>

          </div>

          <div className="relative flex min-h-80 flex-1 items-center justify-center py-6">
            <LogoShowcase />
          </div>
        </div>

        <div className="relative flex w-full items-center justify-center overflow-hidden rounded-3xl border border-border/60 bg-card p-5 shadow-[0_20px_60px_rgba(71,85,105,0.1)] sm:rounded-[1.75rem] sm:p-8 lg:min-h-155 lg:p-9">
          <div className="w-full max-w-105">
            {/* Mobile header with logo and controls */}
            <div className="mb-6 flex items-center justify-between gap-3 sm:mb-8 lg:hidden">
              <div className="flex min-w-0 items-center gap-2.5">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white sm:h-11 sm:w-11"
                  style={{
                    background: 'linear-gradient(145deg, var(--color-primary), var(--color-secondary))'
                  }}
                >
                  <Logo variant="onBrand" className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="flex min-w-0 flex-col">
                  <span className="text-sm font-bold leading-snug text-foreground sm:text-base">{t("TITLES.dashName")}</span>
                  <span className="truncate text-[11px] text-muted-foreground sm:text-xs">{t("TITLES.dashDescription")}</span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <LanguageSwitcher
                  variant="pills"
                  className="flex items-center gap-0.5 rounded-full border border-border/50 bg-muted/40 p-0.5"
                />
                <ThemeSwitcher
                  iconSize={16}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border/50 bg-muted/40 text-muted-foreground transition-all duration-200 hover:bg-primary/10 hover:text-primary sm:h-9 sm:w-9"
                />
              </div>
            </div>

            <div className="mb-6 text-center sm:mb-8 lg:mb-10">
              <h2 className="m-0 mb-2 text-xl font-bold text-foreground sm:mb-3 sm:text-2xl lg:mb-4 lg:text-3xl">{t("LOGIN.secureLogin")}</h2>
              <p className="m-0 mx-auto max-w-sm text-[13px] leading-6 text-muted-foreground sm:text-sm sm:leading-7">
                {t("LOGIN.enterCredentials")}
              </p>
            </div>

            <Form
              schema={schemas.login}
              values={values}
              onSubmit={handleSubmit}
              className="flex flex-col gap-3.5 sm:gap-5"
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

                  <Button
                    type="submit"
                    loading={loading}
                    className="mt-2 h-11 w-full rounded-2xl text-sm font-bold shadow-[0_12px_30px_color-mix(in_srgb,var(--color-primary)_30%,transparent)] hover:-translate-y-0.5 hover:bg-secondary hover:shadow-[0_18px_36px_color-mix(in_srgb,var(--color-primary)_38%,transparent)] active:translate-y-0 sm:mt-4 sm:h-14 sm:text-base"
                  >
                    {t("TITLES.login")}
                  </Button>
                </>
              )}
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
