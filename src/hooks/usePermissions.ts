import { useAuthStore } from "../stores/auth";
import {
  canAccessPath,
  firstAllowedPath,
  hasPermission,
  isSuperAdmin,
  type PermissionCode,
} from "../lib/permissions";

export function usePermissions() {
  const user = useAuthStore((s) => s.user);
  const permissions = useAuthStore((s) => s.permissions);

  return {
    user,
    permissions,
    isSuperAdmin: isSuperAdmin(user),
    homePath: firstAllowedPath(permissions, user),
    can: (code: PermissionCode | PermissionCode[] | null | undefined) =>
      hasPermission(permissions, code, user),
    canAccess: (pathname: string) =>
      canAccessPath(pathname, permissions, user),
  };
}
