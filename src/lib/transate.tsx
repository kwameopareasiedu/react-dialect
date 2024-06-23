import React, { ComponentPropsWithoutRef, ElementType, useMemo } from "react";
import { useTranslation } from "@/lib/translation-provider";

type TranslateProps<T extends ElementType> = {
  as?: T;
  children: string | string[];
} & ComponentPropsWithoutRef<T>;

export function Translate<T extends ElementType = "p">({ as, children, ...rest }: TranslateProps<T>) {
  const Root = as ?? "p";
  const { translate, currentLanguage } = useTranslation();

  const translated = useMemo(() => {
    return translate(children);
  }, [children, currentLanguage]);

  return <Root {...rest}>{translated}</Root>;
}
