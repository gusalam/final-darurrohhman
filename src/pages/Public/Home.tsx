import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { listFiles } from "@/lib/storage";
import { GraduationCap, BookOpen, Briefcase, MapPin, Phone, Mail, Sparkles, ArrowRight, LogIn, Newspaper, Megaphone, ImageIcon, Calendar, School, Sprout } from "lucide-react";
import { UNITS } from "@/lib/units";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { SEO } from "@/components/SEO";
import { GaleriSlider } from "@/components/shared/GaleriSlider";
import { SocialLinks } from "@/components/shared/SocialLinks";
import { IntroLoader } from "@/components/shared/IntroLoader";
import { Reveal, Stagger, StaggerItem } from "@/components/shared/Reveal";
import { motion } from "framer-motion";

const PLACEHOLDER = "/placeholder.png";

/** Accept full <iframe> markup, share URL, or embed URL and return a usable iframe src. */
function normalizeMapEmbed(input: string): string {
  if (!input) return "";
  const v = input.trim();
  // Full iframe HTML — extract src
  const m = v.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (m) return m[1];
  // Short share link maps.app.goo.gl / goo.gl/maps — wrap as q=
  if (/^https?:\/\/(maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(v)) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(v)}&output=embed`;
  }
  // Regular maps URL without /embed — convert
  if (/^https?:\/\/(www\.)?google\.[^/]+\/maps\//i.test(v) && !/\/embed/.test(v)) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(v)}&output=embed`;
  }
  return v;
}

