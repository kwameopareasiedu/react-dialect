import React, { SelectHTMLAttributes } from "react";
import { useTranslation } from "@/lib/translation-provider";

export function SwitchLanguage(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { currentLanguage, languages, setCurrentLanguage } = useTranslation();

  const handleSelectLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentLanguage(e.target.value);
    props.onChange?.(e);
  };

  return (
    <select {...props} value={currentLanguage} onChange={handleSelectLanguage}>
      {languages.map((language) => (
        <option key={language} value={language}>
          {language}
        </option>
      ))}
    </select>
  );
}
