import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/StatCard";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ButtonLoading } from "@/components/shared/ButtonLoading";
import { SkeletonCards } from "@/components/shared/SkeletonTable";
import { useConfirm } from "@/hooks/useConfirm";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { dbInsert, dbUpdate, dbDelete } from "@/lib/db";
import { uploadFile } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const empty = () => ({ title: "", slug: "", content: "", cover_url: "", youtube_url: "", map_embed: "", gallery_urls: [] as string[], is_published: false });

export default function CmsPages() {
  const { data, loading: fetching, refetch } = useSupabaseTable<any>("cms_pages");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<any>(empty());
  const [saving, setSaving] = useState(false);
  const { confirm, dialogProps } = useConfirm();

  const submit = async () => {
    if (!draft.title?.trim()) return toast.error("Judul wajib");
    setSaving(true);
    const payload = { ...draft, slug: draft.slug || slugify(draft.title) };
    try {
      if (draft.id) await dbUpdate("cms_pages", draft.id, payload);
      else await dbInsert("cms_pages", payload);
      toast.success("Halaman berhasil disimpan"); setOpen(false); refetch();
    } catch {} finally { setSaving(false); }
  };
  const onCover = async (f: File) => {
    try { const { publicUrl } = await uploadFile("cms-media", f, "covers"); setDraft({ ...draft, cover_url: publicUrl }); } catch (e: any) { toast.error(e.message); }
  };
  const onGallery = async (f: File) => {
    try { const { publicUrl } = await uploadFile("galeri", f); setDraft({ ...draft, gallery_urls: [...(draft.gallery_urls ?? []), publicUrl] }); } catch (e: any) { toast.error(e.message); }
  };
  const removeGalleryUrl = (url: string) => setDraft({ ...draft, gallery_urls: (draft.gallery_urls ?? []).filter((u: string) => u !== url) });

  return (
    <div className="space-y-6">
      <PageHeader title="CMS — Halaman" subtitle="Halaman statis (visi-misi, tentang, dll)" action={
        <Button onClick={() => { setDraft(empty()); setOpen(true); }} className="gradient-primary text-primary-foreground"><Plus className="mr-2 h-4 w-4" /> Halaman Baru</Button>
      } />

      {fetching && data.length === 0 ? <SkeletonCards count={3} /> : (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.map((p) => (
          <Card key={p.id} className="rounded-2xl border-0 shadow-soft">
            <CardContent className="p-5">
              <div className="mb-2 flex items-center justify-between">
                <Badge variant="outline">/{p.slug}</Badge>
                <Badge className={p.is_published ? "bg-success text-primary-foreground" : "bg-muted text-foreground"}>{p.is_published ? "Terbit" : "Draft"}</Badge>
              </div>
              <p className="font-bold">{p.title}</p>
              <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{p.content}</p>
              <div className="mt-3 flex gap-1">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => { setDraft({ ...p, gallery_urls: p.gallery_urls ?? [] }); setOpen(true); }}><Pencil className="mr-1 h-3.5 w-3.5" /> Edit</Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => confirm({ title: "Hapus Halaman", description: `Yakin ingin menghapus "${p.title}"?`, variant: "danger", confirmLabel: "Ya, hapus", onConfirm: async () => { await dbDelete("cms_pages", p.id); toast.success("Halaman berhasil dihapus"); refetch(); } })}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {data.length === 0 && <p className="col-span-full py-12 text-center text-muted-foreground">Belum ada halaman</p>}
      </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{draft.id ? "Edit" : "Buat"} Halaman</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Judul</Label><Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value, slug: draft.slug || slugify(e.target.value) })} /></div>
              <div className="space-y-1.5"><Label>Slug</Label><Input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: slugify(e.target.value) })} /></div>
            </div>
            <div className="space-y-1.5"><Label>Cover</Label>
              <div className="flex items-center gap-2">
                <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onCover(e.target.files[0])} />
                {draft.cover_url && <img src={draft.cover_url} alt="" className="h-10 w-16 rounded object-cover" />}
              </div>
            </div>
            <div className="space-y-1.5"><Label>Konten</Label><Textarea rows={8} value={draft.content ?? ""} onChange={(e) => setDraft({ ...draft, content: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>YouTube URL</Label><Input value={draft.youtube_url ?? ""} placeholder="https://youtube.com/..." onChange={(e) => setDraft({ ...draft, youtube_url: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Map Embed (iframe src)</Label><Input value={draft.map_embed ?? ""} onChange={(e) => setDraft({ ...draft, map_embed: e.target.value })} /></div>
            </div>
            <div className="space-y-1.5"><Label>Galeri</Label>
              <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onGallery(e.target.files[0])} />
              <div className="mt-2 flex flex-wrap gap-2">
                {(draft.gallery_urls ?? []).map((u: string) => (
                  <div key={u} className="relative">
                    <img src={u} alt="" className="h-16 w-24 rounded object-cover" />
                    <button onClick={() => removeGalleryUrl(u)} className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground"><X className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={draft.is_published} onCheckedChange={(v) => setDraft({ ...draft, is_published: v })} /><Label>Publikasikan</Label></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Batal</Button><ButtonLoading onClick={submit} loading={saving} loadingText="Menyimpan..." className="gradient-primary text-primary-foreground">Simpan</ButtonLoading></DialogFooter>
        </DialogContent>
      </Dialog>
      {dialogProps && <ConfirmDialog {...dialogProps} />}
    </div>
  );
}
