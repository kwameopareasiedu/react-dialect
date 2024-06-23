import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface TranslationContextProps {
  language: string;
  downloading: boolean;
  setLanguage: (language: string) => void;
}

const TranslationContext = createContext<TranslationContextProps>(null as never);

interface TranslationProviderProps {
  languages: string[];
  baseLanguage: string;
  children: ReactNode;
}

interface Translations {
  [lang: string]: {
    [key: string]: string;
  };
}

export function TranslationProvider({ baseLanguage, languages, children }: TranslationProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState(baseLanguage);
  const [translations, setTranslations] = useState<Translations>({});
  const [downloading, setDownloading] = useState(false);

  const handleSetLanguage = async (language: string) => {
    if (!languages.includes(language)) throw `unsupported language: ${language}`;
    if (downloading || translations[language] || language === baseLanguage) return;

    try {
      setDownloading(true);
      const response = await fetch(`/locales/${language}.json`);
      const content = await response.json();
      setCurrentLanguage(language);
      setTranslations((trans) => ({
        ...trans,
        [language]: content,
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    if (Object.keys(translations > 0)) {
      console.log(translations);
    }
  }, [translations]);

  return (
    <TranslationContext.Provider
      value={{
        language: currentLanguage,
        setLanguage: handleSetLanguage,
        downloading: downloading,
      }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  return useContext(TranslationContext);
}
