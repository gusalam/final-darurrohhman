import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/StatCard";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ButtonLoading } from "@/components/shared/ButtonLoading";
import { SkeletonCards } from "@/components/shared/SkeletonTable";
import { DropZone } from "@/components/shared/DropZone";
import { useConfirm } from "@/hooks/useConfirm";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { dbInsert, dbUpdate, dbDelete } from "@/lib/db";
import { uploadFile } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, ImageIcon } from "lucide-react";
import { toast } from "sonner";

const empty = () => ({ title: "", subtitle: "", image_url: "", cta_label: "", cta_url: "", is_active: true, sort_order: 0 });

export default function CmsBanners() {
  const { data, loading: fetching, refetch } = useSupabaseTable<any>("cms_banners", { orderBy: { column: "sort_order", ascending: true } });
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<any>(empty());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { confirm, dialogProps } = useConfirm();

  const submit = async () => {
    if (!draft.image_url) return toast.error("Gambar banner wajib diupload");
    setSaving(true);
    const payload = { ...draft, title: draft.title?.trim() || "Banner" };
    try {
      if (draft.id) await dbUpdate("cms_banners", draft.id, payload);
      else await dbInsert("cms_banners", payload);
      toast.success("Banner tersimpan"); setOpen(false); refetch();
    } catch (e: any) { toast.error(e?.message ?? "Gagal menyimpan"); }
    finally { setSaving(false); }
  };

  const onUpload = async (f: File) => {
    setUploading(true);
    try {
      const { publicUrl } = await uploadFile("hero", f);
      setDraft((d: any) => ({ ...d, image_url: publicUrl }));
      toast.success("Gambar terupload");
    } catch (e: any) { toast.error(e?.message ?? "Upload gagal"); }
    finally { setUploading(false); }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Banner Hero" subtitle="Gambar utama di halaman publik" action={
        <Button onClick={() => { setDraft(empty()); setOpen(true); }} className="gradient-primary text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" /> Banner Baru
        </Button>
      } />

      {fetching && data.length === 0 ? <SkeletonCards count={2} /> : data.length === 0 ? (
        <Card className="rounded-2xl border-0 shadow-soft">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
            <p className="font-semibold">Belum ada banner</p>
            <Button onClick={() => { setDraft(empty()); setOpen(true); }} className="gradient-primary text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" /> Tambah Banner
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((b) => (
            <Card key={b.id} className={`overflow-hidden rounded-2xl border-0 shadow-soft transition ${b.is_active ? "" : "opacity-60"}`}>
              <div className="relative h-44 bg-muted">
                {b.image_url ? <img src={b.image_url} alt={b.title} className="h-full w-full object-cover" /> :
                  <div className="flex h-full items-center justify-center text-muted-foreground text-sm">Tanpa gambar</div>}
              </div>
              <CardContent className="space-y-2 p-4">
                {b.title && <p className="font-bold">{b.title}</p>}
                {b.subtitle && <p className="text-xs text-muted-foreground">{b.subtitle}</p>}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Switch checked={b.is_active} onCheckedChange={async (v) => { await dbUpdate("cms_banners", b.id, { is_active: v }); refetch(); }} />
                    <span className="text-xs font-medium">{b.is_active ? "Aktif" : "Nonaktif"}</span>
                  </div>
                  <div>
                    <Button size="icon" variant="ghost" onClick={() => { setDraft(b); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive" onClick={() => confirm({
                      title: "Hapus Banner", description: `Yakin ingin menghapus banner ini?`, variant: "danger", confirmLabel: "Ya, hapus",
                      onConfirm: async () => { await dbDelete("cms_banners", b.id); toast.success("Banner dihapus"); refetch(); }
                    })}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-display text-xl">{draft.id ? "Edit Banner" : "Banner Baru"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Gambar Banner</Label>
              <DropZone value={draft.image_url} uploading={uploading} onFile={onUpload} onClear={() => setDraft({ ...draft, image_url: "" })} height="h-52" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Judul (opsional)</Label>
              <Input placeholder="Judul yang tampil di banner" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Subjudul (opsional)</Label>
              <Input placeholder="Deskripsi singkat" value={draft.subtitle ?? ""} onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })} />
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
              <Switch checked={draft.is_active} onCheckedChange={(v) => setDraft({ ...draft, is_active: v })} />
              <Label className="cursor-pointer">Tampilkan banner ini di homepage</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={saving}>Batal</Button>
            <ButtonLoading onClick={submit} loading={saving || uploading} loadingText={uploading ? "Mengupload..." : "Menyimpan..."} className="gradient-primary text-primary-foreground">Simpan</ButtonLoading>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {dialogProps && <ConfirmDialog {...dialogProps} />}
    </div>
  );
}
