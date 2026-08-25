export function getTextValue(value: React.ReactNode | string | undefined): string {
  if (typeof value === "string" || typeof value === "number") return String(value);
  return "";
}

export function isItemActive(href: string, pathname: string): boolean {
  const pathOnly = href.split("?")[0].split("#")[0];
  if (pathOnly === "/") return pathname === "/";
  return pathname === pathOnly || pathname.startsWith(`${pathOnly}/`);
}

export function makeKeyHint(label?: React.ReactNode): string {
  const text = getTextValue(label);
  if (!text) return "";
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return text.slice(0, 2).toUpperCase();
}

export function getIsMac(): boolean {
  return typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform);
}

export function getShortcutLabel(): string {
  return getIsMac() ? "⌘K" : "Ctrl+K";
}
