import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Tooltip } from "../Tooltip";
import type { DrawerUserProfileProps } from "./types";

export function DrawerUserProfile({
  user,
  collapsed,
  isMobileDrawer,
  clearAuth,
  onMobileClose,
}: DrawerUserProfileProps) {
  const { t } = useTranslation();
  const showLabel = isMobileDrawer || !collapsed;

  return (
    <div className="relative z-10 p-3 shrink-0">
      <div className="drawer-divider h-px mb-3" />
      
      {/* Sign out button only - no user profile/avatar */}
      {!showLabel ? (
        <Tooltip content={t("SIDEBAR.Logout")} disabled={isMobileDrawer}>
          <button
            onClick={clearAuth}
            className="drawer-logout group flex items-center justify-center gap-2.5 w-full rounded-xl px-3 py-2.5 transition-all duration-200"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:scale-110" />
          </button>
        </Tooltip>
      ) : (
        <button
          onClick={clearAuth}
          className="drawer-logout group flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 transition-all duration-200"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:scale-110" />
          <span className="text-sm font-medium">{t("SIDEBAR.Logout")}</span>
        </button>
      )}
    </div>
  );
}
