// AI agent for Yayasan Darul Rohman — answers using real-time Supabase data.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const UNIT_LABEL: Record<string, string> = {
  mi: "MI An-Nuriyah",
  smp: "SMP Darul Rohman",
  smk: "SMK Darul Rohman",
  madrasah: "Madrasah Diniyah Al Arsyadiyah",
  tk: "TK PGRI 02 Roudlotul Huffadz",
};

async function buildContext() {
  const sb = createClient(SUPABASE_URL, SERVICE_KEY);
  const [site, pages, posts, students, teachers, classes, schedules, banners] = await Promise.all([
    sb.from("site_settings").select("*").limit(1).maybeSingle(),
    sb.from("cms_pages").select("slug,title,meta_description,content,sort_order").eq("is_published", true).order("sort_order"),
    sb.from("cms_posts").select("title,slug,excerpt,category,unit,published_at").eq("status", "published").order("published_at", { ascending: false }).limit(15),
    sb.from("students").select("unit"),
    sb.from("teachers").select("unit,nama,jabatan,mapel_utama"),
    sb.from("classes").select("unit,nama,tingkat"),
    sb.from("schedules").select("unit,hari,jam_mulai,jam_selesai,ruangan,classes(nama),subjects(nama),teachers(nama)").limit(50),
    sb.from("cms_banners").select("title,subtitle,cta_label,cta_url").eq("is_active", true),
  ]);

  const countByUnit = (rows: any[] | null) => {
    const m: Record<string, number> = {};
    (rows ?? []).forEach((r) => { m[r.unit] = (m[r.unit] ?? 0) + 1; });
    return m;
  };

  const s = site.data ?? {};
  const ctx = {
    yayasan: {
      nama: s.nama_yayasan, tagline: s.tagline, alamat: s.alamat,
      telepon: s.telepon, email: s.email, deskripsi: s.deskripsi,
      sosial: {
        instagram: s.social_instagram, facebook: s.social_facebook,
        youtube: s.social_youtube, tiktok: s.social_tiktok,
        whatsapp: s.social_whatsapp,
      },
    },
    unit_deskripsi: {
      mi: s.deskripsi_mi, smp: s.deskripsi_smp, smk: s.deskripsi_smk,
      madrasah: s.deskripsi_madrasah, tk: s.deskripsi_tk,
    },
    statistik: {
      siswa_per_unit: countByUnit(students.data),
      guru_per_unit: countByUnit(teachers.data),
      kelas_per_unit: countByUnit(classes.data),
      total_siswa: students.data?.length ?? 0,
      total_guru: teachers.data?.length ?? 0,
      total_kelas: classes.data?.length ?? 0,
    },
    halaman_cms: (pages.data ?? []).map((p: any) => ({
      slug: p.slug, title: p.title, ringkasan: p.meta_description,
      konten: (p.content ?? "").slice(0, 600),
    })),
    berita_terbaru: (posts.data ?? []).map((p: any) => ({
      title: p.title, slug: p.slug, excerpt: p.excerpt,
      category: p.category, unit: p.unit, tanggal: p.published_at,
    })),
    guru: (teachers.data ?? []).slice(0, 30),
    kelas: classes.data ?? [],
    jadwal_contoh: (schedules.data ?? []).slice(0, 20).map((j: any) => ({
      unit: UNIT_LABEL[j.unit] ?? j.unit, hari: j.hari,
      jam: `${(j.jam_mulai ?? "").slice(0, 5)}-${(j.jam_selesai ?? "").slice(0, 5)}`,
      kelas: j.classes?.nama, mapel: j.subjects?.nama, guru: j.teachers?.nama, ruangan: j.ruangan,
    })),
    pengumuman_aktif: banners.data ?? [],
  };
  return ctx;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const ctx = await buildContext();

    const system = `Kamu adalah "Asisten Darul Rohman", AI agent resmi Yayasan Darul Rohman Morombuh, Kwanyar, Bangkalan, Madura.

Tugasmu menjawab pertanyaan calon siswa, wali murid, dan masyarakat tentang:
- Profil yayasan dan unit pendidikan (MI An-Nuriyah, SMP Darul Rohman, SMK Darul Rohman, Madrasah Diniyah Al Arsyadiyah, TK PGRI 02 Roudlotul Huffadz, Ponpes Darurrahman)
- PPDB / pendaftaran siswa baru
- Visi, misi, program, dan keunggulan
- Statistik real-time (jumlah siswa, guru, kelas)
- Jadwal pelajaran
- Berita & pengumuman terbaru
- Kontak dan lokasi

Aturan:
- Jawab dalam Bahasa Indonesia yang ramah, sopan, dan jelas.
- Gunakan markdown ringan (bold, list) bila membantu.
- Jawablah HANYA berdasarkan DATA REAL-TIME di bawah. Jika data tidak tersedia, katakan dengan jujur dan arahkan pengguna ke kontak/PPDB.
- Jangan mengarang nomor, alamat, biaya, atau tanggal.
- Jika ditanya cara daftar, arahkan ke halaman PPDB (/ppdb) atau kontak WhatsApp/telepon dari data.
- Singkat dan to-the-point (maks ~6 kalimat) kecuali diminta detail.

DATA REAL-TIME (JSON):
${JSON.stringify(ctx, null, 2)}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: system }, ...messages],
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      const status = aiRes.status === 429 || aiRes.status === 402 ? aiRes.status : 500;
      return new Response(JSON.stringify({ error: txt }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await aiRes.json();
    const reply = data.choices?.[0]?.message?.content ?? "Maaf, terjadi kesalahan.";
    return new Response(JSON.stringify({ reply }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
