import "./index.css";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { Layout } from "./components/Layout";
import { ToastContainer } from "./components/UI/Toast";
import { useAuthStore } from "./stores/auth";
import { routes } from "./routes/routeList";
import { PageLoadSkeleton } from "./components/UI/Skeleton";

const Login = lazy(() => import("./routes/Auth/Login"));

// Only checks auth — does NOT render Layout so Layout isn't recreated per route
function AuthGuard() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  if (!isLoggedIn) return <Navigate to="/auth/login" replace />;
  return <Outlet />;
}

// Layout wrapper rendered once for all protected routes.
// Suspense lives HERE so lazy-loading only suspends the page content,
// NOT the Drawer/sidebar — which stays mounted and never re-animates.
function ProtectedLayout() {
  return (
    <Layout>
      <Suspense fallback={<PageLoadSkeleton />}>
        <Outlet />
      </Suspense>
    </Layout>
  );
}

function LoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-4 rounded-3xl border border-border bg-card p-8">
        <div className="skeleton-item mx-auto size-12 rounded-2xl" />
        <div className="skeleton-item mx-auto h-5 w-40 rounded-full" />
        <div className="skeleton-item h-11 w-full rounded-xl" />
        <div className="skeleton-item h-11 w-full rounded-xl" />
        <div className="skeleton-item h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
          <Routes>
            {/* Login gets its own Suspense since it's outside the layout */}
            <Route path="/auth/login" element={<Suspense fallback={<LoginFallback />}><Login /></Suspense>} />
            {/* AuthGuard + ProtectedLayout mount once and stay alive across navigations.
                Suspense is now INSIDE ProtectedLayout so the Drawer never unmounts. */}
            <Route element={<AuthGuard />}>
              <Route element={<ProtectedLayout />}>
                {routes.map((r) => (
                  <Route
                    key={r.path}
                    path={r.path}
                    element={<r.component />}
                  />
                ))}
              </Route>
            </Route>
          </Routes>
      </BrowserRouter>
      <ToastContainer />
    </I18nextProvider>
  );
}
