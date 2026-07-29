import "./index.css";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { Layout } from "./components/Layout";
import { ToastContainer } from "./components/UI/Toast";
import { useAuthStore } from "./stores/auth";
import { routes } from "./routes/routeList";

const Login = lazy(() => import("./routes/Auth/Login"));

// Only checks auth — does NOT render Layout so Layout isn't recreated per route
function AuthGuard() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  if (!isLoggedIn) return <Navigate to="/auth/login" replace />;
  return <Outlet />;
}

// Spinner for lazy page loads — only shown in the content area
const Spinner = () => (
  <div className="flex h-full items-center justify-center py-20">
    <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

// Layout wrapper rendered once for all protected routes.
// Suspense lives HERE so lazy-loading only suspends the page content,
// NOT the Drawer/sidebar — which stays mounted and never re-animates.
function ProtectedLayout() {
  return (
    <Layout>
      <Suspense fallback={<Spinner />}>
        <Outlet />
      </Suspense>
    </Layout>
  );
}

// Full-screen spinner only for the initial login page lazy load
const FullSpinner = () => (
  <div className="flex h-screen items-center justify-center">
    <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

export function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
          <Routes>
            {/* Login gets its own Suspense since it's outside the layout */}
            <Route path="/auth/login" element={<Suspense fallback={<FullSpinner />}><Login /></Suspense>} />
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
