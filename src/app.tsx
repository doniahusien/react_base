import "./index.css";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { Layout } from "./components/Layout";
import { ToastContainer } from "./components/UI/Toast";
import { useAuthStore } from "./stores/auth";
import { routes } from "./routes/routeList";

const Login = lazy(() => import("./routes/Auth/Login"));

function ProtectedPage({ component: Component }: { component: React.ComponentType }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  if (!isLoggedIn) return <Navigate to="/auth/login" replace />;
  return (
    <Layout>
      <Component />
    </Layout>
  );
}

const Spinner = () => (
  <div className="flex h-screen items-center justify-center">
    <span className="h-8 w-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
  </div>
);

export function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <Suspense fallback={<Spinner />}>
          <Routes>
            <Route path="/auth/login" element={<Login />} />
            {routes.map((r) => (
              <Route
                key={r.path}
                path={r.path}
                element={<ProtectedPage component={r.component} />}
              />
            ))}
          </Routes>
        </Suspense>
      </BrowserRouter>
      <ToastContainer />
    </I18nextProvider>
  );
}
