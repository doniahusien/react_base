import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "./translations/en";
import { ar } from "./translations/ar";

export type Locale = "en" | "ar";

function getInitialLocale(): Locale {
  try {
    const stored = localStorage.getItem("locale");
    return stored === "ar" ? "ar" : "en";
  } catch {
    return "en";
  }
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: getInitialLocale(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
