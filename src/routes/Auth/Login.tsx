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
      {/* Constellation Lines Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle gradient backdrop - more visible in light mode */}
        <div 
          className="absolute inset-0"
          style={{
            opacity: isDark ? 0.3 : 0.5,
            background: isDark 
              ? `
                radial-gradient(at 20% 30%, rgba(139, 125, 216, 0.15) 0px, transparent 50%),
                radial-gradient(at 80% 70%, rgba(106, 90, 205, 0.12) 0px, transparent 50%)
              `
              : `
                radial-gradient(at 20% 30%, rgba(139, 125, 216, 0.25) 0px, transparent 50%),
                radial-gradient(at 80% 70%, rgba(106, 90, 205, 0.2) 0px, transparent 50%)
              `,
          }}
        />
        
        {/* Constellation Network */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: isDark ? 0.7 : 0.85 }}>
          <defs>
            <filter id="glow-constellation">
              <feGaussianBlur stdDeviation={isDark ? "2" : "1.5"} result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            {/* Light mode gradients - more saturated */}
            <radialGradient id="node-gradient-1-light">
              <stop offset="0%" stopColor="rgba(106, 90, 205, 1)" />
              <stop offset="100%" stopColor="rgba(106, 90, 205, 0.5)" />
            </radialGradient>
            <radialGradient id="node-gradient-2-light">
              <stop offset="0%" stopColor="rgba(124, 58, 237, 1)" />
              <stop offset="100%" stopColor="rgba(124, 58, 237, 0.5)" />
            </radialGradient>
            <radialGradient id="node-gradient-3-light">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 1)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0.5)" />
            </radialGradient>
            {/* Dark mode gradients */}
            <radialGradient id="node-gradient-1-dark">
              <stop offset="0%" stopColor="rgba(139, 125, 216, 1)" />
              <stop offset="100%" stopColor="rgba(139, 125, 216, 0.3)" />
            </radialGradient>
            <radialGradient id="node-gradient-2-dark">
              <stop offset="0%" stopColor="rgba(124, 58, 237, 1)" />
              <stop offset="100%" stopColor="rgba(124, 58, 237, 0.3)" />
            </radialGradient>
            <radialGradient id="node-gradient-3-dark">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 1)" />
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0.3)" />
            </radialGradient>
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
                      stroke={isDark ? "rgba(139, 125, 216, 0.5)" : "rgba(106, 90, 205, 0.7)"}
                      strokeWidth={isDark ? "1" : "1.5"}
                      opacity="0"
                      filter="url(#glow-constellation)"
                      style={{
                        animation: `line-fade ${duration}s ease-in-out ${delay}s infinite`,
                        opacity: opacity * baseOpacity,
                      }}
                    />
                  );
                })}
                
                {/* Render nodes */}
                {nodes.map((node) => {
                  const gradientId = isDark 
                    ? `node-gradient-${node.gradientNum}-dark`
                    : `node-gradient-${node.gradientNum}-light`;
                    
                  return (
                    <g key={`node-${node.id}`}>
                      {/* Outer pulse ring */}
                      <circle
                        cx={`${node.x}%`}
                        cy={`${node.y}%`}
                        r={node.radius + 2}
                        fill="none"
                        stroke={`url(#${gradientId})`}
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
                        fill={`url(#${gradientId})`}
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
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 3 + 1.5}px`,
              height: `${Math.random() * 3 + 1.5}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: isDark 
                ? `rgba(139, 125, 216, ${0.3 + Math.random() * 0.4})`
                : `rgba(106, 90, 205, ${0.5 + Math.random() * 0.4})`,
              boxShadow: isDark
                ? `0 0 ${Math.random() * 8 + 4}px rgba(139, 125, 216, 0.5)`
                : `0 0 ${Math.random() * 10 + 6}px rgba(106, 90, 205, 0.6)`,
              animation: `constellation-drift ${15 + Math.random() * 10}s ease-in-out ${Math.random() * 5}s infinite`,
              filter: isDark ? 'blur(0.5px)' : 'blur(0.8px)',
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto grid h-screen max-w-375 gap-4 md:grid-cols-2 p-[clamp(6rem,3vw,4rem)]">
        <div className="relative flex flex-col overflow-hidden rounded-[2.5rem] p-8 gap-10 bg-[linear-gradient(145deg,rgba(139,125,216,0.95),rgba(106,90,205,0.85))] shadow-[0_20px_60px_rgba(71,85,105,0.15),inset_0_1px_2px_rgba(255,255,255,0.1)]">
          <div className="flex justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-white bg-[rgba(255,255,255,0.15)] backdrop-blur-md">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" fillOpacity=".95" />
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeOpacity=".85" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">Dashboard</span>
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
            <svg width="320" height="320" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Outer circle frame */}
              <circle cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="2" opacity="0.3" />
              <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
              
              {/* Central dashboard/analytics icon */}
              <g transform="translate(100, 100)">
                {/* Monitor/Screen */}
                <rect x="-40" y="-35" width="80" height="50" rx="4" stroke="currentColor" strokeWidth="2.5" fill="none" />
                <line x1="-40" y1="-15" x2="40" y2="-15" stroke="currentColor" strokeWidth="2" opacity="0.6" />
                
                {/* Chart bars inside screen */}
                <rect x="-28" y="-8" width="8" height="15" fill="currentColor" opacity="0.7" rx="1" />
                <rect x="-15" y="-12" width="8" height="19" fill="currentColor" opacity="0.8" rx="1" />
                <rect x="-2" y="-5" width="8" height="12" fill="currentColor" opacity="0.7" rx="1" />
                <rect x="11" y="-10" width="8" height="17" fill="currentColor" opacity="0.9" rx="1" />
                <rect x="24" y="-7" width="8" height="14" fill="currentColor" opacity="0.7" rx="1" />
                
                {/* Monitor stand */}
                <path d="M -15 15 L -15 25 L 15 25 L 15 15" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="0" y1="15" x2="0" y2="25" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                
                {/* Base */}
                <rect x="-25" y="25" width="50" height="4" rx="2" fill="currentColor" opacity="0.8" />
              </g>
              
              {/* Floating data nodes around */}
              <g opacity="0.6">
                <circle cx="40" cy="50" r="3" fill="currentColor">
                  <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx="160" cy="50" r="3" fill="currentColor">
                  <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" begin="0.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="170" cy="120" r="3" fill="currentColor">
                  <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" begin="1s" repeatCount="indefinite" />
                </circle>
                <circle cx="30" cy="120" r="3" fill="currentColor">
                  <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" begin="1.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="45" cy="155" r="3" fill="currentColor">
                  <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" begin="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="155" cy="155" r="3" fill="currentColor">
                  <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" begin="2.5s" repeatCount="indefinite" />
                </circle>
              </g>
              
              {/* Connecting lines (subtle) */}
              <g opacity="0.2" stroke="currentColor" strokeWidth="1">
                <line x1="40" y1="50" x2="70" y2="70" />
                <line x1="160" y1="50" x2="130" y2="70" />
                <line x1="170" y1="120" x2="130" y2="110" />
                <line x1="30" y1="120" x2="70" y2="110" />
                <line x1="45" y1="155" x2="80" y2="130" />
                <line x1="155" y1="155" x2="120" y2="130" />
              </g>
              
              {/* Orbital rings */}
              <g opacity="0.15" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="5,5">
                <ellipse cx="100" cy="100" rx="95" ry="95">
                  <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="30s" repeatCount="indefinite" />
                </ellipse>
              </g>
            </svg>
          </div>
        </div>

        <div className="flex items-center justify-center overflow-hidden rounded-[2.5rem] bg-card p-4 shadow-[0_20px_60px_rgba(71,85,105,0.1)]">
          <div className="w-full max-w-120 py-8">
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
