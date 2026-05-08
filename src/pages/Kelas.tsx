import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { canWriteUnit } from "@/lib/units";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/StatCard";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ButtonLoading } from "@/components/shared/ButtonLoading";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { useConfirm } from "@/hooks/useConfirm";
import { useUnit } from "@/context/UnitContext";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { dbInsert, dbUpdate, dbDelete } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SearchBar } from "@/components/shared/SearchBar";
import { useDebounce } from "@/hooks/useDebounce";

const empty = (unit: string) => ({ nama: "", tingkat: "", tahun_ajaran: "", wali_kelas_id: null as string | null, unit });

export default function Kelas() {
  const { role } = useAuth();
  const writable = canWriteUnit(role);
  const { unit, info } = useUnit();
  const { data, loading: fetching, refetch } = useSupabaseTable<any>("classes", { unit });
  const { data: teachers } = useSupabaseTable<any>("teachers", { unit });
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<any>(empty(unit));
  const [saving, setSaving] = useState(false);
  const { confirm, dialogProps } = useConfirm();
  const [q, setQ] = useState("");
  const dq = useDebounce(q);
  const filtered = useMemo(() => {
    if (!dq) return data;
    const low = dq.toLowerCase();
    return data.filter((c: any) => c.nama?.toLowerCase().includes(low) || c.tingkat?.toLowerCase().includes(low) || teachers.find((t: any) => t.id === c.wali_kelas_id)?.nama?.toLowerCase().includes(low));
  }, [data, dq, teachers]);

  const submit = async () => {
    if (!draft.nama?.trim()) return toast.error("Nama wajib diisi");
    setSaving(true);
    try {
      const payload = { ...draft, unit, wali_kelas_id: draft.wali_kelas_id || null };
      if (draft.id) await dbUpdate("classes", draft.id, payload);
      else await dbInsert("classes", payload);
      toast.success("Data berhasil disimpan"); setOpen(false); refetch();
    } catch {} finally { setSaving(false); }
  };
  const remove = (c: any) => {
    confirm({ title: "Hapus Kelas", description: `Yakin ingin menghapus kelas "${c.nama}"?`, variant: "danger", confirmLabel: "Ya, hapus",
      onConfirm: async () => { await dbDelete("classes", c.id); toast.success("Kelas berhasil dihapus"); refetch(); } });
  };

  return (
    <div className="space-y-6">
      <PageHeader title={`Kelas ${info.short}`} subtitle={`${data.length} kelas`} action={
        writable ? <Button onClick={() => { setDraft(empty(unit)); setOpen(true); }} className="gradient-primary text-primary-foreground"><Plus className="mr-2 h-4 w-4" /> Tambah Kelas</Button> : undefined
      } />
      <SearchBar value={q} onChange={setQ} placeholder="Cari nama kelas, tingkat..." className="max-w-sm" />
      {fetching && data.length === 0 ? <SkeletonTable rows={4} cols={4} /> : (
      <Card className="rounded-2xl border-0 shadow-soft">
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Nama</TableHead><TableHead>Tingkat</TableHead><TableHead>Tahun Ajaran</TableHead><TableHead>Wali Kelas</TableHead>{writable && <TableHead className="text-right">Aksi</TableHead>}</TableRow></TableHeader>
            <TableBody>
              {filtered.map((c: any) => (
                <TableRow key={c.id}>
                  <TableCell className="font-semibold">{c.nama}</TableCell>
                  <TableCell><Badge variant="outline">{c.tingkat ?? "-"}</Badge></TableCell>
                  <TableCell>{c.tahun_ajaran ?? "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{teachers.find((t) => t.id === c.wali_kelas_id)?.nama ?? "-"}</TableCell>
                  {writable && (
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => { setDraft(c); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(c)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">{dq ? "Data tidak ditemukan" : "Belum ada kelas"}</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{draft.id ? "Edit" : "Tambah"} Kelas</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Nama Kelas</Label><Input value={draft.nama ?? ""} onChange={(e) => setDraft({ ...draft, nama: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Tingkat</Label><Input value={draft.tingkat ?? ""} onChange={(e) => setDraft({ ...draft, tingkat: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Tahun Ajaran</Label><Input value={draft.tahun_ajaran ?? ""} placeholder="2025/2026" onChange={(e) => setDraft({ ...draft, tahun_ajaran: e.target.value })} /></div>
            </div>
            <div className="space-y-1.5"><Label>Wali Kelas</Label>
              <Select value={draft.wali_kelas_id ?? "none"} onValueChange={(v) => setDraft({ ...draft, wali_kelas_id: v === "none" ? null : v })}>
                <SelectTrigger><SelectValue placeholder="Pilih guru" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">- Tidak ada -</SelectItem>
                  {teachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.nama}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Batal</Button><ButtonLoading onClick={submit} loading={saving} loadingText="Menyimpan..." className="gradient-primary text-primary-foreground">Simpan</ButtonLoading></DialogFooter>
        </DialogContent>
      </Dialog>
      {dialogProps && <ConfirmDialog {...dialogProps} />}
    </div>
  );
}
