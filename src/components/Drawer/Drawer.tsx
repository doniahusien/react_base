import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChartBarIcon,
  UsersIcon,
  ScaleIcon,
  BuildingOffice2Icon,
  ShieldCheckIcon,
  TrashIcon,
  BookOpenIcon,
  MapPinIcon,
  PhoneIcon,
  BanknotesIcon,
  RectangleStackIcon,
  TicketIcon,
  NewspaperIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon,
  EnvelopeIcon,
  LockClosedIcon,
  Cog6ToothIcon,
  BellIcon,
  BoltIcon,
  MoonIcon,
  LanguageIcon,
} from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../../store";
import { useAuthStore } from "../../stores/auth";
import type { NavGroup, NavItem } from "../../types/sidebar";
import { getTextValue, isItemActive, makeKeyHint, getIsMac, getShortcutLabel } from "./utils";
import { DrawerHeader } from "./DrawerHeader";
import { DrawerSearch } from "./DrawerSearch";
import { DrawerNavContent } from "./DrawerNavContent";
import { DrawerUserProfile } from "./DrawerUserProfile";
import { DrawerCommandPalette } from "./DrawerCommandPalette";
import { DrawerHorizontalLayout } from "./DrawerHorizontalLayout";
import { DrawerTwoColumnLayout } from "./DrawerTwoColumnLayout";

