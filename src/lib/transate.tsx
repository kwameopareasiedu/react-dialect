import React, { ComponentPropsWithoutRef, ElementType } from "react";

type TranslateProps<T extends ElementType> = {
  as?: T;
  children: string;
} & ComponentPropsWithoutRef<T>;

export function Translate<T extends ElementType = "p">({ as, children, ...rest }: TranslateProps<T>) {
  const Root = as ?? "p";
  // console.log(children);

  return <Root {...rest}>{children}</Root>;
}
