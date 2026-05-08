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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
  const [showJadwal, setShowJadwal] = useState(false);
  const [storageGallery, setStorageGallery] = useState<string[]>([]);
  const { data: banners } = useSupabaseTable<any>("cms_banners", { filters: { is_active: true }, orderBy: { column: "sort_order", ascending: true } });
  const { data: posts } = useSupabaseTable<any>("cms_posts", { filters: { status: "published" } });
  const { data: pages } = useSupabaseTable<any>("cms_pages", { filters: { is_published: true } });
  const { data: schedules } = useSupabaseTable<any>("schedules", { select: "*, classes(nama, unit), subjects(nama), teachers(nama)", orderBy: { column: "jam_mulai", ascending: true } });

  useEffect(() => {
    supabase.from("site_settings").select("*").limit(1).maybeSingle().then(({ data }) => setSettings(data));
    const ch = supabase.channel("rt-settings").on("postgres_changes", { event: "*", schema: "public", table: "site_settings" }, () => {
      supabase.from("site_settings").select("*").limit(1).maybeSingle().then(({ data }) => setSettings(data));
    }).subscribe();
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
    const onHash = () => { if (window.location.hash === "#jadwal") setShowJadwal(true); };
    window.addEventListener("focus", onFocus);
    window.addEventListener("hashchange", onHash);
    return () => { window.removeEventListener("focus", onFocus); window.removeEventListener("hashchange", onHash); };
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

  const heroBg = settings?.hero_image_url || banners[0]?.image_url;
  const heroVideo = settings?.hero_video_url;

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

  return (
    <div id="top" className="min-h-screen bg-background text-foreground">
      <SEO
        title={`${settings?.nama_yayasan ?? "Yayasan Darur Rohman Morombuh Kwanyar"} — MI An-Nuriyah, SMP, Madrasah Diniyah, TK`}
        description={settings?.deskripsi ?? "Website resmi Yayasan Darur Rohman Morombuh Kwanyar: MI An-Nuriyah, SMP Darul Rohman, SMK Darul Rohman, Madrasah Diniyah Al Arsyadiyah, dan TK PGRI 02 Roudlotul Huffadz."}
        canonical={SITE + "/"}
        image={settings?.logo_url}
        jsonLd={[breadcrumbLd, navLd]}
      />
      <PublicNavbar yayasanName={settings?.nama_yayasan} tagline={settings?.tagline} />

      <div className="min-w-0">

        <section id="tentang" className="relative overflow-hidden gradient-hero text-white">
          {heroVideo ? (
            <>
              <video
                src={heroVideo}
                autoPlay
                muted
                loop
                playsInline
                poster={heroBg || undefined}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50" />
            </>
          ) : (
            heroBg && <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          )}
          <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24 md:px-8">
            <Badge className="mb-4 border-0 bg-secondary text-secondary-foreground"><Sparkles className="mr-1 h-3 w-3" /> Sistem Terpadu Pendidikan</Badge>
            <h1 className="font-display text-3xl font-bold md:text-5xl">{settings?.hero_title ?? "Membentuk Generasi Qur'ani, Cerdas & Berakhlak Mulia"}</h1>
            <p className="mt-5 max-w-xl text-base text-white/90 md:text-lg">{settings?.hero_subtitle ?? settings?.deskripsi ?? "Yayasan Darul Rohman menyelenggarakan pendidikan Islam terpadu MI, SMP, SMK, Madrasah Diniyah, dan TK."}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#unit"><Button size="lg" className="bg-secondary text-secondary-foreground">Jelajahi Unit <ArrowRight className="ml-2 h-4 w-4" /></Button></a>
              <a href="#kontak"><Button size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20">Hubungi Kami</Button></a>
            </div>
          </div>
        </section>

      <ErrorBoundary silent label="Banners">
        {banners.length > 1 && (
          <section className="bg-muted/40 py-10">
            <div className="mx-auto grid max-w-7xl gap-4 px-4 md:grid-cols-2 md:px-6">
              {banners.slice(1).map((b) => (
                <a key={b.id} href={b.cta_url ?? "#"} className="group relative block h-44 overflow-hidden rounded-2xl bg-muted shadow-soft">
                  <img
                    src={b.image_url || PLACEHOLDER}
                    alt={b.title || "Banner"}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
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

      <section id="unit" className="bg-muted/40 py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center">
            <Badge variant="outline" className="border-primary text-primary">Unit Pendidikan</Badge>
            <h2 className="mt-3 font-display text-2xl font-bold md:text-3xl">MI · SMP · SMK · Madrasah · TK</h2>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { key: "mi" as const,       icon: BookOpen,      color: "gradient-primary", desc: settings?.deskripsi_mi },
              { key: "smp" as const,      icon: GraduationCap, color: "gradient-sky",     desc: settings?.deskripsi_smp },
              { key: "smk" as const,      icon: Briefcase,     color: "gradient-gold",    desc: settings?.deskripsi_smk },
              { key: "madrasah" as const, icon: School,        color: "gradient-primary", desc: settings?.deskripsi_madrasah },
              { key: "tk" as const,       icon: Sprout,        color: "gradient-sky",     desc: settings?.deskripsi_tk },
            ].map((u) => {
              const info = UNITS[u.key];
              return (
                <Card key={u.key} id={`unit-${u.key}`} className="scroll-mt-20 rounded-2xl border-border shadow-soft overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white p-1.5 shadow-soft">
                        <img src={info.logo} alt={`Logo ${info.short}`} className="h-full w-full object-contain" />
                      </div>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${u.color} text-primary-foreground`}>
                        <u.icon className="h-5 w-5" />
                      </div>
                    </div>
                    <h3 className="mt-4 font-display text-lg font-bold">{info.fullName}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{u.desc ?? "Deskripsi belum diisi pada CMS."}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section id="akademik" className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <Badge variant="outline" className="border-primary text-primary">Akademik</Badge>
        <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">Informasi Akademik</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Jadwal pelajaran, pengumuman, dan informasi akademik terbaru dari setiap unit.
          Login sebagai admin untuk mengelola data lengkap.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Jadwal Pelajaran", desc: "Real-time per unit", target: "#jadwal", action: () => setShowJadwal(true) },
            { label: "Pengumuman", desc: "Update terbaru", target: "#pengumuman" },
            { label: "Berita & Artikel", desc: "Kegiatan sekolah", target: "#berita" },
          ].map((a) => (
            <a key={a.label} href={a.target} onClick={() => a.action?.()} className="rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:shadow-md-soft">
              <p className="font-bold">{a.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{a.desc}</p>
            </a>
          ))}
        </div>
      </section>

      <ErrorBoundary silent label="Jadwal">
        <section id="jadwal" className="bg-card py-14">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <Badge variant="outline" className="border-primary text-primary"><Calendar className="mr-1 h-3 w-3" /> Jadwal</Badge>
            <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">Jadwal Pelajaran (Real-time)</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Klik tombol di bawah untuk menampilkan jadwal terbaru per unit.
            </p>
            <div className="mt-4">
              <Button onClick={() => setShowJadwal((v) => !v)} className="gradient-primary text-primary-foreground">
                <Calendar className="mr-2 h-4 w-4" /> {showJadwal ? "Sembunyikan Jadwal" : "Tampilkan Jadwal"}
              </Button>
            </div>
            {showJadwal && (
            <Tabs defaultValue="mi" className="mt-6">
              <TabsList className="flex-wrap">
                <TabsTrigger value="mi">MI</TabsTrigger>
                <TabsTrigger value="smp">SMP</TabsTrigger>
                <TabsTrigger value="smk">SMK</TabsTrigger>
                <TabsTrigger value="madrasah">Madrasah</TabsTrigger>
                <TabsTrigger value="tk">TK</TabsTrigger>
              </TabsList>
              {(["mi", "smp", "smk", "madrasah", "tk"] as const).map((u) => {
                const rows = schedules.filter((s: any) => s.unit === u).slice(0, 20);
                return (
                  <TabsContent key={u} value={u} className="mt-4">
                    {rows.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                        Belum ada jadwal untuk unit {u.toUpperCase()}.
                      </p>
                    ) : (
                      <div className="overflow-x-auto rounded-2xl border border-border shadow-soft">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Hari</TableHead>
                              <TableHead>Jam</TableHead>
                              <TableHead>Kelas</TableHead>
                              <TableHead>Mata Pelajaran</TableHead>
                              <TableHead>Guru</TableHead>
                              <TableHead>Ruang</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {rows.map((s: any) => (
                              <TableRow key={s.id}>
                                <TableCell className="font-medium">{s.hari}</TableCell>
                                <TableCell>{(s.jam_mulai ?? "").slice(0, 5)}–{(s.jam_selesai ?? "").slice(0, 5)}</TableCell>
                                <TableCell>{s.classes?.nama ?? "-"}</TableCell>
                                <TableCell>{s.subjects?.nama ?? "-"}</TableCell>
                                <TableCell>{s.teachers?.nama ?? "-"}</TableCell>
                                <TableCell>{s.ruangan ?? "-"}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </TabsContent>
                );
              })}
            </Tabs>
            )}
          </div>
        </section>
      </ErrorBoundary>

      <section id="ppdb" className="bg-muted/40 py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
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
          <section id="pengumuman" className="mx-auto max-w-7xl px-4 py-14 md:px-6">
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
          <section id="berita" className="bg-muted/40 py-14">
            <div className="mx-auto max-w-7xl px-4 md:px-6">
              <Badge variant="outline"><Newspaper className="mr-1 h-3 w-3" /> Berita</Badge>
              <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">Berita & Artikel</h2>
              <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {berita.map((p) => (
                  <Link key={p.id} to={`/berita/${p.slug}`} className="group block">
                    <Card className="h-full overflow-hidden rounded-2xl border-border shadow-soft transition group-hover:-translate-y-1 group-hover:shadow-lg">
                      <div className="h-40 bg-muted">
                        {p.cover_url ? (
                          <img
                            src={p.cover_url}
                            alt={p.title}
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
                            className="h-full w-full object-cover transition group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <ImageIcon className="h-8 w-8 opacity-40" />
                          </div>
                        )}
                      </div>
                      <CardContent className="space-y-2 p-5">
                        <Badge className="bg-accent text-accent-foreground capitalize">{p.category}</Badge>
                        <h3 className="font-display text-lg font-bold group-hover:text-primary">{p.title}</h3>
                        <p className="line-clamp-3 text-sm text-muted-foreground">{p.excerpt ?? p.content}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </ErrorBoundary>

      <ErrorBoundary silent label="Galeri">
        {gallery.length > 0 && (
          <section id="galeri" className="mx-auto max-w-7xl px-4 py-14 md:px-6">
            <h2 className="font-display text-2xl font-bold md:text-3xl">Galeri</h2>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {gallery.map((u) => (
                <img
                  key={u}
                  src={u}
                  alt="Galeri"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
                  className="aspect-square rounded-xl bg-muted object-cover"
                />
              ))}
            </div>
          </section>
        )}
      </ErrorBoundary>

      <ErrorBoundary silent label="Video">
        {youtubeId && (
          <section id="video" className="bg-muted/40 py-14">
            <div className="mx-auto max-w-5xl px-4 md:px-6">
              <h2 className="font-display text-2xl font-bold md:text-3xl">Video Profil</h2>
              <div className="mt-6 aspect-video overflow-hidden rounded-2xl shadow-soft">
                <iframe src={`https://www.youtube.com/embed/${youtubeId}`} title="YouTube" allowFullScreen className="h-full w-full" />
              </div>
            </div>
          </section>
        )}
      </ErrorBoundary>

      <section id="kontak" className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Kontak Yayasan</h2>
            <div className="mt-6 space-y-3">
              <Row icon={MapPin} label="Alamat" value={settings?.alamat ?? "-"} />
              <Row icon={Phone} label="Telepon" value={settings?.telepon ?? "-"} />
              <Row icon={Mail} label="Email" value={settings?.email ?? "-"} />
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
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground md:flex-row md:px-6">
          <p>© {new Date().getFullYear()} {settings?.nama_yayasan ?? "Yayasan Darul Rohman"}.</p>
          <p>Sistem Terpadu Pendidikan v1.0</p>
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
