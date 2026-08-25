import { Pin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DrawerNavItem } from "./DrawerNavItem";
import { DrawerSectionTitle } from "./DrawerSectionTitle";
import type { DrawerNavGroupProps } from "./types";

export function DrawerNavGroup({
  group,
  index,
  isMobileDrawer = false,
  showPin = false,
  collapsed,
  pathname,
  openSubMenu,
  setOpenSubMenu,
  togglePinItem,
  togglePinGroup,
  pinnedItemsV2,
  onMobileClose,
}: DrawerNavGroupProps) {
  const { t } = useTranslation();
  const showLabel = isMobileDrawer || !collapsed;

  // Hide pinned items from their original group (they live under Pinned)
  const visibleItems = group.items.filter(
    (item) => !pinnedItemsV2.some((p) => p.id === `item-${item.href}`)
  );
  if (visibleItems.length === 0) return null;

  const groupItemHrefs = group.items.map((item) => item.href);
  const allPinned = groupItemHrefs.every((href) =>
    pinnedItemsV2.some((p) => p.id === `item-${href}`)
  );
  const somePinned = groupItemHrefs.some((href) =>
    pinnedItemsV2.some((p) => p.id === `item-${href}`)
  );

  return (
    <div key={group.groupKey} className={`group ${index > 0 ? "mt-3" : ""}`}>
      <div className="flex items-center justify-between gap-1">
        {showLabel && (
          <DrawerSectionTitle className="min-w-0 flex-1">
            {t(`SIDEBAR.${group.groupKey}`)}
          </DrawerSectionTitle>
        )}
        {showPin && showLabel && (
          <button
            onClick={() => togglePinGroup(group.groupKey, group.items)}
            className="me-2 shrink-0 rounded-md p-1 opacity-0 transition-all duration-200 group-hover:opacity-100"
            title={allPinned ? "Unpin All" : "Pin All"}
          >
            {allPinned ? (
              <Pin className="h-3 w-3 fill-primary text-primary" />
            ) : somePinned ? (
              <Pin className="h-3 w-3 fill-primary/60 text-primary/60" />
            ) : (
              <Pin className="h-3 w-3 text-foreground-40" />
            )}
          </button>
        )}
      </div>
      {!showLabel && index > 0 && <div className="drawer-divider mx-auto my-2 h-px w-8" />}
      <div className={`space-y-0.5 ${!showLabel ? "flex flex-col items-center" : ""}`}>
        {visibleItems.map((item, ii) => (
          <DrawerNavItem
            key={item.href}
            link={item}
            index={ii}
            isChild={false}
            isMobileDrawer={isMobileDrawer}
            showPin={showPin}
            inPinnedSection={false}
            pathname={pathname}
            collapsed={collapsed}
            openSubMenu={openSubMenu}
            setOpenSubMenu={setOpenSubMenu}
            togglePinItem={togglePinItem}
            pinnedItemsV2={pinnedItemsV2}
            onMobileClose={onMobileClose}
          />
        ))}
      </div>
    </div>
  );
}
