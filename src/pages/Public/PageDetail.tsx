import { useEffect, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { SEO } from "@/components/SEO";
import { RichContent } from "@/components/RichContent";
import { Lightbox } from "@/components/shared/Lightbox";

const SITE = "https://yayasandarurrahmanku.web.app";
const PLACEHOLDER = "/placeholder.png";

export default function PageDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<any | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [lbIndex, setLbIndex] = useState<number | null>(null);

  useEffect(() => {
    supabase.from("site_settings").select("*").limit(1).maybeSingle().then(({ data }) => setSettings(data));
  }, []);

  useEffect(() => {
    if (!slug) return;
    setLoading(true); setNotFound(false);
    window.scrollTo({ top: 0 });
    (async () => {
      const { data } = await supabase
        .from("cms_pages")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (!data) setNotFound(true);
      setPage(data);
      setLoading(false);
    })();
  }, [slug]);

  if (notFound) return <Navigate to="/" replace />;

  const url = `${SITE}/halaman/${slug}`;
  const title = page?.meta_title || (page ? `${page.title} — Yayasan Darur Rohman Morombuh` : "Halaman");
  const description = page?.meta_description || page?.content?.slice(0, 155) || "Halaman resmi Yayasan Darur Rohman Morombuh Kwanyar.";
  const ogImage = page?.og_image_url || page?.cover_url;

  const ytId = (() => {
    const u: string = page?.youtube_url ?? "";
    const m = u.match(/(?:youtu\.be\/|v=)([\w-]{11})/);
    return m ? m[1] : null;
  })();

  const breadcrumbLd = page ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: SITE + "/" },
      { "@type": "ListItem", position: 2, name: "Halaman", item: SITE + "/#halaman" },
      { "@type": "ListItem", position: 3, name: page.title, item: url },
    ],
  } : undefined;

  const articleLd = page ? {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description,
    url,
    image: ogImage ? [ogImage] : undefined,
    datePublished: page.created_at,
    dateModified: page.updated_at,
    isPartOf: { "@type": "WebSite", name: settings?.nama_yayasan ?? "Yayasan Darur Rohman", url: SITE + "/" },
  } : undefined;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title={title}
        description={description}
        keywords={page?.keywords}
        canonical={url}
        image={ogImage}
        type="article"
        jsonLd={page ? [breadcrumbLd!, articleLd!] : undefined}
      />
      <PublicNavbar yayasanName={settings?.nama_yayasan} tagline={settings?.tagline} />

      <div className="mx-auto max-w-4xl px-4 py-10 md:px-6 lg:py-14">
        <Link to="/"><Button variant="ghost" size="sm" className="mb-4 -ml-2"><ArrowLeft className="mr-2 h-4 w-4" /> Kembali</Button></Link>

        <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-primary">Beranda</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/#halaman" className="hover:text-primary">Halaman</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{page?.title ?? "…"}</span>
        </nav>

        {loading ? (
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-64 w-full animate-pulse rounded-2xl bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
          </div>
        ) : page && (
          <article>
            <h1 className="font-display text-3xl font-bold md:text-4xl">{page.title}</h1>
            {page.cover_url && (
              <img
                src={page.cover_url}
                alt={page.title}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
                className="mt-6 h-72 w-full rounded-2xl object-cover shadow-soft md:h-96"
              />
            )}
            <RichContent text={page.content} className="mt-6 text-base md:text-lg" />

            {ytId && (
              <div className="mt-8 aspect-video overflow-hidden rounded-2xl shadow-md-soft">
                <iframe src={`https://www.youtube.com/embed/${ytId}`} title={page.title} allowFullScreen loading="lazy" className="h-full w-full" />
              </div>
            )}

            {Array.isArray(page.gallery_urls) && page.gallery_urls.length > 0 && (
              <section className="mt-10">
                <h2 className="font-display text-xl font-bold">Galeri</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                  {page.gallery_urls.map((u: string, i: number) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setLbIndex(i)}
                      className="group relative aspect-square overflow-hidden rounded-xl bg-muted ring-1 ring-border/50 transition hover:shadow-md"
                      aria-label={`Buka gambar ${i + 1}`}
                    >
                      <img
                        src={u}
                        alt={`${page.title} — ${i + 1}`}
                        loading={i < 4 ? "eager" : "lazy"}
                        className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-110"
                      />
                      <span className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              </section>
            )}
          </article>
        )}
      </div>
      {page?.gallery_urls?.length > 0 && (
        <Lightbox
          images={page.gallery_urls}
          index={lbIndex}
          onClose={() => setLbIndex(null)}
          onIndexChange={setLbIndex}
        />
      )}
    </div>
  );
}
