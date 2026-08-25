import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { Tooltip } from "../Tooltip";
import { DrawerNavItem } from "./DrawerNavItem";
import type { NavGroup } from "../../types/sidebar";

interface DrawerTwoColumnLayoutProps {
  groups: NavGroup[];
  activeGroup: NavGroup | null;
  activeNavGroupKey: string | null;
  setActiveNavGroupKey: (key: string) => void;
  groupIcon: (key: string) => any;
  user: any;
  clearAuth: () => void | Promise<void>;
  pathname: string;
  openSubMenu: string | null;
  setOpenSubMenu: (href: string | null) => void;
  togglePinItem: (href: string) => void;
  pinnedItemsV2: any[];
  locale: string;
}

export function DrawerTwoColumnLayout({
  groups,
  activeGroup,
  activeNavGroupKey,
  setActiveNavGroupKey,
  groupIcon,
  user,
  clearAuth,
  pathname,
  openSubMenu,
  setOpenSubMenu,
  togglePinItem,
  pinnedItemsV2,
  locale,
}: DrawerTwoColumnLayoutProps) {
  const { t } = useTranslation();

  return (
    <div
      dir={locale === "ar" ? "rtl" : "ltr"}
      className={locale === "ar" ? "text-right" : "text-left"}
    >
      <div className="drawer-shell fixed inset-y-0 inset-s-0 z-50 hidden w-74 overflow-hidden lg:flex">
        <div className="flex w-18 shrink-0 flex-col border-e border-border/60">
          <div className="flex justify-center px-2 py-4">
            <img
              src="/logo.svg"
              alt="Logo"
              width={28}
              height={28}
              className="h-7 w-7"
            />
          </div>
          <div className="mx-2.5 mb-2 h-px drawer-divider" />
          <nav className="drawer-nav-scroll flex flex-1 flex-col items-center gap-1 overflow-y-auto px-1.5">
            {groups.map((group) => {
              const Icon = groupIcon(group.groupKey);
              const selected = activeGroup?.groupKey === group.groupKey;
              return (
                <Tooltip
                  key={group.groupKey}
                  content={t(`SIDEBAR.${group.groupKey}`, {
                    defaultValue: group.groupLabelStr,
                  })}
                >
                  <button
                    type="button"
                    onClick={() => setActiveNavGroupKey(group.groupKey)}
                    className={`relative flex size-10 items-center justify-center rounded-xl transition-all ${
                      selected
                        ? "drawer-icon-badge-active drawer-nav-active"
                        : "drawer-icon-badge-idle drawer-nav-idle"
                    }`}
                    aria-label={group.groupLabelStr}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    {selected && <span className="drawer-active-pulse" />}
                  </button>
                </Tooltip>
              );
            })}
          </nav>
          <div className="shrink-0 p-2">
            <div className="mb-2 h-px drawer-divider" />
            <Tooltip content={t("SIDEBAR.Logout")}>
              <button
                type="button"
                onClick={clearAuth}
                className="drawer-logout group flex w-full items-center justify-center rounded-xl px-3 py-2.5 transition-all duration-200"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="px-4 py-4">
            <p className="text-base font-bold uppercase tracking-[0.18em] text-foreground">
              {activeGroup
                ? t(`SIDEBAR.${activeGroup.groupKey}`, {
                    defaultValue: activeGroup.groupLabelStr,
                  })
                : t("SIDEBAR.Menu", { defaultValue: "Menu" })}
            </p>
          </div>
          <div className="mx-3 mb-2 h-px drawer-divider" />
          <nav className="drawer-nav-scroll relative z-10 flex-1 overflow-x-hidden overflow-y-auto px-2 pb-3">
            {activeGroup?.items.map((link, i) => (
              <div key={link.href}>
                <DrawerNavItem
                  link={link}
                  index={i}
                  isChild={false}
                  isMobileDrawer={true}
                  showPin={false}
                  inPinnedSection={false}
                  pathname={pathname}
                  collapsed={false}
                  openSubMenu={openSubMenu}
                  setOpenSubMenu={setOpenSubMenu}
                  togglePinItem={togglePinItem}
                  pinnedItemsV2={pinnedItemsV2}
                />
              </div>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
