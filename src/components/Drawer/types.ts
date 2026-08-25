import type { NavItem, NavGroup } from "../../types/sidebar";

export interface DrawerNavItemProps {
  link: NavItem;
  index: number;
  isChild?: boolean;
  isMobileDrawer?: boolean;
  showPin?: boolean;
  inPinnedSection?: boolean;
  pathname: string;
  collapsed: boolean;
  openSubMenu: string | null;
  setOpenSubMenu: (href: string | null) => void;
  togglePinItem: (href: string) => void;
  pinnedItemsV2: any[];
  onMobileClose?: () => void;
}

export interface DrawerNavGroupProps {
  group: NavGroup;
  index: number;
  isMobileDrawer?: boolean;
  showPin?: boolean;
  collapsed: boolean;
  pathname: string;
  openSubMenu: string | null;
  setOpenSubMenu: (href: string | null) => void;
  togglePinItem: (href: string) => void;
  togglePinGroup: (groupKey: string, items: NavItem[]) => void;
  pinnedItemsV2: any[];
  onMobileClose?: () => void;
}

export interface DrawerHeaderProps {
  collapsed: boolean;
  isMobileDrawer: boolean;
  shortcutLabel: string;
  onSearchClick: () => void;
}

export interface DrawerSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: NavItem[];
  shortcutLabel: string;
  onModalClick: () => void;
}

export interface DrawerUserProfileProps {
  user: any;
  collapsed: boolean;
  isMobileDrawer: boolean;
  clearAuth: () => void | Promise<void>;
  onMobileClose?: () => void;
}
