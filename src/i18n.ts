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

if (import.meta.hot) {
  import.meta.hot.accept(["./translations/en", "./translations/ar"], (mods) => {
    const [enMod, arMod] = mods ?? [];
    if (enMod?.en) {
      i18n.addResourceBundle("en", "translation", enMod.en, true, true);
    }
    if (arMod?.ar) {
      i18n.addResourceBundle("ar", "translation", arMod.ar, true, true);
    }
  });
}

export default i18n;
