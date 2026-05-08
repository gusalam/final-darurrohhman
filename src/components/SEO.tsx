import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string;
  type?: "website" | "article";
  noIndex?: boolean;
  jsonLd?: Record<string, any> | Record<string, any>[];
}

const SITE = "https://yayasandarurrahmanku.web.app";

function setMeta(attr: "name" | "property", key: string, content: string) {
  if (!content) return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function SEO({ title, description, image, canonical, type = "website", noIndex, jsonLd }: SEOProps) {
  useEffect(() => {
    if (title) document.title = title;
    if (description) setMeta("name", "description", description);
    setMeta("name", "robots", noIndex ? "noindex, nofollow" : "index, follow");

    const url = canonical || (typeof window !== "undefined" ? window.location.href : SITE);
    setLink("canonical", url);

    setMeta("property", "og:type", type);
    if (title) setMeta("property", "og:title", title);
    if (description) setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    if (image) setMeta("property", "og:image", image);

    setMeta("name", "twitter:card", "summary_large_image");
    if (title) setMeta("name", "twitter:title", title);
    if (description) setMeta("name", "twitter:description", description);
    if (image) setMeta("name", "twitter:image", image);

    const scripts: HTMLScriptElement[] = [];
    if (jsonLd) {
      const arr = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      arr.forEach((data) => {
        const s = document.createElement("script");
        s.type = "application/ld+json";
        s.dataset.dynamic = "true";
        s.text = JSON.stringify(data);
        document.head.appendChild(s);
        scripts.push(s);
      });
    }
    return () => { scripts.forEach((s) => s.remove()); };
  }, [title, description, image, canonical, type, noIndex, JSON.stringify(jsonLd)]);

  return null;
}
