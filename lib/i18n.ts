import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpApi from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

// Only initialize i18n on the client side
if (typeof window !== 'undefined') {
  i18n
    .use(HttpApi)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      supportedLngs: ["en", "ar", "es", "fr", "ja", "id", "hi"],
      fallbackLng: "en",
      detection: {
        order: ["path", "cookie", "htmlTag", "localStorage", "subdomain"],
        caches: ["cookie"],
      },
      backend: {
        loadPath: "/locales/{{lng}}/translation.json",
      },
      react: { useSuspense: false },
    });
} else {
  // Server-side: minimal init
  i18n
    .use(initReactI18next)
    .init({
      supportedLngs: ["en", "ar", "es", "fr", "ja", "id", "hi"],
      fallbackLng: "en",
      resources: {}, // Empty resources for build
      react: { useSuspense: false },
    });
}

export default i18n;