import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { PageHeader } from "@/components/shared/StatCard";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ButtonLoading } from "@/components/shared/ButtonLoading";
import { SkeletonCards } from "@/components/shared/SkeletonTable";
import { DropZone } from "@/components/shared/DropZone";
import { useConfirm } from "@/hooks/useConfirm";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { useAuth } from "@/context/AuthContext";
import { dbInsert, dbUpdate, dbDelete } from "@/lib/db";
import { uploadFile } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, ChevronDown, FileText, Send, Save } from "lucide-react";
import { toast } from "sonner";

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const empty = () => ({ title: "", content: "", category: "berita", status: "draft", audience: "public", unit: "", cover_url: "" });

export default function CmsPosts() {
  const { user } = useAuth();
  const { data, loading: fetching, refetch } = useSupabaseTable<any>("cms_posts", { orderBy: { column: "created_at", ascending: false } });
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<any>(empty());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [advOpen, setAdvOpen] = useState(false);
  const { confirm, dialogProps } = useConfirm();

  const autoExcerpt = (text: string) => {
    if (!text) return "";
    const clean = text.replace(/\s+/g, " ").trim();
    return clean.length > 155 ? clean.slice(0, 152).trimEnd() + "..." : clean;
  };
  const autoTitle = (t: string) => (t.length > 60 ? t.slice(0, 57).trimEnd() + "..." : t);

  const save = async (publish?: boolean) => {
    if (!draft.title?.trim()) return toast.error("Judul wajib diisi");
    setSaving(true);
    const title = draft.title.trim();
    const payload: any = {
      ...draft,
      title: autoTitle(title),
      slug: draft.slug?.trim() ? slugify(draft.slug) : slugify(title),
      excerpt: draft.excerpt?.trim() ? draft.excerpt.trim() : autoExcerpt(draft.content || ""),
      unit: draft.unit || null,
      status: publish === undefined ? draft.status : publish ? "published" : "draft",
      author_id: draft.author_id ?? user?.id ?? null,
    };
    try {
      if (draft.id) await dbUpdate("cms_posts", draft.id, payload);
      else await dbInsert("cms_posts", payload);
      toast.success(publish ? "Konten dipublikasikan" : "Draft tersimpan");
      setOpen(false); refetch();
    } catch (e: any) { toast.error(e?.message ?? "Gagal menyimpan"); }
    finally { setSaving(false); }
  };

  const onUpload = async (f: File) => {
    setUploading(true);
    try {
      const { publicUrl } = await uploadFile("cms-media", f, "covers");
      setDraft((d: any) => ({ ...d, cover_url: publicUrl }));
      toast.success("Cover terupload");
    } catch (e: any) { toast.error(e?.message ?? "Upload gagal"); }
    finally { setUploading(false); }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Konten & Berita" subtitle={`${data.length} konten`} action={
        <Button onClick={() => { setDraft(empty()); setAdvOpen(false); setOpen(true); }} className="gradient-primary text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" /> Buat Post
        </Button>
      } />

      {fetching && data.length === 0 ? <SkeletonCards count={3} /> : data.length === 0 ? (
        <Card className="rounded-2xl border-0 shadow-soft">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50" />
            <p className="font-semibold">Belum ada konten</p>
            <Button onClick={() => { setDraft(empty()); setOpen(true); }} className="gradient-primary text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" /> Buat Post Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((p) => (
            <Card key={p.id} className="overflow-hidden rounded-2xl border-0 shadow-soft transition hover:shadow-md-soft">
              <div className="aspect-video bg-muted">
                {p.cover_url ? <img src={p.cover_url} alt={p.title} className="h-full w-full object-cover" /> :
                  <div className="flex h-full items-center justify-center text-muted-foreground"><FileText className="h-8 w-8 opacity-40" /></div>}
              </div>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{p.category ?? "-"}</Badge>
                  <Badge className={`text-xs ${p.status === "published" ? "bg-success text-primary-foreground" : "bg-muted text-foreground"}`}>
                    {p.status === "published" ? "Tayang" : "Draft"}
                  </Badge>
                </div>
                <h3 className="line-clamp-2 font-semibold leading-snug">{p.title}</h3>
                {p.excerpt && <p className="line-clamp-2 text-xs text-muted-foreground">{p.excerpt}</p>}
                <div className="flex gap-1 pt-1">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => { setDraft(p); setOpen(true); }}>
                    <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => confirm({
                    title: "Hapus Konten", description: `Yakin ingin menghapus "${p.title}"?`, variant: "danger", confirmLabel: "Ya, hapus",
                    onConfirm: async () => { await dbDelete("cms_posts", p.id); toast.success("Konten dihapus"); refetch(); }
                  })}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display text-xl">{draft.id ? "Edit Konten" : "Buat Post Baru"}</DialogTitle></DialogHeader>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Judul</Label>
              <Input
                placeholder="Tulis judul yang menarik..."
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                className="h-12 text-lg font-semibold"
              />
              <p className="text-[11px] text-muted-foreground">
                Slug & meta description akan dibuat otomatis dari judul/konten jika dikosongkan.
                {draft.title && <> Slug: <code className="rounded bg-muted px-1">{slugify(draft.title)}</code></>}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Gambar Cover</Label>
              <DropZone
                value={draft.cover_url}
                uploading={uploading}
                onFile={onUpload}
                onClear={() => setDraft({ ...draft, cover_url: "" })}
                height="h-52"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Konten</Label>
              <Textarea
                rows={10}
                placeholder="Tulis isi konten di sini..."
                value={draft.content ?? ""}
                onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                className="resize-y text-base leading-relaxed"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Kategori</Label>
              <Select value={draft.category} onValueChange={(v) => setDraft({ ...draft, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="berita">📰 Berita</SelectItem>
                  <SelectItem value="pengumuman">📢 Pengumuman</SelectItem>
                  <SelectItem value="artikel">📝 Artikel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Collapsible open={advOpen} onOpenChange={setAdvOpen}>
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm font-medium hover:bg-muted/50">
                <span>Pengaturan Lanjutan (opsional)</span>
                <ChevronDown className={`h-4 w-4 transition ${advOpen ? "rotate-180" : ""}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-3">
                <div className="space-y-2">
                  <Label className="text-xs">Ringkasan</Label>
                  <Textarea rows={2} placeholder="Ringkasan singkat (opsional)" value={draft.excerpt ?? ""} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Unit</Label>
                    <Select value={draft.unit || "all"} onValueChange={(v) => setDraft({ ...draft, unit: v === "all" ? "" : v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Unit</SelectItem>
                        <SelectItem value="mi">MI</SelectItem>
                        <SelectItem value="smp">SMP</SelectItem>
                        <SelectItem value="smk">SMK</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Audience</Label>
                    <Select value={draft.audience} onValueChange={(v) => setDraft({ ...draft, audience: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Publik</SelectItem>
                        <SelectItem value="internal">Internal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={saving}>Batal</Button>
            <ButtonLoading onClick={() => save(false)} loading={saving} loadingText="Menyimpan..." variant="outline">
              <Save className="mr-2 h-4 w-4" /> Simpan Draft
            </ButtonLoading>
            <ButtonLoading onClick={() => save(true)} loading={saving} loadingText="Mempublikasikan..." className="gradient-primary text-primary-foreground">
              <Send className="mr-2 h-4 w-4" /> Publish
            </ButtonLoading>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {dialogProps && <ConfirmDialog {...dialogProps} />}
    </div>
  );
}
