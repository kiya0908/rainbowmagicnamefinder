import type { MetaDescriptor } from "react-router";

export const createCanonical = (
  pathname: string,
  domain: string
): MetaDescriptor => {
  return {
    tagName: "link",
    rel: "canonical",
    href: new URL(pathname, domain).toString(),
  };
};

export const createAlternate = (
  pathname: string,
  domain: string,
  hrefLang: string
): MetaDescriptor => {
  return {
    tagName: "link",
    rel: "alternate",
    hrefLang,
    href: new URL(pathname, domain).toString(),
  };
};
