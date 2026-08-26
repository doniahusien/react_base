import type { AdminProfile } from "../types/admin";
import type { NavGroup, NavItem } from "../types/sidebar";

/** Built-in API codes + suggested codes for other modules */
export const PERMISSION_CODES = {
  manage_verifications: "manage_verifications",
  manage_content: "manage_content",
  manage_complaints: "manage_complaints",
  manage_notifications: "manage_notifications",
  manage_accounts: "manage_accounts",
  manage_billing: "manage_billing",
  manage_admins: "manage_admins",
} as const;

export type PermissionCode =
  (typeof PERMISSION_CODES)[keyof typeof PERMISSION_CODES] | string;

/** Path prefix → required permission code (null = any authenticated admin) */
export const ROUTE_PERMISSIONS: Array<{
  prefix: string;
  permission: PermissionCode | null;
}> = [
  { prefix: "/profile", permission: null },
  { prefix: "/sub-admins", permission: PERMISSION_CODES.manage_admins },
  { prefix: "/permissions", permission: PERMISSION_CODES.manage_admins },
  { prefix: "/verifications", permission: PERMISSION_CODES.manage_verifications },
  {
    prefix: "/lawyer-deletion-requests",
    permission: PERMISSION_CODES.manage_verifications,
  },
  { prefix: "/blogs", permission: PERMISSION_CODES.manage_content },
  { prefix: "/questions", permission: PERMISSION_CODES.manage_content },
  { prefix: "/languages", permission: PERMISSION_CODES.manage_content },
  { prefix: "/practice-areas", permission: PERMISSION_CODES.manage_content },
  { prefix: "/regions", permission: PERMISSION_CODES.manage_content },
  { prefix: "/contact-settings", permission: PERMISSION_CODES.manage_content },
  { prefix: "/complaints", permission: PERMISSION_CODES.manage_complaints },
  { prefix: "/contacts", permission: PERMISSION_CODES.manage_complaints },
  { prefix: "/clients", permission: PERMISSION_CODES.manage_accounts },
  { prefix: "/lawyers", permission: PERMISSION_CODES.manage_accounts },
  { prefix: "/law-firms", permission: PERMISSION_CODES.manage_accounts },
  { prefix: "/payments", permission: PERMISSION_CODES.manage_billing },
  { prefix: "/subscription-plans", permission: PERMISSION_CODES.manage_billing },
  { prefix: "/codes", permission: PERMISSION_CODES.manage_billing },
  { prefix: "/", permission: null },
];

export function isSuperAdmin(user: AdminProfile | null | undefined): boolean {
  if (!user) return false;
  return (
    user.admin_role === "super_admin" || user.user_type === "super_admin"
  );
}

export function hasPermission(
  permissions: string[] | undefined,
  code: PermissionCode | PermissionCode[] | null | undefined,
  user?: AdminProfile | null
): boolean {
  if (isSuperAdmin(user)) return true;
  if (code == null) return true;
  const list = permissions ?? [];
  const needed = Array.isArray(code) ? code : [code];
  return needed.some((c) => list.includes(c));
}

export function permissionForPath(pathname: string): PermissionCode | null {
  const path = pathname.split("?")[0] || "/";
  const match = ROUTE_PERMISSIONS.find((r) => {
    if (r.prefix === "/") return path === "/";
    return path === r.prefix || path.startsWith(`${r.prefix}/`);
  });
  return match?.permission ?? null;
}

export function canAccessPath(
  pathname: string,
  permissions: string[] | undefined,
  user?: AdminProfile | null
): boolean {
  return hasPermission(permissions, permissionForPath(pathname), user);
}

export function filterNavGroups(
  groups: NavGroup[],
  permissions: string[] | undefined,
  user?: AdminProfile | null
): NavGroup[] {
  const filterItem = (item: NavItem): NavItem | null => {
    const hrefPath = (item.href || "").split("?")[0] || "/";
    const required =
      item.permission !== undefined
        ? item.permission
        : permissionForPath(hrefPath);
    if (!hasPermission(permissions, required, user)) return null;
    if (!item.children?.length) return item;
    const children = item.children
      .map((c) => filterItem(c as NavItem))
      .filter(Boolean) as NavItem[];
    if (!children.length && item.children.length) return null;
    return { ...item, children };
  };

  return groups
    .map((g) => ({
      ...g,
      items: g.items.map(filterItem).filter(Boolean) as NavItem[],
    }))
    .filter((g) => g.items.length > 0);
}
