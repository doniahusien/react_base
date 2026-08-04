import { MapPinIcon } from "@heroicons/react/24/outline";
import { MapPinIcon as MapPinIconSolid } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";
import { DrawerNavItem } from "./DrawerNavItem";
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

  // Filter out pinned items from this group
  const pinnedHrefs = new Set(
    pinnedItemsV2.filter((p) => p.type === "item" && p.href).map((p) => p.href)
  );
  const visibleItems = group.items.filter((item) => !pinnedHrefs.has(item.href));

  // If all items are pinned and group is empty, don't render it
  if (visibleItems.length === 0) return null;

  // Check if all visible items from this group are pinned
  const groupItemHrefs = group.items.map((item) => item.href);
  const allPinned = groupItemHrefs.every((href) =>
    pinnedItemsV2.some((p) => p.id === `item-${href}`)
  );
  const somePinned = groupItemHrefs.some((href) =>
    pinnedItemsV2.some((p) => p.id === `item-${href}`)
  );

  return (
    <div key={group.groupKey} className={index > 0 ? "mt-3" : ""}>
      <div className="flex items-center justify-between group">
        {showLabel && (
          <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] select-none">
            {t(`SIDEBAR.${group.groupKey}`)}
          </p>
        )}
        {showPin && showLabel && (
          <button
            onClick={() => togglePinGroup(group.groupKey, group.items)}
            className="shrink-0 p-1 rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100 mr-2"
            title={allPinned ? "Unpin All" : "Pin All"}
          >
            {allPinned ? (
              <MapPinIconSolid className="w-3 h-3 text-primary" />
            ) : somePinned ? (
              <MapPinIconSolid className="w-3 h-3 text-primary/60" />
            ) : (
              <MapPinIcon className="w-3 h-3 text-foreground-40" />
            )}
          </button>
        )}
      </div>
      {!showLabel && index > 0 && <div className="mx-2 drawer-divider h-px my-2" />}
      <div className="space-y-0.5">
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
