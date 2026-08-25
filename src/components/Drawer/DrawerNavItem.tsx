import { Link } from "react-router-dom";
import { ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { Pin } from "lucide-react";
import { Tooltip } from "../Tooltip";
import { isItemActive } from "./utils";
import { SortablePinnedItem } from "./SortablePinnedItem";
import type { DrawerNavItemProps } from "./types";

export function DrawerNavItem({
  link,
  index,
  isChild = false,
  isMobileDrawer = false,
  showPin = false,
  inPinnedSection = false,
  pathname,
  collapsed,
  openSubMenu,
  setOpenSubMenu,
  togglePinItem,
  pinnedItemsV2,
  onMobileClose,
}: DrawerNavItemProps) {
  const active = isItemActive(link.href, pathname);
  const hasChildren = (link.children?.length ?? 0) > 0;
  const subOpen = openSubMenu === link.href;
  const showLabel = isMobileDrawer || !collapsed;
  const isCompact = !showLabel && !isChild;
  const itemId = `item-${link.href}`;
  const isPinned = pinnedItemsV2.some((p) => p.id === itemId);

  const sharedClassName = `drawer-nav-item group relative flex items-center rounded-xl transition-all duration-200 cursor-pointer ${
    isCompact ? "drawer-nav-item--compact" : ""
  } ${
    isChild
      ? showLabel
        ? "gap-2.5 ms-9 px-3 py-2"
        : "justify-center py-2.5 mx-0.5"
      : showLabel
      ? "gap-3 px-3 py-2.5"
      : "w-full justify-center p-0"
  } ${active ? "drawer-nav-active" : "drawer-nav-idle"}`;

  const innerContent = (
    <>
      {active && showLabel && !isChild && <span className="drawer-active-pill" />}
      <span
        className={`relative shrink-0 flex items-center justify-center transition-all duration-200 ${
          showLabel ? "size-8 rounded-lg" : "size-10 rounded-xl"
        } ${
          active
            ? "drawer-icon-badge-active"
            : showLabel
            ? "drawer-icon-idle"
            : "drawer-icon-badge-idle"
        }`}
      >
        <link.icon className={isChild ? "w-3.5 h-3.5" : "w-4 h-4"} />
        {active && isCompact && <span className="drawer-active-pulse" aria-hidden="true" />}
      </span>
      {showLabel && (
        <>
          <span
            className={`flex-1 truncate font-medium ${isChild ? "text-xs" : "text-sm"} ${
              active ? "text-primary" : ""
            }`}
          >
            {link.label}
          </span>
          {showPin && !isChild && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                togglePinItem(link.href);
              }}
              className={`shrink-0 p-1 rounded-md hover:bg-primary/10 transition-all duration-200 ${
                inPinnedSection
                  ? "opacity-60 group-hover:opacity-100"
                  : "opacity-0 group-hover:opacity-100"
              }`}
              title={isPinned ? "Unpin" : "Pin"}
            >
              {isPinned ? (
                <Pin className="w-3 h-3 text-primary fill-primary" />
              ) : (
                <Pin className="w-3 h-3 text-foreground-40" />
              )}
            </button>
          )}
          {hasChildren ? (
            <ChevronDownIcon
              className={`w-3 h-3 shrink-0 transition-transform duration-200 opacity-40 ${
                subOpen ? "rotate-180" : ""
              }`}
            />
          ) : (
            !showPin &&
            !inPinnedSection &&
            !isChild && (
              <ChevronRightIcon
                className={`w-3 h-3 shrink-0 transition-all duration-200 ${
                  active ? "opacity-40" : "opacity-0 group-hover:opacity-25"
                }`}
              />
            )
          )}
        </>
      )}
    </>
  );

  const content = hasChildren ? (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setOpenSubMenu(subOpen ? null : link.href)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setOpenSubMenu(subOpen ? null : link.href);
      }}
      className={sharedClassName}
    >
      {innerContent}
    </div>
  ) : (
    <Link
      to={link.href}
      onClick={() => {
        if (isMobileDrawer && onMobileClose) onMobileClose();
      }}
      className={sharedClassName}
    >
      {innerContent}
    </Link>
  );

  const tooltipContent = String(link.label);
  const contentWithTooltip =
    !showLabel && !isChild ? (
      <Tooltip content={tooltipContent} disabled={isMobileDrawer} centered>
        {content}
      </Tooltip>
    ) : (
      content
    );

  const wrapper = (
    <div key={link.href} className={`relative w-full ${isCompact ? "flex justify-center" : ""}`}>
      {contentWithTooltip}
      {hasChildren && showLabel && subOpen && (
        <div className="mt-0.5 space-y-0.5 overflow-hidden">
          {link.children!.map((child, ci) => (
            <DrawerNavItem
              key={child.href}
              link={child}
              index={ci}
              isChild={true}
              isMobileDrawer={isMobileDrawer}
              showPin={showPin}
              inPinnedSection={inPinnedSection}
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
      )}
    </div>
  );

  if (inPinnedSection && !hasChildren) {
    return (
      <SortablePinnedItem key={itemId} id={itemId} disabled={collapsed}>
        {wrapper}
      </SortablePinnedItem>
    );
  }

  return wrapper;
}
