import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/StatCard";
import { ButtonLoading } from "@/components/shared/ButtonLoading";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/lib/storage";
import { Save } from "lucide-react";
import { toast } from "sonner";

export default function CmsSiteSettings() {
  const [row, setRow] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
    if (error) toast.error(error.message);
    setRow(data ?? { nama_yayasan: "Yayasan Darul Rohman" });
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    const payload = { ...row, singleton: true };
    const { error } = row.id
      ? await supabase.from("site_settings").update(payload).eq("id", row.id)
      : await supabase.from("site_settings").insert(payload);
    if (error) toast.error(error.message);
    else { toast.success("Pengaturan berhasil disimpan"); load(); }
    setSaving(false);
  };

  const onHero = async (f: File) => {
    try { const { publicUrl } = await uploadFile("hero", f); setRow({ ...row, hero_image_url: publicUrl }); toast.success("Hero terupload"); } catch (e: any) { toast.error(e.message); }
  };
  const onHeroVideo = async (f: File) => {
    try { const { publicUrl } = await uploadFile("hero", f); setRow({ ...row, hero_video_url: publicUrl }); toast.success("Video hero terupload"); } catch (e: any) { toast.error(e.message); }
  };

  if (loading || !row) return <p className="py-12 text-center text-muted-foreground">Memuat...</p>;

  return (
    <div className="space-y-6">
      <PageHeader title="CMS — Pengaturan Situs" subtitle="Konfigurasi homepage publik" action={
        <ButtonLoading onClick={save} loading={saving} loadingText="Menyimpan..." className="gradient-primary text-primary-foreground"><Save className="mr-2 h-4 w-4" /> Simpan</ButtonLoading>
      } />

      <Card className="rounded-2xl border-0 shadow-soft">
        <CardContent className="space-y-4 p-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Nama Yayasan"><Input value={row.nama_yayasan ?? ""} onChange={(e) => setRow({ ...row, nama_yayasan: e.target.value })} /></Field>
            <Field label="Tagline"><Input value={row.tagline ?? ""} onChange={(e) => setRow({ ...row, tagline: e.target.value })} /></Field>
            <Field label="Email"><Input value={row.email ?? ""} onChange={(e) => setRow({ ...row, email: e.target.value })} /></Field>
            <Field label="Telepon"><Input value={row.telepon ?? ""} onChange={(e) => setRow({ ...row, telepon: e.target.value })} /></Field>
            <div className="md:col-span-2"><Field label="Alamat"><Input value={row.alamat ?? ""} onChange={(e) => setRow({ ...row, alamat: e.target.value })} /></Field></div>
            <div className="md:col-span-2"><Field label="Deskripsi"><Textarea rows={3} value={row.deskripsi ?? ""} onChange={(e) => setRow({ ...row, deskripsi: e.target.value })} /></Field></div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="mb-3 font-display text-lg font-bold">Hero Section</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="Hero Title"><Input value={row.hero_title ?? ""} onChange={(e) => setRow({ ...row, hero_title: e.target.value })} /></Field>
              <Field label="Hero Subtitle"><Input value={row.hero_subtitle ?? ""} onChange={(e) => setRow({ ...row, hero_subtitle: e.target.value })} /></Field>
              <div className="md:col-span-2"><Field label="Hero Image (fallback jika video kosong)">
                <div className="flex items-center gap-2">
                  <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onHero(e.target.files[0])} />
                  {row.hero_image_url && <img src={row.hero_image_url} alt="" className="h-12 w-20 rounded object-cover" />}
                </div>
              </Field></div>
              <div className="md:col-span-2"><Field label="Hero Video (Upload .mp4/.webm)">
                <div className="flex items-center gap-2">
                  <Input type="file" accept="video/*" onChange={(e) => e.target.files?.[0] && onHeroVideo(e.target.files[0])} />
                </div>
              </Field></div>
              <div className="md:col-span-2"><Field label="Atau Hero Video URL (link langsung .mp4)">
                <Input value={row.hero_video_url ?? ""} onChange={(e) => setRow({ ...row, hero_video_url: e.target.value })} placeholder="https://.../video.mp4" />
              </Field></div>
              {row.hero_video_url && (
                <div className="md:col-span-2">
                  <p className="mb-2 text-sm text-muted-foreground">Preview Video Hero:</p>
                  <video src={row.hero_video_url} controls muted className="aspect-video w-full max-w-md rounded-lg bg-black object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="mb-3 font-display text-lg font-bold">Embed</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Field label="YouTube URL"><Input value={row.youtube_url ?? ""} onChange={(e) => setRow({ ...row, youtube_url: e.target.value })} /></Field>
              <Field label="Map Embed (iframe src)"><Input value={row.map_embed ?? ""} onChange={(e) => setRow({ ...row, map_embed: e.target.value })} /></Field>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="mb-3 font-display text-lg font-bold">Deskripsi Unit</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              <Field label="MI An-Nuriyah"><Textarea rows={3} value={row.deskripsi_mi ?? ""} onChange={(e) => setRow({ ...row, deskripsi_mi: e.target.value })} /></Field>
              <Field label="SMP Darul Rohman"><Textarea rows={3} value={row.deskripsi_smp ?? ""} onChange={(e) => setRow({ ...row, deskripsi_smp: e.target.value })} /></Field>
              <Field label="SMK Darul Rohman"><Textarea rows={3} value={row.deskripsi_smk ?? ""} onChange={(e) => setRow({ ...row, deskripsi_smk: e.target.value })} /></Field>
              <Field label="Madrasah Diniyah Al Arsyadiyah"><Textarea rows={3} value={row.deskripsi_madrasah ?? ""} onChange={(e) => setRow({ ...row, deskripsi_madrasah: e.target.value })} /></Field>
              <Field label="TK PGRI 02 Roudlotul Huffadz"><Textarea rows={3} value={row.deskripsi_tk ?? ""} onChange={(e) => setRow({ ...row, deskripsi_tk: e.target.value })} /></Field>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
