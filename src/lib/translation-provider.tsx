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
    if (currentLanguage !== baseLanguage) {
      const map = translations[currentLanguage];
      const entries = Object.entries(map);

      for (const [key, value] of entries) {
        if (key === content) return value;

        const placeholderFinderRegex = /({\w+})/g;
        const placeholderCaptureRegexString = key.replaceAll(placeholderFinderRegex, "(.+?)"); // Convert key into regex string
        const placeholderTestRegex = new RegExp(placeholderCaptureRegexString, "gm"); // Create test regex from modified key

        // Using a RegExp changes its internal state, which is why we use two regexes for the same string
        if (!placeholderTestRegex.test(content)) continue;

        const placeholderCaptureRegex = new RegExp(placeholderCaptureRegexString, "gm"); // Create capture regex from modified key
        const placeholderValueMatches = placeholderCaptureRegex.exec(content); // Get placeholder values from content
        if (!placeholderValueMatches) continue;

        const placeholderValues = placeholderValueMatches.slice(1, placeholderValueMatches.length);

        const placeholderFinderRegex2 = /({\w+})/g;
        let translated = value;

        for (let i = 0; i < placeholderValues.length; i++) {
          const placeholderMatches = placeholderFinderRegex2.exec(key);

          if (placeholderMatches) {
            const placeholder = placeholderMatches[1];
            const replacement = placeholderValues[i];
            translated = translated.replaceAll(placeholder, replacement);
          }
        }

        return translated;

        /* Named capture group */
        // TODO: Fix duplicate capture group error later
        // const placeholderFinderRegex = /{(\w+)}/g;
        // const placeholderCaptureRegexString = key.replaceAll(placeholderFinderRegex, "(?<$1>.+?)"); // Convert key into regex string
        // const placeholderTestRegex = new RegExp(placeholderCaptureRegexString, "gm"); // Create test regex from modified key
        //
        // // Using a RegExp changes its internal state, which is why we use two regexes for the same string
        // if (!placeholderTestRegex.test(content)) continue;
        //
        // const placeholderCaptureRegex = new RegExp(placeholderCaptureRegexString, "gm"); // Create capture regex from modified key
        // const placeholderValueMatches = placeholderCaptureRegex.exec(content); // Get placeholder values from content
        // if (!placeholderValueMatches) continue;
        //
        // const placeholderValues = placeholderValueMatches.groups;
        // if (!placeholderValues) continue;
        //
        // const placeholderKeys = Object.keys(placeholderValues);
        // let translated = value;
        //
        // for (const key of placeholderKeys) {
        //   const replacement = placeholderValues[key];
        //   translated = translated.replaceAll(`{${key}}`, replacement);
        // }
        //
        // return translated;
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
