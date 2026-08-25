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

  const handleLogout = async () => {
    await clearAuth();
    onMobileClose?.();
  };

  return (
    <div className={`relative z-10 shrink-0 ${showLabel ? "p-3" : "px-1 py-3"}`}>
      <div className={`drawer-divider mb-3 h-px ${showLabel ? "" : "mx-auto w-8"}`} />
      
      {/* Sign out button only - no user profile/avatar */}
      {!showLabel ? (
        <Tooltip content={t("SIDEBAR.Logout")} disabled={isMobileDrawer} centered>
          <button
            onClick={handleLogout}
            className="drawer-logout group mx-auto flex size-10 items-center justify-center rounded-xl transition-all duration-200"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:scale-110" />
          </button>
        </Tooltip>
      ) : (
        <button
          onClick={handleLogout}
          className="drawer-logout group flex items-center gap-2.5 w-full rounded-xl px-3 py-2.5 transition-all duration-200"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:scale-110" />
          <span className="text-sm font-medium">{t("SIDEBAR.Logout")}</span>
        </button>
      )}
    </div>
  );
}
