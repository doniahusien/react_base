import type { ReactNode } from "react";

export interface NavItem {
  href: string;
  label: ReactNode;
  labelStr: string;
  icon: any;
  children?: Omit<NavItem, "children">[];
}

export interface NavGroup {
  groupKey: string;
  groupLabelStr: string;
  items: NavItem[];
}
