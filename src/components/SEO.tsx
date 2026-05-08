import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  canonical?: string;
  type?: "website" | "article";
  noIndex?: boolean;
  jsonLd?: Record<string, any> | Record<string, any>[];
  googleVerification?: string;
  bingVerification?: string;
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

export function SEO({ title, description, keywords, image, canonical, type = "website", noIndex, jsonLd, googleVerification, bingVerification }: SEOProps) {
  useEffect(() => {
    if (title) document.title = title;
    if (description) setMeta("name", "description", description);
    if (keywords) setMeta("name", "keywords", keywords);
    setMeta("name", "robots", noIndex ? "noindex, nofollow" : "index, follow");

    const url = canonical || (typeof window !== "undefined" ? window.location.href : SITE);
    setLink("canonical", url);

    setMeta("property", "og:type", type);
    setMeta("property", "og:site_name", "Yayasan Darur Rohman Morombuh Kwanyar");
    setMeta("property", "og:locale", "id_ID");
    if (title) setMeta("property", "og:title", title);
    if (description) setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    if (image) setMeta("property", "og:image", image);

    setMeta("name", "twitter:card", "summary_large_image");
    if (title) setMeta("name", "twitter:title", title);
    if (description) setMeta("name", "twitter:description", description);
    if (image) setMeta("name", "twitter:image", image);

    if (googleVerification) setMeta("name", "google-site-verification", googleVerification);
    if (bingVerification) setMeta("name", "msvalidate.01", bingVerification);

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
  }, [title, description, keywords, image, canonical, type, noIndex, googleVerification, bingVerification, JSON.stringify(jsonLd)]);

  return null;
}
