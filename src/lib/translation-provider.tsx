import React, { createContext, ReactNode, useContext, useState } from "react";

interface TranslationContextProps {
  currentLanguage: string;
  downloading: boolean;
  setCurrentLanguage: (language: string) => void;
  translate: (content: string | string[]) => ReactNode;
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

  const handleSetCurrentLanguage = async (language: string) => {
    if (downloading) return;
    if (!languages.includes(language)) throw `unsupported language: ${language}`;

    if (language === baseLanguage) {
      setCurrentLanguage(language);
    } else if (!translations[language]) {
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
  };

  const translate = (content: string | string[]) => {
    console.log(currentLanguage, content);
    if (currentLanguage === baseLanguage) return content;
    return "";
  };

  return (
    <TranslationContext.Provider
      value={{
        downloading: downloading,
        currentLanguage: currentLanguage,
        setCurrentLanguage: handleSetCurrentLanguage,
        translate: translate,
      }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  return useContext(TranslationContext);
}
