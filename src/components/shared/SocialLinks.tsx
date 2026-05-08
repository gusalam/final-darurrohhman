interface Socials {
  social_facebook?: string | null;
  social_instagram?: string | null;
  social_tiktok?: string | null;
  social_youtube?: string | null;
  social_twitter?: string | null;
  social_telegram?: string | null;
  social_whatsapp?: string | null;
  social_linkedin?: string | null;
  social_threads?: string | null;
}

const I = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">{children}</svg>
);

const ICONS: Record<string, { label: string; svg: React.ReactNode; href: (v: string) => string }> = {
  social_facebook: { label: "Facebook", href: (v) => v, svg: <I><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.5 2.9h-2.4v7A10 10 0 0 0 22 12Z"/></I> },
  social_instagram: { label: "Instagram", href: (v) => v, svg: <I><path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.5 1s.8.9 1 1.5c.1.4.3 1 .4 2.2.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-1 1.5s-.9.8-1.5 1c-.4.1-1 .3-2.2.4-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.5-1s-.8-.9-1-1.5c-.1-.4-.3-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.3-1.8.4-2.2.2-.6.5-1 1-1.5s.9-.8 1.5-1c.4-.1 1-.3 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.1 0-3.5 0-4.7.1-1.1.1-1.7.2-2.1.4-.5.2-.9.5-1.3.8-.4.4-.6.8-.8 1.3-.2.4-.3 1-.4 2.1C2.6 9.9 2.6 10.3 2.6 12s0 2.1.1 3.3c.1 1.1.2 1.7.4 2.1.2.5.5.9.8 1.3.4.4.8.6 1.3.8.4.2 1 .3 2.1.4 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1.1-.1 1.7-.2 2.1-.4.5-.2.9-.5 1.3-.8.4-.4.6-.8.8-1.3.2-.4.3-1 .4-2.1.1-1.2.1-1.6.1-3.3s0-2.1-.1-3.3c-.1-1.1-.2-1.7-.4-2.1-.2-.5-.5-.9-.8-1.3-.4-.4-.8-.6-1.3-.8-.4-.2-1-.3-2.1-.4C15.5 4 15.1 4 12 4Zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8Zm0 1.8a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2Zm5.1-2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z"/></I> },
  social_tiktok: { label: "TikTok", href: (v) => v, svg: <I><path d="M16.5 2c.4 1.9 1.5 3.4 3.4 3.6v3a6.7 6.7 0 0 1-3.5-1.1v6.6a6 6 0 1 1-6-6c.3 0 .6 0 .9.1v3.1a3 3 0 1 0 2.1 2.9V2h3.1Z"/></I> },
  social_youtube: { label: "YouTube", href: (v) => v, svg: <I><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z"/></I> },
  social_twitter: { label: "X", href: (v) => v, svg: <I><path d="M18.2 2H21l-6.5 7.4L22 22h-6.8l-4.7-6.1L4.9 22H2l7-8L2 2h6.9l4.3 5.7L18.2 2Zm-1.2 18h1.7L7.1 4H5.3L17 20Z"/></I> },
  social_telegram: { label: "Telegram", href: (v) => v, svg: <I><path d="M22 3 2 11l5.5 2 2 6.5L13 16l5 4 4-17ZM10 14l8-7-10 8L6 13l14-8-10 9Z"/></I> },
  social_whatsapp: {
    label: "WhatsApp",
    href: (v) => (/^https?:\/\//i.test(v) ? v : `https://wa.me/${v.replace(/[^0-9]/g, "")}`),
    svg: <I><path d="M20.5 3.5A10.4 10.4 0 0 0 3.7 16.2L2 22l5.9-1.6A10.4 10.4 0 1 0 20.5 3.5Zm-8.4 16a8.6 8.6 0 0 1-4.4-1.2l-.3-.2-3.5 1 .9-3.4-.2-.3a8.6 8.6 0 1 1 7.5 4.1Zm4.7-6.5c-.3-.1-1.5-.8-1.8-.9-.2-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.1.1-.3.2-.6 0-.3-.1-1.1-.4-2.1-1.3-.8-.7-1.3-1.6-1.5-1.9-.2-.3 0-.4.1-.6l.4-.4.2-.4c.1-.2 0-.3 0-.4l-.6-1.4c-.1-.4-.3-.3-.4-.3h-.4c-.1 0-.4.1-.6.3-.2.3-.8.8-.8 2 0 1.2.8 2.3.9 2.5.1.2 1.7 2.6 4.1 3.5 2.4.9 2.4.6 2.8.6.4-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.1-.4-.2Z"/></I>
  },
  social_linkedin: { label: "LinkedIn", href: (v) => v, svg: <I><path d="M4.98 3.5a2.5 2.5 0 1 1 .04 5 2.5 2.5 0 0 1-.04-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.6c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9V21h-4V9Z"/></I> },
  social_threads: { label: "Threads", href: (v) => v, svg: <I><path d="M12.2 2C6.7 2 3 5.5 3 11.9c0 6.6 3.7 10.1 9 10.1 4.5 0 7.6-2.6 8-6.4.2-2.4-.9-4.4-3.2-5.4-.5-2-2-3.2-4.3-3.2-1.7 0-3.1.7-3.9 2l1.4.8c.5-.8 1.4-1.2 2.5-1.2 1.4 0 2.4.7 2.7 2-.7-.1-1.4-.2-2.2-.1-3.1.2-5.1 2-5 4.6.1 2.5 2.2 4 4.7 3.8 2.9-.3 4.6-2.1 5-5 1.4.8 1.9 2 1.8 3.5-.3 2.7-2.6 4.6-6.2 4.6-4.3 0-7.2-2.8-7.2-8.3C5.1 6.6 7.7 4 12.2 4c4 0 6.4 2 7.1 5.7l1.7-.3C20.1 4.6 17 2 12.2 2Zm.6 11.1c.5 0 1 0 1.5.1-.2 1.7-1 2.8-2.5 3-1.3.1-2.4-.5-2.5-1.6-.1-1 .8-1.5 2.1-1.5h1.4Z"/></I> },
};

const ORDER = [
  "social_instagram",
  "social_facebook",
  "social_tiktok",
  "social_youtube",
  "social_twitter",
  "social_telegram",
  "social_whatsapp",
  "social_linkedin",
  "social_threads",
] as const;

export function SocialLinks({ data }: { data: Socials | null | undefined }) {
  if (!data) return null;
  const items = ORDER.filter((k) => (data as any)[k]?.toString().trim()).map((k) => ({
    key: k,
    href: ICONS[k].href((data as any)[k]),
    label: ICONS[k].label,
    svg: ICONS[k].svg,
  }));
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((it) => (
        <a
          key={it.key}
          href={it.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={it.label}
          title={it.label}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground hover:shadow-soft"
        >
          {it.svg}
        </a>
      ))}
    </div>
  );
}
