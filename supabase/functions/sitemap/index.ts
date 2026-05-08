// Public sitemap.xml generator — auto-updates with CMS posts
// No auth required (public endpoint for crawlers)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const SITE = "https://yayasandarurrahmanku.web.app";

const STATIC: Array<{ loc: string; changefreq: string; priority: string }> = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/mi-an-nuriyah", changefreq: "monthly", priority: "0.9" },
  { loc: "/smp-darul-rohman", changefreq: "monthly", priority: "0.9" },
  { loc: "/smk-darul-rohman", changefreq: "monthly", priority: "0.9" },
  { loc: "/madrasah-diniyah-al-arsyadiyah", changefreq: "monthly", priority: "0.9" },
  { loc: "/tk-pgri-02-roudlotul-huffadz", changefreq: "monthly", priority: "0.9" },
  { loc: "/berita", changefreq: "daily", priority: "0.8" },
  { loc: "/galeri", changefreq: "weekly", priority: "0.7" },
  { loc: "/kontak", changefreq: "monthly", priority: "0.6" },
  { loc: "/jadwal/mi", changefreq: "weekly", priority: "0.6" },
  { loc: "/jadwal/smp", changefreq: "weekly", priority: "0.6" },
  { loc: "/jadwal/smk", changefreq: "weekly", priority: "0.6" },
  { loc: "/jadwal/madrasah", changefreq: "weekly", priority: "0.6" },
  { loc: "/jadwal/tk", changefreq: "weekly", priority: "0.6" },
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function escapeXml(s: string) {
  return s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]!));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: posts } = await supabase
      .from("cms_posts")
      .select("slug, updated_at, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(1000);

    const urls: string[] = [];
    for (const u of STATIC) {
      urls.push(`<url><loc>${SITE}${u.loc}</loc><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`);
    }
    for (const p of posts ?? []) {
      if (!p.slug) continue;
      const lastmod = (p.updated_at ?? p.published_at ?? new Date().toISOString()).slice(0, 10);
      urls.push(`<url><loc>${SITE}/berita/${escapeXml(p.slug)}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "content-type": "application/xml; charset=utf-8",
        "cache-control": "public, max-age=300, s-maxage=600",
      },
    });
  } catch (e) {
    console.error("sitemap error", e);
    return new Response("<?xml version=\"1.0\"?><urlset/>", {
      status: 500,
      headers: { ...corsHeaders, "content-type": "application/xml" },
    });
  }
});
