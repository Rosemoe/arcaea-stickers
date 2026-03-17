import { createContext, useContext, useMemo, useState, useEffect } from "react";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, messages } from "./messages";

const I18nContext = createContext({
  locale: DEFAULT_LOCALE,
  setLocale: () => {},
  t: (key) => key,
});

function normalizeLocale(locale) {
  if (!locale) {
    return DEFAULT_LOCALE;
  }

  const lowerCased = locale.toLowerCase();

  if (lowerCased.startsWith("zh-cn") || lowerCased.startsWith("zh-sg")) {
    return "zh-CN";
  }

  if (
    lowerCased.startsWith("zh-tw") ||
    lowerCased.startsWith("zh-hk") ||
    lowerCased.startsWith("zh-mo") ||
    lowerCased.startsWith("zh-hant")
  ) {
    return "zh-TW";
  }

  if (lowerCased.startsWith("zh")) {
    return "zh-CN";
  }

  if (lowerCased.startsWith("ja")) {
    return "ja-JP";
  }

  if (lowerCased.startsWith("en")) {
    return "en-US";
  }

  return SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
}

function getInitialLocale() {
  return normalizeLocale(navigator.language);
}

function resolveMessage(locale, key) {
  return key.split(".").reduce((value, segment) => value?.[segment], messages[locale]);
}

function interpolate(template, params = {}) {
  return template.replace(/\{(\w+)\}/g, (_, key) => params[key] ?? `{${key}}`);
}

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(getInitialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    const handleLanguageChange = () => {
      setLocale(normalizeLocale(navigator.language));
    };

    window.addEventListener("languagechange", handleLanguageChange);

    return () => {
      window.removeEventListener("languagechange", handleLanguageChange);
    };
  }, []);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key, params) => {
        const template =
          resolveMessage(locale, key) ??
          resolveMessage(DEFAULT_LOCALE, key) ??
          key;

        return typeof template === "string" ? interpolate(template, params) : key;
      },
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