export default function PublicHome() {
  const [settings, setSettings] = useState<any>(null);
  const [hero, setHero] = useState<any>(null);
  
  const [storageGallery, setStorageGallery] = useState<string[]>([]);
  const { data: banners } = useSupabaseTable<any>("cms_banners", { filters: { is_active: true }, orderBy: { column: "sort_order", ascending: true } });
  const { data: posts } = useSupabaseTable<any>("cms_posts", { filters: { status: "published" } });
  const { data: pages } = useSupabaseTable<any>("cms_pages", { filters: { is_published: true } });
  const { data: schedules } = useSupabaseTable<any>("schedules", { select: "*, classes(nama, unit), subjects(nama), teachers(nama)", orderBy: { column: "jam_mulai", ascending: true } });

  useEffect(() => {
    const loadSettings = () => supabase.from("site_settings").select("*").limit(1).maybeSingle().then(({ data }) => setSettings(data));
    const loadHero = () => supabase.from("hero_settings" as any).select("*").limit(1).maybeSingle().then(({ data }) => setHero(data));
    loadSettings(); loadHero();
    const ch = supabase.channel("rt-public")
      .on("postgres_changes", { event: "*", schema: "public", table: "site_settings" }, loadSettings)
      .on("postgres_changes", { event: "*", schema: "public", table: "hero_settings" }, loadHero)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  // Load gallery from the "galeri" storage bucket (where admins upload via CMS Galeri)
  const loadGallery = async () => {
    try {
      const files = await listFiles("galeri");
      setStorageGallery(files.map((f) => f.publicUrl));
    } catch (e) {
      console.error("Gagal load galeri:", e);
    }
  };
  useEffect(() => {
    loadGallery();
    const onFocus = () => loadGallery();
    window.addEventListener("focus", onFocus);
    return () => { window.removeEventListener("focus", onFocus); };
  }, []);

  // Debug
  if (typeof window !== "undefined") {
    console.log("[Home] banners:", banners.length, "posts:", posts.length, "gallery:", storageGallery.length);
  }

  const pengumuman = posts.filter((p) => p.category === "pengumuman").slice(0, 3);
  const berita = posts.filter((p) => p.category !== "pengumuman").slice(0, 6);
  // Combine storage gallery + cms_pages gallery_urls
  const pageGallery: string[] = pages.flatMap((p) => p.gallery_urls ?? []);
  const gallery: string[] = Array.from(new Set([...storageGallery, ...pageGallery])).slice(0, 12);

  const youtubeId = (() => {
    const u = settings?.youtube_url;
    if (!u) return null;
    const m = u.match(/(?:youtu\.be\/|v=)([\w-]{11})/);
    return m ? m[1] : null;
  })();

  const heroBgImage = (hero?.background_type === "image" && hero?.background_url) || settings?.hero_image_url || banners[0]?.image_url;
  const heroBgVideo = (hero?.background_type === "video" && hero?.background_url) || settings?.hero_video_url;

  const SITE = "https://yayasandarurrahmanku.web.app";
  const sections = [
    { id: "tentang", name: "Tentang" },
    { id: "unit", name: "Unit Pendidikan" },
    { id: "ppdb", name: "PPDB" },
    { id: "berita", name: "Berita" },
    { id: "galeri", name: "Galeri" },
    { id: "kontak", name: "Kontak" },
  ];
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: SITE + "/" },
      ...sections.map((s, i) => ({ "@type": "ListItem", position: i + 2, name: s.name, item: `${SITE}/#${s.id}` })),
    ],
  };
  const navLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Navigasi Utama",
    itemListElement: sections.map((s, i) => ({
      "@type": "SiteNavigationElement",
      position: i + 1,
      name: s.name,
      url: `${SITE}/#${s.id}`,
    })),
  };
  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings?.nama_yayasan ?? "Yayasan Darur Rohman Morombuh Kwanyar",
    url: SITE + "/",
    inLanguage: "id-ID",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
  const orgLd = {
    "@context": "https://schema.org",
    "@type": ["Organization", "EducationalOrganization"],
    name: "Yayasan Darur Rohman Morombuh Kwanyar",
    alternateName: ["Yayasan Darurrahman", "Ponpes Darurrahman Morombuh", "Yayasan Darul Rohman"],
    url: SITE + "/",
    logo: settings?.logo_url || `${SITE}/favicon.png`,
    email: settings?.email,
    telephone: settings?.telepon,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings?.alamat,
      addressLocality: "Morombuh",
      addressRegion: "Kwanyar, Bangkalan, Jawa Timur",
      addressCountry: "ID",
    },
    sameAs: [
      settings?.social_facebook, settings?.social_instagram, settings?.social_tiktok,
      settings?.social_youtube, settings?.social_twitter, settings?.social_telegram,
      settings?.social_linkedin, settings?.social_threads,
    ].filter(Boolean),
  };

  return (
    <div id="top" className="min-h-screen bg-background text-foreground">
      <SEO
        title={`${settings?.nama_yayasan ?? "Yayasan Darur Rohman Morombuh"} | MI, SMP, SMK, Madrasah & TK`}
        description={settings?.deskripsi ?? "Website resmi Yayasan Darur Rohman Morombuh Kwanyar Bangkalan. Terdiri dari MI An-Nuriyah, SMP Darul Rohman, SMK Darul Rohman, Madrasah Diniyah Al Arsyadiyah, dan TK PGRI 02 Roudlotul Huffadz."}
        keywords="yayasan darur rohman morombuh, yayasan darurrohhman morombuh, ponpes darurrahman morombuh kwanyar, mi an-nuriyah, madrasah ibtidaiyah an-nuriyah, smp darul rohman, smk darul rohman, madrasah diniyah al arsyadiyah, tk pgri 02 roudlotul huffadz, sekolah islam morombuh, bangkalan madura"
        canonical={SITE + "/"}
        image={settings?.logo_url || `${SITE}/favicon.png`}
        googleVerification={settings?.google_site_verification}
        bingVerification={settings?.bing_site_verification}
        jsonLd={[breadcrumbLd, navLd, websiteLd, orgLd]}
      />
      <IntroLoader
        enabled={hero?.intro_enabled ?? true}
        logoUrl={hero?.intro_logo_url}
        text={hero?.intro_text}
        durationMs={hero?.intro_duration_ms}
      />
      <PublicNavbar yayasanName={settings?.nama_yayasan} tagline={settings?.tagline} />

      <div className="min-w-0">

        <section id="tentang" className="relative overflow-hidden gradient-hero text-white lg:min-h-[80vh] lg:flex lg:items-center">
          {heroBgVideo ? (
            <>
              <video
                src={heroBgVideo}
                autoPlay
                muted
                loop
                playsInline
                poster={heroBgImage || undefined}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/55" />
            </>
          ) : (
            heroBgImage && (
              <>
                <div className="absolute inset-0" style={{ backgroundImage: `url(${heroBgImage})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                <div className="absolute inset-0 bg-black/55" />
              </>
            )
          )}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-screen-2xl px-4 py-16 md:py-24 lg:py-32 xl:py-40 md:px-8 lg:px-12 xl:px-20"
          >
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Badge className="mb-4 border-0 bg-secondary text-secondary-foreground lg:px-3 lg:py-1 lg:text-sm">
                <Sparkles className="mr-1 h-3 w-3" /> {hero?.badge_text ?? "Sistem Terpadu Pendidikan"}
              </Badge>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="max-w-5xl font-display text-3xl font-bold leading-tight md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-[5.5rem]"
            >
              {hero?.title ?? settings?.hero_title ?? "Membentuk Generasi Qur'ani, Cerdas & Berakhlak Mulia"}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="mt-5 lg:mt-8 max-w-3xl text-base text-white/90 md:text-lg lg:text-xl xl:text-2xl"
            >
              {hero?.description ?? settings?.hero_subtitle ?? settings?.deskripsi ?? "Yayasan Darul Rohman menyelenggarakan pendidikan Islam terpadu MI, SMP, SMK, Madrasah Diniyah, dan TK."}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-7 lg:mt-10 flex flex-wrap gap-3 lg:gap-4"
            >
              <a href={hero?.button_primary_link ?? "#unit"}>
                <Button size="lg" className="bg-secondary text-secondary-foreground transition hover:scale-105 lg:h-14 lg:px-8 lg:text-base">
                  {hero?.button_primary_text ?? "Jelajahi Unit"} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <a href={hero?.button_secondary_link ?? "#kontak"}>
                <Button size="lg" variant="outline" className="border-white/40 bg-white/10 text-white transition hover:scale-105 hover:bg-white/20 lg:h-14 lg:px-8 lg:text-base">
                  {hero?.button_secondary_text ?? "Hubungi Kami"}
                </Button>
              </a>
            </motion.div>
          </motion.div>
        </section>

      <ErrorBoundary silent label="Banners">
        {banners.length > 1 && (
          <section className="bg-muted/40 py-10">
            <div className="mx-auto grid max-w-screen-2xl gap-4 px-4 md:grid-cols-2 md:px-6">
              {banners.slice(1).map((b) => (
                <a key={b.id} href={b.cta_url ?? "#"} className="group relative block h-44 overflow-hidden rounded-2xl bg-muted shadow-soft">
                  <img
                    src={b.image_url || PLACEHOLDER}
                    alt={b.title || "Banner"}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-5 text-white flex flex-col justify-end">
                    {b.title && <p className="font-bold">{b.title}</p>}
                    {b.subtitle && <p className="text-xs text-white/85">{b.subtitle}</p>}
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
      </ErrorBoundary>

      <section id="unit" className="bg-muted/40 py-14 lg:py-24 xl:py-28">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6 lg:px-12 xl:px-20">
          <Reveal className="text-center">
            <Badge variant="outline" className="border-primary text-primary lg:text-sm">Unit Pendidikan</Badge>
            <h2 className="mt-3 font-display text-2xl font-bold md:text-3xl lg:text-4xl xl:text-5xl">MI · SMP · SMK · Madrasah · TK</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground lg:text-base">Lima unit pendidikan terpadu dari jenjang TK hingga SMK di bawah Yayasan Darul Rohman.</p>
          </Reveal>
          <Stagger className="mt-10 lg:mt-14 grid gap-5 lg:gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {[
              { key: "mi" as const,       icon: BookOpen,      color: "gradient-primary", desc: settings?.deskripsi_mi,       slug: "mi-an-nuriyah" },
              { key: "smp" as const,      icon: GraduationCap, color: "gradient-sky",     desc: settings?.deskripsi_smp,      slug: "smp-darul-rohman" },
              { key: "smk" as const,      icon: Briefcase,     color: "gradient-gold",    desc: settings?.deskripsi_smk,      slug: "smk-darul-rohman" },
              { key: "madrasah" as const, icon: School,        color: "gradient-primary", desc: settings?.deskripsi_madrasah, slug: "madrasah-diniyah-al-arsyadiyah" },
              { key: "tk" as const,       icon: Sprout,        color: "gradient-sky",     desc: settings?.deskripsi_tk,       slug: "tk-pgri-02-roudlotul-huffadz" },
            ].map((u) => {
              const info = UNITS[u.key];
              return (
                <StaggerItem key={u.key}>
                  <Link to={`/${u.slug}`} aria-label={`Halaman ${info.fullName}`}>
                    <Card id={`unit-${u.key}`} className="h-full scroll-mt-20 rounded-2xl border-border shadow-soft overflow-hidden hover-lift hover-glow">
                      <CardContent className="p-6 lg:p-7">
                        <div className="flex items-center gap-4">
                          <div className="flex h-16 w-16 lg:h-20 lg:w-20 shrink-0 items-center justify-center rounded-2xl bg-white p-1.5 shadow-soft">
                            <img src={info.logo} alt={`Logo ${info.fullName}`} loading="lazy" decoding="async" className="h-full w-full object-contain" />
                          </div>
                          <div className={`flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-xl ${u.color} text-primary-foreground`}>
                            <u.icon className="h-5 w-5 lg:h-6 lg:w-6" />
                          </div>
                        </div>
                        <h3 className="mt-4 lg:mt-5 font-display text-lg lg:text-xl font-bold">{info.fullName}</h3>
                        <p className="mt-2 text-sm lg:text-[15px] text-muted-foreground line-clamp-3">{u.desc ?? "Deskripsi belum diisi pada CMS."}</p>
                        <p className="mt-4 text-xs lg:text-sm font-semibold text-primary">Selengkapnya →</p>
                      </CardContent>
                    </Card>
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      <section id="akademik" className="mx-auto max-w-screen-2xl px-4 py-14 lg:py-24 md:px-6 lg:px-12 xl:px-20">
        <Badge variant="outline" className="border-primary text-primary lg:text-sm">Akademik</Badge>
        <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl lg:text-4xl">Informasi Akademik</h2>
        <p className="mt-3 max-w-3xl text-sm lg:text-base text-muted-foreground">
          Jadwal pelajaran, pengumuman, dan informasi akademik terbaru dari setiap unit.
          Login sebagai admin untuk mengelola data lengkap.
        </p>
        <div className="mt-8 grid gap-5 lg:gap-6 sm:grid-cols-3">
          {[
            { label: "Jadwal Pelajaran", desc: "Real-time per unit", target: "#jadwal" },
            { label: "Pengumuman", desc: "Update terbaru", target: "#pengumuman" },
            { label: "Berita & Artikel", desc: "Kegiatan sekolah", target: "#berita" },
          ].map((a) => (
            <a key={a.label} href={a.target} className="rounded-2xl border border-border bg-card p-6 lg:p-8 shadow-soft transition hover:-translate-y-1 hover:shadow-md-soft">
              <p className="font-bold lg:text-lg">{a.label}</p>
              <p className="mt-2 text-xs lg:text-sm text-muted-foreground">{a.desc}</p>
            </a>
          ))}
        </div>
      </section>

      <ErrorBoundary silent label="Jadwal">
        <section id="jadwal" className="bg-card py-14 lg:py-20">
          <div className="mx-auto max-w-screen-2xl px-4 md:px-6 lg:px-10">
            <Badge variant="outline" className="border-primary text-primary"><Calendar className="mr-1 h-3 w-3" /> Jadwal</Badge>
            <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">Jadwal Pelajaran (Real-time)</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Pilih unit untuk melihat jadwal pelajaran terbaru pada halaman tersendiri.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {([
                { unit: "mi", label: "MI", desc: "Madrasah Ibtidaiyah An-Nuriyah" },
                { unit: "smp", label: "SMP", desc: "SMP Darul Rohman" },
                { unit: "smk", label: "SMK", desc: "SMK Darul Rohman" },
                { unit: "madrasah", label: "Madrasah", desc: "Madrasah Diniyah Al Arsyadiyah" },
                { unit: "tk", label: "TK", desc: "TK PGRI 02 Roudlotul Huffadz" },
              ] as const).map((u) => (
                <Link
                  key={u.unit}
                  to={`/jadwal/${u.unit}`}
                  className="group flex items-center justify-between rounded-2xl border border-border bg-background p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md-soft"
                >
                  <div>
                    <p className="font-display text-lg font-bold">Jadwal {u.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{u.desc}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-primary transition group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </ErrorBoundary>

      <section id="ppdb" className="bg-muted/40 py-14 lg:py-20">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6 lg:px-10">
          <div className="rounded-3xl gradient-primary p-8 text-primary-foreground shadow-md-soft md:p-12">
            <Badge className="border-0 bg-secondary text-secondary-foreground">PPDB</Badge>
            <h2 className="mt-3 font-display text-2xl font-bold md:text-3xl">Penerimaan Peserta Didik Baru</h2>
            <p className="mt-3 max-w-2xl text-sm text-primary-foreground/90">
              Daftarkan putra-putri Anda di MI An-Nuriyah, SMP/SMK Darul Rohman, Madrasah Diniyah Al Arsyadiyah, atau TK PGRI 02 Roudlotul Huffadz. Hubungi kami untuk informasi pendaftaran.
            </p>
            <a href="#kontak"><Button size="lg" className="mt-5 bg-secondary text-secondary-foreground">Hubungi Pendaftaran <ArrowRight className="ml-2 h-4 w-4" /></Button></a>
          </div>
        </div>
      </section>

      <ErrorBoundary silent label="Pengumuman">
        {pengumuman.length > 0 && (
          <section id="pengumuman" className="mx-auto max-w-screen-2xl px-4 py-14 lg:py-20 md:px-6 lg:px-10">
            <Badge variant="outline"><Megaphone className="mr-1 h-3 w-3" /> Pengumuman</Badge>
            <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">Pengumuman Terbaru</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {pengumuman.map((p) => (
                <article key={p.id} className="rounded-2xl border-l-4 border-secondary bg-secondary/10 p-5 shadow-soft">
                  <h3 className="font-bold">{p.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-foreground/85">{p.excerpt ?? p.content}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </ErrorBoundary>

      <ErrorBoundary silent label="Berita">
        {berita.length > 0 && (
          <section id="berita" className="bg-muted/40 py-14 lg:py-24">
            <div className="mx-auto max-w-screen-2xl px-4 md:px-6 lg:px-12 xl:px-20">
              <Badge variant="outline" className="lg:text-sm"><Newspaper className="mr-1 h-3 w-3" /> Berita</Badge>
              <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl lg:text-4xl">Berita & Artikel</h2>
              <Stagger className="mt-8 lg:mt-10 grid gap-5 lg:gap-7 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {berita.map((p) => (
                  <StaggerItem key={p.id}>
                    <Link to={`/berita/${p.slug}`} className="group block h-full">
                      <Card className="h-full overflow-hidden rounded-2xl border-border shadow-soft hover-lift">
                        <div className="h-44 lg:h-52 xl:h-56 overflow-hidden bg-muted">
                          {p.cover_url ? (
                            <img
                              src={p.cover_url}
                              alt={p.title}
                              loading="lazy"
                              decoding="async"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <ImageIcon className="h-8 w-8 opacity-40" />
                            </div>
                          )}
                        </div>
                        <CardContent className="space-y-2 p-5 lg:p-6">
                          <Badge className="bg-accent text-accent-foreground capitalize">{p.category}</Badge>
                          <h3 className="font-display text-lg lg:text-xl font-bold transition-colors group-hover:text-primary">{p.title}</h3>
                          <p className="line-clamp-3 text-sm lg:text-[15px] text-muted-foreground">{p.excerpt ?? p.content}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  </StaggerItem>
                ))}
              </Stagger>
            </div>
          </section>
        )}
      </ErrorBoundary>

      <ErrorBoundary silent label="Galeri">
        {gallery.length > 0 && (
          <section id="galeri" className="mx-auto max-w-screen-2xl px-4 py-14 lg:py-20 md:px-6 lg:px-10">
            <h2 className="font-display text-2xl font-bold md:text-3xl">Galeri</h2>

            {/* Mobile: auto-sliding carousel */}
            <div className="mt-6 md:hidden">
              <GaleriSlider images={gallery} />
            </div>

            {/* Desktop: grid */}
            <div className="mt-6 hidden grid-cols-3 gap-3 md:grid md:grid-cols-4 xl:grid-cols-6">
              {gallery.map((u) => (
                <img
                  key={u}
                  src={u}
                  alt="Galeri"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
                  className="aspect-square rounded-xl bg-muted object-cover transition-transform duration-500 hover:scale-105"
                />
              ))}
            </div>
          </section>
        )}
      </ErrorBoundary>

      <ErrorBoundary silent label="Video">
        {youtubeId && (
          <section id="video" className="bg-muted/40 py-14 lg:py-24">
            <div className="mx-auto max-w-screen-2xl px-4 md:px-6 lg:px-12 xl:px-20">
              <h2 className="font-display text-2xl font-bold md:text-3xl lg:text-4xl">Video Profil</h2>
              <div className="mt-8 lg:mt-10 mx-auto max-w-6xl aspect-video overflow-hidden rounded-2xl shadow-md-soft">
                <iframe src={`https://www.youtube.com/embed/${youtubeId}`} title="YouTube" allowFullScreen className="h-full w-full" />
              </div>
            </div>
          </section>
        )}
      </ErrorBoundary>

      <section id="kontak" className="mx-auto max-w-screen-2xl px-4 py-14 lg:py-20 md:px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Kontak Yayasan</h2>
            <div className="mt-6 space-y-3">
              <Row icon={MapPin} label="Alamat" value={settings?.alamat ?? "-"} />
              <Row icon={Phone} label="Telepon" value={settings?.telepon ?? "-"} />
              <Row icon={Mail} label="Email" value={settings?.email ?? "-"} />
            </div>
            <div className="mt-6">
              <SocialLinks data={settings} />
            </div>
          </div>
          {settings?.map_embed && (
            <div className="aspect-video overflow-hidden rounded-2xl shadow-soft">
              <iframe
                src={normalizeMapEmbed(settings.map_embed)}
                title="Lokasi"
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground md:flex-row md:px-6">
          <p>© {new Date().getFullYear()} {settings?.nama_yayasan ?? "Yayasan Darul Rohman"}.</p>
          <div className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
            <p>Sistem Terpadu Pendidikan v1.0</p>
            <a
              href="https://tretandevelopment.web.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-secondary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow-soft transition hover:opacity-90"
            >
              <Sparkles className="h-3 w-3" /> Developed by Tretan Development
            </a>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary text-primary-foreground"><Icon className="h-4 w-4" /></div>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
