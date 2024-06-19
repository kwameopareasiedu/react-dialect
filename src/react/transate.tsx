import React, { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type TranslateProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
} & ComponentPropsWithoutRef<T>;

export function Translate<T extends ElementType = "p">({ as, children, ...rest }: TranslateProps<T>) {
  const Root = as ?? "p";

  return <Root {...rest}>{children}</Root>;
}
