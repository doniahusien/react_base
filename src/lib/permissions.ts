import type { AdminProfile } from "../types/admin";
import type { NavGroup, NavItem } from "../types/sidebar";

/**
 * The permission codes the API issues, as returned by `GET /admin/profile`
 * and `GET /admin/permissions`. Keep this list identical to the backend: a code
 * that exists only here silently locks sub admins out of the screen.
 */
export const PERMISSION_CODES = {
  manage_sub_admins: "manage_sub_admins",
  manage_clients: "manage_clients",
  manage_lawyers: "manage_lawyers",
  manage_law_firms: "manage_law_firms",
  manage_verifications: "manage_verifications",
  manage_complaints: "manage_complaints",
  manage_lawyer_deletion_requests: "manage_lawyer_deletion_requests",
  manage_subscription_plans: "manage_subscription_plans",
  manage_payments: "manage_payments",
  manage_codes: "manage_codes",
  manage_content: "manage_content",
  manage_questions: "manage_questions",
  manage_pages: "manage_pages",
  manage_settings: "manage_settings",
  manage_notifications: "manage_notifications",
  manage_contacts: "manage_contacts",
  manage_languages: "manage_languages",
  manage_practice_areas: "manage_practice_areas",
  manage_regions: "manage_regions",
  manage_countries: "manage_countries",
  manage_block_templates: "manage_block_templates",
  manage_sliders: "manage_sliders",
} as const;

export type PermissionCode =
  (typeof PERMISSION_CODES)[keyof typeof PERMISSION_CODES] | string;

/** Path prefix → required permission code (null = any authenticated admin) */
export const ROUTE_PERMISSIONS: Array<{
  prefix: string;
  permission: PermissionCode | null;
}> = [
  { prefix: "/profile", permission: null },
  { prefix: "/sub-admins", permission: PERMISSION_CODES.manage_sub_admins },
  { prefix: "/permissions", permission: PERMISSION_CODES.manage_sub_admins },
  { prefix: "/clients", permission: PERMISSION_CODES.manage_clients },
  { prefix: "/lawyers", permission: PERMISSION_CODES.manage_lawyers },
  { prefix: "/law-firms", permission: PERMISSION_CODES.manage_law_firms },
  { prefix: "/verifications", permission: PERMISSION_CODES.manage_verifications },
  {
    prefix: "/lawyer-deletion-requests",
    permission: PERMISSION_CODES.manage_lawyer_deletion_requests,
  },
  { prefix: "/complaints", permission: PERMISSION_CODES.manage_complaints },
  { prefix: "/questions", permission: PERMISSION_CODES.manage_questions },
  { prefix: "/contacts", permission: PERMISSION_CODES.manage_contacts },
  { prefix: "/payments", permission: PERMISSION_CODES.manage_payments },
  {
    prefix: "/subscription-plans",
    permission: PERMISSION_CODES.manage_subscription_plans,
  },
  { prefix: "/codes", permission: PERMISSION_CODES.manage_codes },
  { prefix: "/blogs", permission: PERMISSION_CODES.manage_content },
  { prefix: "/blog-categories", permission: PERMISSION_CODES.manage_content },
  { prefix: "/pages", permission: PERMISSION_CODES.manage_pages },
  { prefix: "/blocks", permission: PERMISSION_CODES.manage_block_templates },
  { prefix: "/sliders", permission: PERMISSION_CODES.manage_sliders },
  { prefix: "/notifications", permission: PERMISSION_CODES.manage_notifications },
  { prefix: "/languages", permission: PERMISSION_CODES.manage_languages },
  { prefix: "/practice-areas", permission: PERMISSION_CODES.manage_practice_areas },
  { prefix: "/regions", permission: PERMISSION_CODES.manage_regions },
  { prefix: "/countries", permission: PERMISSION_CODES.manage_countries },
  { prefix: "/settings", permission: PERMISSION_CODES.manage_settings },
  { prefix: "/contact-settings", permission: PERMISSION_CODES.manage_settings },
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
