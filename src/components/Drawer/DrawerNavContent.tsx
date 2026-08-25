import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useTranslation } from "react-i18next";
import type { NavGroup, NavItem } from "../../types/sidebar";
import { DrawerNavItem } from "./DrawerNavItem";
import { DrawerNavGroup } from "./DrawerNavGroup";
import { DrawerSectionTitle } from "./DrawerSectionTitle";

interface DrawerNavContentProps {
  groups: NavGroup[];
  pinnedItemsV2: any[];
  searchQuery: string;
  searchResults: NavItem[];
  collapsed: boolean;
  isMobileDrawer: boolean;
  pathname: string;
  openSubMenu: string | null;
  setOpenSubMenu: (href: string | null) => void;
  togglePinItem: (href: string) => void;
  togglePinGroup: (groupKey: string, items: NavItem[]) => void;
  reorderPinnedItems: (items: any[]) => void;
  onMobileClose?: () => void;
}

export function DrawerNavContent({
  groups,
  pinnedItemsV2,
  searchQuery,
  searchResults,
  collapsed,
  isMobileDrawer,
  pathname,
  openSubMenu,
  setOpenSubMenu,
  togglePinItem,
  togglePinGroup,
  reorderPinnedItems,
  onMobileClose,
}: DrawerNavContentProps) {
  const { t } = useTranslation();
  const showLabel = isMobileDrawer || !collapsed;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = pinnedItemsV2.findIndex((item) => item.id === active.id);
      const newIndex = pinnedItemsV2.findIndex((item) => item.id === over.id);
      const newOrder = arrayMove(pinnedItemsV2, oldIndex, newIndex);
      reorderPinnedItems(newOrder);
    }
  };

  // Get all items for pinned lookup
  const allItems = groups.flatMap((g) => g.items);

  // Build pinned items list (only items, no groups)
  const pinnedNavItems = pinnedItemsV2
    .filter((p) => p.type === "item" && p.href)
    .map((p) => allItems.find((item) => item.href === p.href))
    .filter(Boolean) as NavItem[];

  return (
    <nav
      className={`relative z-10 flex-1 pt-1 overflow-y-auto overflow-x-hidden drawer-nav-scroll ${
        showLabel ? "px-2" : "px-1"
      }`}
    >
      {/* If searching, show filtered results */}
      {searchQuery.trim() !== "" ? (
        <div className="px-2">
          <DrawerSectionTitle>{t("SIDEBAR.Results")}</DrawerSectionTitle>
          <div className="space-y-1 mt-2">
            {searchResults.map((item, idx) => (
              <div key={`${item.href}-${idx}`}>
                <DrawerNavItem
                  link={item}
                  index={idx}
                  isChild={false}
                  isMobileDrawer={isMobileDrawer}
                  showPin={false}
                  inPinnedSection={false}
                  pathname={pathname}
                  collapsed={collapsed}
                  openSubMenu={openSubMenu}
                  setOpenSubMenu={setOpenSubMenu}
                  togglePinItem={togglePinItem}
                  pinnedItemsV2={pinnedItemsV2}
                  onMobileClose={onMobileClose}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* PINNED SECTION */}
          {pinnedNavItems.length > 0 && (
            <div className="mb-3">
              {showLabel && (
                <DrawerSectionTitle>{t("SIDEBAR.Pinned")}</DrawerSectionTitle>
              )}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={pinnedItemsV2.map((p) => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className={`space-y-0.5 ${!showLabel ? "flex flex-col items-center" : ""}`}>
                    {pinnedNavItems.map((item, idx) => (
                      <DrawerNavItem
                        key={item.href}
                        link={item}
                        index={idx}
                        isChild={false}
                        isMobileDrawer={isMobileDrawer}
                        showPin={true}
                        inPinnedSection={true}
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
                </SortableContext>
              </DndContext>
              {showLabel && <div className="mx-2 drawer-divider h-px my-3" />}
              {!showLabel && <div className="drawer-divider mx-auto my-2 h-px w-8" />}
            </div>
          )}

          {/* REGULAR GROUPS */}
          {groups.map((group, gi) => (
            <DrawerNavGroup
              key={group.groupKey}
              group={group}
              index={gi}
              isMobileDrawer={isMobileDrawer}
              showPin={true}
              collapsed={collapsed}
              pathname={pathname}
              openSubMenu={openSubMenu}
              setOpenSubMenu={setOpenSubMenu}
              togglePinItem={togglePinItem}
              togglePinGroup={togglePinGroup}
              pinnedItemsV2={pinnedItemsV2}
              onMobileClose={onMobileClose}
            />
          ))}
        </>
      )}
    </nav>
  );
}
