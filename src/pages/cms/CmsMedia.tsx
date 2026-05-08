import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/StatCard";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { SearchBar } from "@/components/shared/SearchBar";
import { DropZone } from "@/components/shared/DropZone";
import { useConfirm } from "@/hooks/useConfirm";
import { supabase } from "@/integrations/supabase/client";
import { uploadFile, listFiles, deleteFile, getStoragePath, Bucket } from "@/lib/storage";
import { useDebounce } from "@/hooks/useDebounce";
import { Trash2, Copy, ImageIcon, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TABS: { key: "all" | Bucket; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "cms-media", label: "Konten" },
  { key: "hero", label: "Hero" },
  { key: "galeri", label: "Galeri" },
];

interface MediaItem { name: string; path: string; publicUrl: string; bucket: Bucket; }

const MEDIA_TABLES = ["media", "cms_media", "media_library"];

const errorMessage = (error: unknown) => error instanceof Error ? error.message : "Terjadi kesalahan";

type DeleteResult = { error: { code?: string; message: string } | null };
type DeleteFilter = { eq: (column: string, value: string) => Promise<DeleteResult> };
type DeleteBuilder = { eq: (column: string, value: string) => DeleteFilter };
const dynamicSupabase = supabase as unknown as { from: (table: string) => { delete: () => DeleteBuilder } };

export default function CmsMedia() {
  const [tab, setTab] = useState<"all" | Bucket>("all");
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [q, setQ] = useState("");
  const dq = useDebounce(q, 300);
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const { confirm, dialogProps } = useConfirm();

  const buckets: Bucket[] = ["cms-media", "hero", "galeri"];

  const refresh = async () => {
    setLoading(true);
    try {
      const all: MediaItem[] = [];
      for (const b of buckets) {
        const files = await listFiles(b);
        files.forEach((f) => all.push({ ...f, bucket: b }));
      }
      setItems(all);
    } catch (e) { toast.error(errorMessage(e)); }
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const filtered = useMemo(() => {
    return items.filter((f) => {
      if (tab !== "all" && f.bucket !== tab) return false;
      if (dq && !f.name.toLowerCase().includes(dq.toLowerCase())) return false;
      return true;
    });
  }, [items, tab, dq]);

  const targetBucket: Bucket = tab === "all" ? "cms-media" : tab;

  const onUpload = async (f: File) => {
    setUploading(true);
    try { await uploadFile(targetBucket, f); toast.success("Upload sukses"); refresh(); }
    catch (e) { toast.error(errorMessage(e)); }
    finally { setUploading(false); }
  };

  const deleteMediaRecord = async (item: MediaItem) => {
    const storagePath = getStoragePath(item.bucket, item.path);
    const results = await Promise.all(MEDIA_TABLES.map((table) =>
      dynamicSupabase.from(table).delete().eq("bucket", item.bucket).eq("storage_path", storagePath),
    ));
    const error = results.find((result) => result.error && !["42P01", "42703"].includes(result.error.code))?.error;
    if (error) throw error;
  };

  const remove = (item: MediaItem) => {
    confirm({
      title: "Hapus File", description: `Yakin ingin menghapus "${item.name}"?`, variant: "danger", confirmLabel: "Ya, hapus",
      onConfirm: async () => {
        await deleteFile(item.bucket, item.path);
        await deleteMediaRecord(item);
        setItems((current) => current.filter((f) => !(f.bucket === item.bucket && f.path === item.path)));
        setPreview(null);
        toast.success("File dihapus");
        await refresh();
      }
    });
  };

  const copy = (url: string) => { navigator.clipboard.writeText(url); toast.success("URL disalin"); };

  return (
    <div className="space-y-6">
      <PageHeader title="Media Library" subtitle={`${items.length} file tersimpan`} />

      <DropZone
        onFile={onUpload}
        uploading={uploading}
        label={`Tarik & lepas gambar untuk diupload ke "${tab === "all" ? "Konten" : TABS.find(t => t.key === tab)?.label}"`}
        height="h-32"
      />

      <Card className="rounded-2xl border-0 shadow-soft">
        <CardContent className="space-y-3 p-3">
          <SearchBar value={q} onChange={setQ} placeholder="Cari nama file..." />
          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-semibold transition",
                  tab === t.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70",
                )}
              >
                {t.label} {t.key === "all" ? items.length : items.filter(i => i.bucket === t.key).length}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <Card className="rounded-2xl border-0 shadow-soft">
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">{q ? "Tidak ditemukan" : "Belum ada file"}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((f) => (
            <Card key={`${f.bucket}/${f.path}`} className="group relative cursor-pointer overflow-hidden rounded-xl border-0 shadow-soft" onClick={() => setPreview(f)}>
              <div className="aspect-square bg-muted">
                <img src={f.publicUrl} alt={f.name} className="h-full w-full object-cover transition group-hover:scale-105" />
              </div>
              <div className="absolute right-1.5 top-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                {f.bucket === "cms-media" ? "konten" : f.bucket}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-3xl">
          {preview && (
            <>
              <div className="overflow-hidden rounded-lg bg-muted">
                <img src={preview.publicUrl} alt={preview.name} className="h-auto max-h-[60vh] w-full object-contain" />
              </div>
              <div className="space-y-1 text-xs">
                <p className="truncate font-medium">{preview.name}</p>
                <p className="truncate text-muted-foreground">{preview.publicUrl}</p>
              </div>
              <DialogFooter className="gap-2 sm:gap-2">
                <Button variant="outline" onClick={() => copy(preview.publicUrl)}>
                  <Copy className="mr-2 h-4 w-4" /> Copy URL
                </Button>
                <Button variant="outline" onClick={() => { copy(preview.publicUrl); toast.success("Siap digunakan"); }}>
                  <Check className="mr-2 h-4 w-4" /> Gunakan
                </Button>
                <Button variant="destructive" onClick={() => remove(preview)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Hapus
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      {dialogProps && <ConfirmDialog {...dialogProps} />}
    </div>
  );
}
