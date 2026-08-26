import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermissions";

export function PermissionGuard({ children }: { children: ReactNode }) {
  const { canAccess, isSuperAdmin } = usePermissions();
  const { pathname } = useLocation();

  if (isSuperAdmin || canAccess(pathname)) {
    return <>{children}</>;
  }

  return <Navigate to="/" replace />;
}
