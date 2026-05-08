import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { SEO } from "@/components/SEO";

const PLACEHOLDER = "/placeholder.png";

export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>();
  const nav = useNavigate();
  const [post, setPost] = useState<any | null>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("site_settings").select("*").limit(1).maybeSingle().then(({ data }) => setSettings(data));
  }, []);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    window.scrollTo({ top: 0 });
    (async () => {
      const { data } = await supabase
        .from("cms_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      setPost(data);
      if (data) {
        const { data: rel } = await supabase
          .from("cms_posts")
          .select("id, slug, title, excerpt, cover_url, category, published_at")
          .eq("status", "published")
          .neq("id", data.id)
          .limit(3);
        setRelated(rel ?? []);
      }
      setLoading(false);
    })();
  }, [slug]);

  const SITE = "https://yayasandarurrahmanku.web.app";
  const canonical = post ? `${SITE}/berita/${post.slug}` : `${SITE}/berita`;
  const description = post?.excerpt || post?.content?.slice(0, 155) || "Berita dan informasi Yayasan Darur Rohman Morombuh Kwanyar.";
  const jsonLd = post ? [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Beranda", item: SITE + "/" },
        { "@type": "ListItem", position: 2, name: "Berita", item: SITE + "/#berita" },
        { "@type": "ListItem", position: 3, name: post.title, item: canonical },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description,
      image: post.cover_url ? [post.cover_url] : undefined,
      datePublished: post.published_at || post.created_at,
      dateModified: post.updated_at || post.published_at || post.created_at,
      author: { "@type": "Organization", name: settings?.nama_yayasan || "Yayasan Darur Rohman" },
      publisher: { "@type": "Organization", name: settings?.nama_yayasan || "Yayasan Darur Rohman" },
      mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
      articleSection: post.category,
    },
  ] : undefined;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title={post ? `${post.title} — Yayasan Darur Rohman` : "Berita — Yayasan Darur Rohman"}
        description={description}
        image={post?.cover_url}
        canonical={canonical}
        type="article"
        jsonLd={jsonLd}
      />
      <PublicNavbar yayasanName={settings?.nama_yayasan} tagline={settings?.tagline} />

      <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
        <Button variant="ghost" onClick={() => nav(-1)} className="mb-6 -ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>

        {loading ? (
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-64 w-full animate-pulse rounded-2xl bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
          </div>
        ) : !post ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <h1 className="font-display text-2xl font-bold">Artikel tidak ditemukan</h1>
            <p className="mt-2 text-muted-foreground">Konten ini mungkin telah dihapus atau belum dipublikasikan.</p>
            <Link to="/#berita"><Button className="mt-6">Lihat semua berita</Button></Link>
          </div>
        ) : (
          <article>
            <div className="flex flex-wrap items-center gap-2">
              {post.category && (
                <Badge className="bg-accent text-accent-foreground capitalize">
                  <Tag className="mr-1 h-3 w-3" /> {post.category}
                </Badge>
              )}
              {post.published_at && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(post.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              )}
            </div>

            <h1 className="mt-3 font-display text-3xl font-bold md:text-4xl">{post.title}</h1>
            {post.excerpt && <p className="mt-3 text-lg text-muted-foreground">{post.excerpt}</p>}

            {post.cover_url && (
              <img
                src={post.cover_url}
                alt={post.title}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
                className="mt-6 h-72 w-full rounded-2xl object-cover shadow-soft md:h-96"
              />
            )}

            <div className="prose prose-neutral mt-8 max-w-none whitespace-pre-wrap text-base leading-relaxed text-foreground/90 dark:prose-invert">
              {post.content || "—"}
            </div>
          </article>
        )}

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-xl font-bold">Artikel lainnya</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.id}
                  to={`/berita/${p.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition hover:shadow-lg"
                >
                  <div className="h-32 bg-muted">
                    {p.cover_url && (
                      <img
                        src={p.cover_url}
                        alt={p.title}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-2 font-semibold">{p.title}</h3>
                    {p.excerpt && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.excerpt}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
