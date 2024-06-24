import React, { createContext, ReactNode, useContext, useState } from "react";

interface TranslationContextProps {
  languages: string[];
  currentLanguage: string;
  loadingLanguage: boolean;
  setCurrentLanguage: (language: string) => void;
  translate: (content: string) => ReactNode;
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

  const loadLanguage = async (language: string) => {
    if (!downloading) {
      if (!languages.includes(language)) {
        throw `unsupported language: ${language}`;
      } else if (language === baseLanguage || translations[language]) {
        setCurrentLanguage(language);
      } else {
        try {
          setDownloading(true);
          const response = await fetch(`/locales/${language}.json`);
          const content = await response.json();
          setTranslations({ ...translations, [language]: content });
          setCurrentLanguage(language);
        } catch (err) {
          console.error(err);
        } finally {
          setDownloading(false);
        }
      }
    }
  };

  const translate = (content: string) => {
    // console.log(currentLanguage, content);
    if (currentLanguage !== baseLanguage) {
      const map = translations[currentLanguage];
      const entries = Object.entries(map);

      for (const [key, value] of entries) {
        if (key === content) return value;
      }

      return "";
    } else return content;
  };

  return (
    <TranslationContext.Provider
      value={{
        languages: languages,
        loadingLanguage: downloading,
        currentLanguage: currentLanguage,
        setCurrentLanguage: loadLanguage,
        translate: translate,
      }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  return useContext(TranslationContext);
}
