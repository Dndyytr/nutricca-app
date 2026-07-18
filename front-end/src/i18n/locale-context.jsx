import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations } from "./translations";

const LocaleContext = createContext(null);
const STORAGE_KEY = "nutricca.locale";
const SUPPORTED_LOCALES = ["en", "id"];

const getInitialLocale = () => {
  const savedLocale = localStorage.getItem(STORAGE_KEY);
  if (SUPPORTED_LOCALES.includes(savedLocale)) return savedLocale;
  return navigator.language.toLowerCase().startsWith("id") ? "id" : "en";
};

const getValue = (source, key) =>
  key.split(".").reduce((value, part) => value?.[part], source);

export const LocaleProvider = ({ children }) => {
  const [locale, setLocale] = useState(getInitialLocale);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key, values = {}) => {
        const template =
          getValue(translations[locale], key) ??
          getValue(translations.en, key) ??
          key;
        return Object.entries(values).reduce(
          (text, [name, replacement]) =>
            text.replaceAll(`{{${name}}}`, replacement),
          template,
        );
      },
    }),
    [locale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used inside LocaleProvider");
  return context;
};