export function Drawer() {
  const { t, i18n } = useTranslation();
  const {
    lang,
    sidebarCollapsed,
    sidebarMode,
    sidebarOpen,
    setSidebarOpen,
    pinnedItemsV2,
    togglePinItem,
    togglePinGroup,
    reorderPinnedItems,
    activeNavGroupKey,
    setActiveNavGroupKey,
  } = useAppStore();
  const { logout, user } = useAuthStore();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [chordBuffer, setChordBuffer] = useState("");
  const chordTimer = useRef<number | null>(null);

  const isMac = getIsMac();
  const shortcutLabel = getShortcutLabel();

  // Keyboard shortcuts for opening search modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchModalOpen(true);
        return;
      }
      if (e.key === "Escape") {
        if (searchModalOpen) {
          setSearchModalOpen(false);
        } else {
          setSearchQuery("");
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [searchModalOpen]);

  const groups: NavGroup[] = [
    {
      groupKey: "groupMain",
      groupLabelStr: "Main",
      items: [
        {
          href: "/",
          label: t("SIDEBAR.Dashboard"),
          labelStr: "Dashboard",
          icon: ChartBarIcon,
        },
      ],
    },
    {
      groupKey: "groupAccounts",
      groupLabelStr: "Accounts",
      items: [
        {
          href: "/clients?page=1",
          label: t("SIDEBAR.Clients"),
          labelStr: "Clients",
          icon: UsersIcon,
        },
        {
          href: "/lawyers?page=1",
          label: t("SIDEBAR.Lawyers"),
          labelStr: "Lawyers",
          icon: ScaleIcon,
        },
        {
          href: "/law-firms?page=1",
          label: t("SIDEBAR.LawFirms"),
          labelStr: "Law Firms",
          icon: BuildingOffice2Icon,
        },
      ],
    },
    {
      groupKey: "groupVerifications",
      groupLabelStr: "Verifications",
      items: [
        {
          href: "/verifications?page=1",
          label: t("SIDEBAR.Verifications"),
          labelStr: "Verifications",
          icon: ShieldCheckIcon,
        },
        {
          href: "/lawyer-deletion-requests?page=1",
          label: t("SIDEBAR.DeletionRequests"),
          labelStr: "Deletion Requests",
          icon: TrashIcon,
        },
      ],
    },
    {
      groupKey: "groupBilling",
      groupLabelStr: "Billing",
      items: [
        {
          href: "/payments?page=1",
          label: t("SIDEBAR.Payments"),
          labelStr: "Payments",
          icon: BanknotesIcon,
        },
        {
          href: "/subscription-plans?page=1",
          label: t("SIDEBAR.SubscriptionPlans"),
          labelStr: "Subscription Plans",
          icon: RectangleStackIcon,
        },
        {
          href: "/codes?page=1",
          label: t("SIDEBAR.Codes"),
          labelStr: "Codes",
          icon: TicketIcon,
        },
      ],
    },
    {
      groupKey: "groupSupport",
      groupLabelStr: "Support",
      items: [
        {
          href: "/complaints?page=1",
          label: t("SIDEBAR.Complaints"),
          labelStr: "Complaints",
          icon: ExclamationTriangleIcon,
        },
        {
          href: "/questions?page=1",
          label: t("SIDEBAR.Questions"),
          labelStr: "Questions",
          icon: QuestionMarkCircleIcon,
        },
        {
          href: "/contacts?page=1",
          label: t("SIDEBAR.Contacts"),
          labelStr: "Contacts",
          icon: EnvelopeIcon,
        },
      ],
    },
    {
      groupKey: "groupContent",
      groupLabelStr: "Content",
      items: [
        {
          href: "/blogs?page=1",
          label: t("SIDEBAR.Blogs"),
          labelStr: "Blogs",
          icon: NewspaperIcon,
        },
      ],
    },
    {
      groupKey: "groupGeneralSettings",
      groupLabelStr: "General Settings",
      items: [
        {
          href: "/languages?page=1",
          label: t("SIDEBAR.Languages"),
          labelStr: "Languages",
          icon: LanguageIcon,
        },
        {
          href: "/practice-areas?page=1",
          label: t("SIDEBAR.PracticeAreas"),
          labelStr: "Practice Areas",
          icon: BookOpenIcon,
        },
        {
          href: "/regions?page=1",
          label: t("SIDEBAR.Regions"),
          labelStr: "Regions",
          icon: MapPinIcon,
        },
        {
          href: "/contact-settings",
          label: t("SIDEBAR.ContactSettings"),
          labelStr: "Contact Settings",
          icon: PhoneIcon,
        },
      ],
    },
  ];

  const collapsed = sidebarCollapsed;
  const mode = sidebarMode;
  const locale = lang;
  const isHorizontal = mode === "horizontal";
  const isTwoColumn = mode === "two-column";
  const mobileOpen = sidebarOpen;

  const groupIcon = (groupKey: string) => {
    if (groupKey === "groupAccounts") return UsersIcon;
    if (groupKey === "groupVerifications") return ShieldCheckIcon;
    if (groupKey === "groupBilling") return BanknotesIcon;
    if (groupKey === "groupSupport") return ChatBubbleLeftRightIcon;
    if (groupKey === "groupContent") return NewspaperIcon;
    if (groupKey === "groupCatalog" || groupKey === "groupGeneralSettings") return LanguageIcon;
    return ChartBarIcon;
  };

  const findGroupKeyForPath = (path: string) => {
    for (const g of groups) {
      for (const item of g.items) {
        if (isItemActive(item.href, path)) return g.groupKey;
        for (const child of item.children ?? []) {
          if (isItemActive(child.href, path)) return g.groupKey;
        }
      }
    }
    return groups[0]?.groupKey ?? null;
  };

  useEffect(() => {
    if (!isTwoColumn) return;
    const matched = findGroupKeyForPath(pathname);
    if (matched && matched !== activeNavGroupKey) {
      setActiveNavGroupKey(matched);
    } else if (!activeNavGroupKey && groups[0]) {
      setActiveNavGroupKey(groups[0].groupKey);
    }
  }, [pathname, isTwoColumn]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeGroup = groups.find((g) => g.groupKey === activeNavGroupKey) ?? groups[0] ?? null;

  // Flattened list for search/modal (include children)
  const allItemsFlat: NavItem[] = groups.flatMap((g) =>
    g.items.flatMap((item) => [item, ...(item.children ?? [])])
  );
  const searchResults: NavItem[] =
    searchQuery.trim() === ""
      ? []
      : allItemsFlat.filter((i) =>
          getTextValue(i.labelStr || i.label).toLowerCase().includes(searchQuery.toLowerCase())
        );

  // Default command sections when search is empty
  const goToItems = groups.flatMap((g) => g.items);
  const systemCommands = [
    {
      id: "lock",
      label: t("SIDEBAR.LockTerminal"),
      subtitle: t("SIDEBAR.LockTerminalDesc"),
      icon: LockClosedIcon,
      shortcut: isMac ? "⌘L" : "Ctrl+L",
      action: () => console.log("Lock"),
    },
    {
      id: "settings",
      label: t("SIDEBAR.TerminalSettings"),
      subtitle: t("SIDEBAR.TerminalSettingsDesc"),
      icon: Cog6ToothIcon,
      shortcut: isMac ? "⌘," : "Ctrl+,",
      action: () => console.log("Settings"),
    },
    {
      id: "notifications",
      label: t("SIDEBAR.Notifications"),
      subtitle: t("SIDEBAR.NotificationsDesc"),
      icon: BellIcon,
      shortcut: "",
      action: () => console.log("Notifications"),
    },
    {
      id: "sidekick",
      label: t("SIDEBAR.SidekickAI"),
      subtitle: t("SIDEBAR.SidekickAIDesc"),
      icon: BoltIcon,
      shortcut: isMac ? "⌘." : "Ctrl+.",
      action: () => console.log("Sidekick"),
    },
  ];
  const preferences = [
    {
      id: "dark",
      label: t("SIDEBAR.ToggleDarkMode"),
      subtitle: t("SIDEBAR.ToggleDarkModeDesc"),
      icon: MoonIcon,
      shortcut: "",
      action: () => document.documentElement.classList.toggle("dark"),
    },
    {
      id: "lang",
      label: t("SIDEBAR.ChangeLanguage"),
      subtitle: t("SIDEBAR.ChangeLanguageDesc"),
      icon: LanguageIcon,
      shortcut: "",
      action: () => i18n.changeLanguage(i18n.language === "en" ? "ar" : "en"),
    },
  ];

  // Global Ctrl/Cmd + two-letter chord handler
  useEffect(() => {
    const keyMap = new Map<string, any>();
    const allCandidates = [
      ...goToItems.map((it) => ({
        type: "page",
        href: it.href,
        action: undefined,
        key: makeKeyHint(it.labelStr || it.label),
        label: it.label,
      })),
      ...systemCommands.map((s) => ({
        type: "system",
        href: undefined,
        action: s.action,
        key: makeKeyHint(s.label),
        label: s.label,
      })),
      ...preferences.map((p) => ({
        type: "pref",
        href: undefined,
        action: p.action,
        key: makeKeyHint(p.label),
        label: p.label,
      })),
    ];
    for (const c of allCandidates) if (c.key) keyMap.set(c.key.toUpperCase(), c);

    const handler = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key.toLowerCase() === "k") return;
      const ch = e.key.length === 1 && /[a-z]/i.test(e.key) ? e.key.toUpperCase() : null;
      if (!ch) return;
      e.preventDefault();

      setChordBuffer((prev) => {
        const next = (prev + ch).slice(-2).toUpperCase();
        if (chordTimer.current) window.clearTimeout(chordTimer.current);
        const match = keyMap.get(next);
        if (match) {
          if (match.type === "page" && match.href) {
            setTimeout(() => navigate(match.href), 0);
          } else if (match.action) {
            setTimeout(() => {
              try {
                match.action();
              } catch (err) {
                console.error(err);
              }
            }, 0);
          }
          chordTimer.current = null;
          return "";
        }
        chordTimer.current = window.setTimeout(() => setChordBuffer(""), 800);
        return next;
      });
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      if (chordTimer.current) window.clearTimeout(chordTimer.current);
    };
  }, [goToItems, systemCommands, preferences, navigate]);

  const sidebarContent = (isMobileDrawer = false) => {
    const showLabel = isMobileDrawer || !collapsed;

    return (
      <>


        <DrawerHeader
          collapsed={collapsed}
          isMobileDrawer={isMobileDrawer}
          shortcutLabel={shortcutLabel}
          onSearchClick={() => setSearchModalOpen(true)}
        />

        <div className="mx-3.5 drawer-divider h-px mb-2" />

        {showLabel && (
          <DrawerSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchResults={searchResults}
            shortcutLabel={shortcutLabel}
            onModalClick={() => setSearchModalOpen(true)}
          />
        )}

        <DrawerNavContent
          groups={groups}
          pinnedItemsV2={pinnedItemsV2}
          searchQuery={searchQuery}
          searchResults={searchResults}
          collapsed={collapsed}
          isMobileDrawer={isMobileDrawer}
          pathname={pathname}
          openSubMenu={openSubMenu}
          setOpenSubMenu={setOpenSubMenu}
          togglePinItem={togglePinItem}
          togglePinGroup={togglePinGroup}
          reorderPinnedItems={reorderPinnedItems}
          onMobileClose={() => setSidebarOpen(false)}
        />

        <DrawerUserProfile
          user={user}
          collapsed={collapsed}
          isMobileDrawer={isMobileDrawer}
          clearAuth={logout}
          onMobileClose={() => setSidebarOpen(false)}
        />
      </>
    );
  };

  return (
    <div dir={locale === "ar" ? "rtl" : "ltr"} className={locale === "ar" ? "text-right" : "text-left"}>
      {/* Horizontal Layout */}
      {isHorizontal && <DrawerHorizontalLayout groups={groups} pathname={pathname} locale={locale} />}

      {/* Two-Column Layout */}
      {!isHorizontal && isTwoColumn && (
        <DrawerTwoColumnLayout
          groups={groups}
          activeGroup={activeGroup}
          activeNavGroupKey={activeNavGroupKey}
          setActiveNavGroupKey={setActiveNavGroupKey}
          groupIcon={groupIcon}
          user={user}
          clearAuth={logout}
          pathname={pathname}
          openSubMenu={openSubMenu}
          setOpenSubMenu={setOpenSubMenu}
          togglePinItem={togglePinItem}
          pinnedItemsV2={pinnedItemsV2}
          locale={locale}
        />
      )}

      {/* Standard Sidebar Layout */}
      {!isHorizontal && !isTwoColumn && (
        <div
          className={`drawer-shell fixed inset-y-0 inset-s-0 z-99999 hidden flex-col overflow-hidden transition-all duration-500 ease-in-out lg:flex ${
            collapsed ? "w-18" : "w-64"
          }`}
        >
          {sidebarContent(false)}
        </div>
      )}

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background-70 backdrop-blur-sm lg:hidden transition-opacity duration-300 animate-in fade-in"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`drawer-shell fixed inset-y-0 inset-s-0 z-50 flex w-72 flex-col transition-all duration-500 ease-in-out lg:hidden ${
          mobileOpen
            ? "translate-x-0 opacity-100"
            : locale === "ar"
            ? "translate-x-full opacity-0"
            : "-translate-x-full opacity-0"
        }`}
        aria-label="Mobile navigation"
      >
        {sidebarContent(true)}
      </div>

      {/* Command Palette */}
      <DrawerCommandPalette
        isOpen={searchModalOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResults}
        goToItems={goToItems}
        systemCommands={systemCommands}
        preferences={preferences}
        selectedIndex={selectedIndex}
        setSelectedIndex={setSelectedIndex}
        onClose={() => setSearchModalOpen(false)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />
    </div>
  );
}
