import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, Mail, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { SEO } from "@/components/SEO";
import { Reveal } from "@/components/shared/Reveal";
import { supabase } from "@/integrations/supabase/client";
import { UNITS, type UnitKey } from "@/lib/units";

const SITE = "https://yayasandarurrahmanku.web.app";

const SLUG_TO_UNIT: Record<string, UnitKey> = {
  "mi-an-nuriyah": "mi",
  "smp-darul-rohman": "smp",
  "smk-darul-rohman": "smk",
  "madrasah-diniyah-al-arsyadiyah": "madrasah",
  "tk-pgri-02-roudlotul-huffadz": "tk",
};

const KEYWORDS_BY_UNIT: Record<UnitKey, string> = {
  mi: "mi an-nuriyah, madrasah ibtidaiyah an-nuriyah, sekolah dasar islam morombuh, yayasan darur rohman, kwanyar bangkalan",
  smp: "smp darul rohman, smp islam morombuh, sekolah menengah pertama darul rohman, yayasan darur rohman kwanyar",
  smk: "smk darul rohman, sekolah menengah kejuruan darul rohman, smk islam morombuh, kwanyar bangkalan",
  madrasah: "madrasah diniyah al arsyadiyah, madin al arsyadiyah, ponpes darurrahman morombuh, pengajian morombuh",
  tk: "tk pgri 02 roudlotul huffadz, taman kanak-kanak morombuh, paud islam kwanyar",
};

const DESC_BY_UNIT: Record<UnitKey, string> = {
  mi: "MI An-Nuriyah — Madrasah Ibtidaiyah di bawah naungan Yayasan Darur Rohman Morombuh Kwanyar Bangkalan. Pendidikan dasar islami berkualitas.",
  smp: "SMP Darul Rohman Morombuh Kwanyar — Sekolah Menengah Pertama islami terpadu di bawah Yayasan Darur Rohman.",
  smk: "SMK Darul Rohman Morombuh Kwanyar — Sekolah Menengah Kejuruan unggulan dengan kurikulum berbasis kompetensi & nilai islami.",
  madrasah: "Madrasah Diniyah Al Arsyadiyah Morombuh Kwanyar — pendidikan agama Islam terpadu di lingkungan Yayasan Darur Rohman.",
  tk: "TK PGRI 02 Roudlotul Huffadz Morombuh Kwanyar — Pendidikan Anak Usia Dini di lingkungan Yayasan Darur Rohman.",
};

export default function UnitPage() {
  const { slug = "" } = useParams();
  const unitKey = SLUG_TO_UNIT[slug];
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    supabase.from("site_settings").select("*").limit(1).maybeSingle().then(({ data }) => setSettings(data));
  }, []);

  if (!unitKey) return <Navigate to="/" replace />;
  const unit = UNITS[unitKey];
  const descKey = ({ mi: "deskripsi_mi", smp: "deskripsi_smp", smk: "deskripsi_smk", madrasah: "deskripsi_madrasah", tk: "deskripsi_tk" } as const)[unitKey];
  const description = settings?.[descKey] || DESC_BY_UNIT[unitKey];
  const url = `${SITE}/${slug}`;

  const schoolLd = {
    "@context": "https://schema.org",
    "@type": "School",
    name: unit.fullName,
    alternateName: unit.name,
    url,
    image: unit.logo,
    description,
    parentOrganization: {
      "@type": "EducationalOrganization",
      name: "Yayasan Darur Rohman Morombuh Kwanyar",
      url: SITE + "/",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: settings?.alamat,
      addressLocality: "Morombuh",
      addressRegion: "Kwanyar, Bangkalan, Jawa Timur",
      addressCountry: "ID",
    },
    telephone: settings?.telepon,
    email: settings?.email,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Beranda", item: SITE + "/" },
      { "@type": "ListItem", position: 2, name: "Unit Pendidikan", item: SITE + "/#unit" },
      { "@type": "ListItem", position: 3, name: unit.fullName, item: url },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title={`${unit.fullName} — Yayasan Darur Rohman Morombuh Kwanyar`}
        description={description}
        keywords={KEYWORDS_BY_UNIT[unitKey]}
        canonical={url}
        image={unit.logo}
        jsonLd={[schoolLd, breadcrumbLd]}
      />
      <PublicNavbar yayasanName={settings?.nama_yayasan} tagline={settings?.tagline} />

      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
          <Link to="/#unit"><Button variant="ghost" size="sm" className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" /> Kembali</Button></Link>
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-white p-3 shadow-soft md:h-32 md:w-32">
              <img src={unit.logo} alt={`Logo ${unit.fullName}`} className="h-full w-full object-contain" loading="eager" />
            </div>
            <div className="min-w-0 flex-1">
              <Badge variant="outline" className="border-primary text-primary">{unit.level}</Badge>
              <h1 className="mt-2 font-display text-2xl font-bold leading-tight md:text-4xl">{unit.fullName}</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">{description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/jadwal/${unitKey}`}><Button size="sm" className="gradient-primary text-primary-foreground"><Calendar className="mr-2 h-4 w-4" /> Lihat Jadwal</Button></Link>
                <Link to="/#ppdb"><Button size="sm" variant="outline">Pendaftaran (PPDB)</Button></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
        <Reveal>
          <h2 className="font-display text-xl font-bold md:text-2xl">Tentang {unit.name}</h2>
          <Card className="mt-4 rounded-2xl border-0 shadow-soft">
            <CardContent className="prose prose-neutral max-w-none p-6 text-sm leading-relaxed text-foreground/90 dark:prose-invert md:text-base">
              <p>{description}</p>
              <p>
                {unit.fullName} adalah salah satu unit pendidikan di bawah naungan {settings?.nama_yayasan ?? "Yayasan Darur Rohman Morombuh Kwanyar"}.
                Berlokasi di Morombuh, Kwanyar, Bangkalan, Jawa Timur.
              </p>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal>
          <h2 className="mt-10 font-display text-xl font-bold md:text-2xl">Kontak</h2>
          <Card className="mt-4 rounded-2xl border-0 shadow-soft">
            <CardContent className="space-y-2 p-6 text-sm">
              {settings?.alamat && <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-primary" /> {settings.alamat}</p>}
              {settings?.telepon && <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> {settings.telepon}</p>}
              {settings?.email && <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> {settings.email}</p>}
            </CardContent>
          </Card>
        </Reveal>
      </section>
    </div>
  );
}
