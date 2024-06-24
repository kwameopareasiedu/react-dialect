import React, { Children, ComponentPropsWithoutRef, ElementType, useMemo } from "react";
import { useTranslation } from "@/lib/translation-provider";

type TranslateProps<T extends ElementType> = {
  as?: T;
  children: string;
} & ComponentPropsWithoutRef<T>;

export function Translate<T extends ElementType = "p">({ as, children, ...rest }: TranslateProps<T>) {
  const Root = as ?? "p";
  const { translate, currentLanguage } = useTranslation();

  const translated = useMemo(() => {
    const joined = Children.toArray(children).join("");
    return translate(joined);
  }, [children, currentLanguage]);

  return <Root {...rest}>{translated}</Root>;
}
