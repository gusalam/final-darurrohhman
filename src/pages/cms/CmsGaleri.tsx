import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/StatCard";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DropZone } from "@/components/shared/DropZone";
import { useConfirm } from "@/hooks/useConfirm";
import { uploadFile, listFiles, deleteFile } from "@/lib/storage";
import { Trash2, Copy, ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function CmsGaleri() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [preview, setPreview] = useState<string | null>(null);
  const { confirm, dialogProps } = useConfirm();

  const refresh = async () => {
    setLoading(true);
    try { setFiles(await listFiles("galeri")); }
    catch (e: any) { toast.error(e.message); }
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const onMulti = async (selected: File[]) => {
    setUploading(true);
    setProgress({ done: 0, total: selected.length });
    let ok = 0;
    for (const f of selected) {
      try { await uploadFile("galeri", f); ok++; }
      catch (e: any) { toast.error(`${f.name}: ${e.message}`); }
      setProgress((p) => ({ ...p, done: p.done + 1 }));
    }
    setUploading(false);
    setProgress({ done: 0, total: 0 });
    if (ok) toast.success(`${ok} foto terupload`);
    refresh();
  };

  const remove = (path: string, name: string) => {
    confirm({
      title: "Hapus Foto", description: `Yakin ingin menghapus "${name}"?`, variant: "danger", confirmLabel: "Ya, hapus",
      onConfirm: async () => { await deleteFile("galeri", path); toast.success("Foto dihapus"); refresh(); }
    });
  };

  const copy = (url: string) => { navigator.clipboard.writeText(url); toast.success("URL disalin"); };

  return (
    <div className="space-y-6">
      <PageHeader title="Galeri Foto" subtitle={`${files.length} foto`} />

      <DropZone
        multiple
        onFile={async (f) => onMulti([f])}
        onFiles={onMulti}
        uploading={uploading}
        label="Tarik & lepas beberapa foto sekaligus, atau klik untuk pilih"
        height="h-40"
      />

      {uploading && progress.total > 0 && (
        <Card className="rounded-xl border-0 shadow-soft">
          <CardContent className="flex items-center gap-3 p-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">Mengupload... ({progress.done}/{progress.total})</p>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary transition-all" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && files.length === 0 ? (
        <Card className="rounded-2xl border-0 shadow-soft">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Belum ada foto di galeri</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {files.map((f) => (
            <Card key={f.path} className="group relative overflow-hidden rounded-xl border-0 shadow-soft">
              <div className="aspect-square cursor-pointer bg-muted" onClick={() => setPreview(f.publicUrl)}>
                <img src={f.publicUrl} alt={f.name} className="h-full w-full object-cover transition group-hover:scale-105" />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                <Button size="sm" variant="secondary" className="h-7 flex-1 text-xs" onClick={() => copy(f.publicUrl)}>
                  <Copy className="mr-1 h-3 w-3" /> Salin
                </Button>
                <Button size="icon" variant="destructive" className="h-7 w-7" onClick={() => remove(f.path, f.name)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-3xl p-2">
          {preview && <img src={preview} alt="preview" className="h-auto w-full rounded-lg object-contain" />}
        </DialogContent>
      </Dialog>
      {dialogProps && <ConfirmDialog {...dialogProps} />}
    </div>
  );
}
