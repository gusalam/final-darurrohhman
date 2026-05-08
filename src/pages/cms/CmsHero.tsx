import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/StatCard";
import { ButtonLoading } from "@/components/shared/ButtonLoading";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile } from "@/lib/storage";
import { Save, Sparkles, ArrowRight, Upload, Play } from "lucide-react";
import { toast } from "sonner";
import { IntroLoader } from "@/components/shared/IntroLoader";

type HeroRow = {
  id?: string;
  badge_text?: string | null;
  title?: string | null;
  description?: string | null;
  button_primary_text?: string | null;
  button_primary_link?: string | null;
  button_secondary_text?: string | null;
  button_secondary_link?: string | null;
  background_type?: string | null;
  background_url?: string | null;
  intro_enabled?: boolean | null;
  intro_logo_url?: string | null;
  intro_text?: string | null;
  intro_duration_ms?: number | null;
};

export default function CmsHero() {
  const [row, setRow] = useState<HeroRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewIntro, setPreviewIntro] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("hero_settings" as any).select("*").limit(1).maybeSingle();
    if (error) toast.error(error.message);
    setRow((data as any) ?? {});
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!row) return;
    setSaving(true);
    const payload = { ...row, singleton: true };
    const res = row.id
      ? await supabase.from("hero_settings" as any).update(payload).eq("id", row.id)
      : await supabase.from("hero_settings" as any).insert(payload);
    if (res.error) toast.error(res.error.message);
    else { toast.success("Hero settings tersimpan"); load(); }
    setSaving(false);
  };

  const onUpload = async (f: File) => {
    setUploading(true);
    try {
      const { publicUrl } = await uploadFile("hero", f);
      const isVideo = f.type.startsWith("video/");
      setRow({ ...(row || {}), background_url: publicUrl, background_type: isVideo ? "video" : "image" });
      toast.success("Background terupload");
    } catch (e: any) { toast.error(e.message); }
    setUploading(false);
  };

  if (loading || !row) return <p className="py-12 text-center text-muted-foreground">Memuat...</p>;

  return (
    <div className="space-y-6">
      <PageHeader title="CMS — Hero Settings" subtitle="Edit konten hero homepage realtime" action={
        <ButtonLoading onClick={save} loading={saving} loadingText="Menyimpan..." className="gradient-primary text-primary-foreground">
          <Save className="mr-2 h-4 w-4" /> Simpan
        </ButtonLoading>
      } />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-0 shadow-soft">
          <CardContent className="space-y-4 p-6">
            <Field label="Badge Text"><Input value={row.badge_text ?? ""} onChange={(e) => setRow({ ...row, badge_text: e.target.value })} /></Field>
            <Field label="Title"><Textarea rows={2} value={row.title ?? ""} onChange={(e) => setRow({ ...row, title: e.target.value })} /></Field>
            <Field label="Description"><Textarea rows={3} value={row.description ?? ""} onChange={(e) => setRow({ ...row, description: e.target.value })} /></Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Button 1 Text"><Input value={row.button_primary_text ?? ""} onChange={(e) => setRow({ ...row, button_primary_text: e.target.value })} /></Field>
              <Field label="Button 1 Link"><Input value={row.button_primary_link ?? ""} onChange={(e) => setRow({ ...row, button_primary_link: e.target.value })} placeholder="#unit atau /url" /></Field>
              <Field label="Button 2 Text"><Input value={row.button_secondary_text ?? ""} onChange={(e) => setRow({ ...row, button_secondary_text: e.target.value })} /></Field>
              <Field label="Button 2 Link"><Input value={row.button_secondary_link ?? ""} onChange={(e) => setRow({ ...row, button_secondary_link: e.target.value })} placeholder="#kontak" /></Field>
            </div>

            <div className="border-t border-border pt-4">
              <Label>Background (image atau video)</Label>
              <div className="mt-2 flex flex-col gap-2">
                <Input type="file" accept="image/*,video/*" disabled={uploading}
                  onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
                <Input value={row.background_url ?? ""} onChange={(e) => setRow({ ...row, background_url: e.target.value })}
                  placeholder="Atau paste URL langsung" />
                <div className="flex gap-2">
                  <Button type="button" variant={row.background_type === "image" ? "default" : "outline"} size="sm"
                    onClick={() => setRow({ ...row, background_type: "image" })}>Image</Button>
                  <Button type="button" variant={row.background_type === "video" ? "default" : "outline"} size="sm"
                    onClick={() => setRow({ ...row, background_type: "video" })}>Video</Button>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="mb-3 font-display text-base font-bold">Intro Loading Screen</h3>
              <div className="space-y-3">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border accent-primary"
                    checked={row.intro_enabled ?? true}
                    onChange={(e) => setRow({ ...row, intro_enabled: e.target.checked })}
                  />
                  <span className="text-sm font-medium">Aktifkan intro loading screen</span>
                </label>
                <Field label="Text Intro">
                  <Input value={row.intro_text ?? ""} onChange={(e) => setRow({ ...row, intro_text: e.target.value })} placeholder="Yayasan Darur Rohman Morombuh" />
                </Field>
                <Field label="Durasi (milidetik) — 800 sampai 6000">
                  <Input type="number" min={800} max={6000} step={100}
                    value={row.intro_duration_ms ?? 2500}
                    onChange={(e) => setRow({ ...row, intro_duration_ms: Number(e.target.value) })} />
                </Field>
                <Field label="Logo Intro (opsional, fallback ke logo yayasan)">
                  <div className="flex items-center gap-2">
                    <Input type="file" accept="image/*"
                      onChange={async (e) => {
                        const f = e.target.files?.[0]; if (!f) return;
                        try { const { publicUrl } = await uploadFile("hero", f); setRow({ ...row, intro_logo_url: publicUrl }); toast.success("Logo terupload"); } catch (err: any) { toast.error(err.message); }
                      }} />
                    {row.intro_logo_url && <img src={row.intro_logo_url} alt="" className="h-12 w-12 rounded object-contain bg-white p-1" />}
                  </div>
                </Field>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live preview */}
        <Card className="rounded-2xl border-0 shadow-soft overflow-hidden">
          <CardContent className="p-0">
            <p className="border-b border-border bg-muted/40 px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Preview Realtime</p>
            <div className="relative gradient-hero text-white overflow-hidden">
              {row.background_type === "video" && row.background_url ? (
                <>
                  <video src={row.background_url} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/50" />
                </>
              ) : row.background_url ? (
                <>
                  <div className="absolute inset-0" style={{ backgroundImage: `url(${row.background_url})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                  <div className="absolute inset-0 bg-black/50" />
                </>
              ) : null}
              <div className="relative px-6 py-10">
                {row.badge_text && (
                  <Badge className="mb-3 border-0 bg-secondary text-secondary-foreground"><Sparkles className="mr-1 h-3 w-3" /> {row.badge_text}</Badge>
                )}
                <h1 className="font-display text-2xl font-bold md:text-3xl">{row.title || "Judul Hero"}</h1>
                <p className="mt-3 text-sm text-white/90">{row.description || "Deskripsi hero"}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {row.button_primary_text && <Button size="sm" className="bg-secondary text-secondary-foreground">{row.button_primary_text} <ArrowRight className="ml-1 h-3 w-3" /></Button>}
                  {row.button_secondary_text && <Button size="sm" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20">{row.button_secondary_text}</Button>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
