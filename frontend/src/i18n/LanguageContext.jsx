import { createContext, useContext, useState, useEffect } from "react";
import { translations } from "./translations";

const LanguageContext = createContext(null);

function getInitialLanguage() {
  const stored = localStorage.getItem("quilt_lang");
  return stored === "en" ? "en" : "es";
}

function resolveKey(dict, key) {
  return key.split(".").reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), dict);
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getInitialLanguage);

  useEffect(() => {
    localStorage.setItem("quilt_lang", language);
  }, [language]);

  const setLanguage = (lang) => setLanguageState(lang === "en" ? "en" : "es");

  const t = (key) => {
    const value = resolveKey(translations[language], key);
    if (value !== undefined) return value;
    const fallback = resolveKey(translations.es, key);
    return fallback !== undefined ? fallback : key;
  };

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage debe usarse dentro de LanguageProvider");
  return ctx;
}
