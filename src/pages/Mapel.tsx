import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useMemo } from "react";
import { canWriteUnit } from "@/lib/units";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const empty = (unit: string) => ({ nama: "", kode: "", guru_id: null as string | null, unit });

export default function Mapel() {
  const { role } = useAuth();
  const writable = canWriteUnit(role);
  const { unit, info } = useUnit();
  const { data, loading: fetching, refetch } = useSupabaseTable<any>("subjects", { unit });
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
    return data.filter((m: any) => m.nama?.toLowerCase().includes(low) || m.kode?.toLowerCase().includes(low) || teachers.find((t: any) => t.id === m.guru_id)?.nama?.toLowerCase().includes(low));
  }, [data, dq, teachers]);

  const submit = async () => {
    if (!draft.nama?.trim()) return toast.error("Nama wajib diisi");
    setSaving(true);
    const payload = { ...draft, unit, guru_id: draft.guru_id || null };
    try {
      if (draft.id) await dbUpdate("subjects", draft.id, payload);
      else await dbInsert("subjects", payload);
      toast.success("Data berhasil disimpan"); setOpen(false); refetch();
    } catch {} finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <PageHeader title={`Mata Pelajaran ${info.short}`} subtitle={`${data.length} mapel`} action={
        writable ? <Button onClick={() => { setDraft(empty(unit)); setOpen(true); }} className="gradient-primary text-primary-foreground"><Plus className="mr-2 h-4 w-4" /> Tambah Mapel</Button> : undefined
      } />
      <SearchBar value={q} onChange={setQ} placeholder="Cari nama, kode mapel..." className="max-w-sm" />
      {fetching && data.length === 0 ? <SkeletonTable rows={4} cols={3} /> : (
      <Card className="rounded-2xl border-0 shadow-soft">
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Kode</TableHead><TableHead>Nama</TableHead><TableHead>Guru Pengampu</TableHead>{writable && <TableHead className="text-right">Aksi</TableHead>}</TableRow></TableHeader>
            <TableBody>
              {filtered.map((m: any) => (
                <TableRow key={m.id}>
                  <TableCell className="font-mono text-xs">{m.kode ?? "-"}</TableCell>
                  <TableCell className="font-semibold">{m.nama}</TableCell>
                  <TableCell className="text-muted-foreground">{teachers.find((t) => t.id === m.guru_id)?.nama ?? "-"}</TableCell>
                  {writable && (
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => { setDraft(m); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => confirm({ title: "Hapus Mapel", description: `Yakin ingin menghapus "${m.nama}"?`, variant: "danger", confirmLabel: "Ya, hapus", onConfirm: async () => { await dbDelete("subjects", m.id); toast.success("Mapel berhasil dihapus"); refetch(); } })}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">{dq ? "Data tidak ditemukan" : "Belum ada mapel"}</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{draft.id ? "Edit" : "Tambah"} Mapel</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Kode</Label><Input value={draft.kode ?? ""} onChange={(e) => setDraft({ ...draft, kode: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Nama</Label><Input value={draft.nama ?? ""} onChange={(e) => setDraft({ ...draft, nama: e.target.value })} /></div>
            </div>
            <div className="space-y-1.5"><Label>Guru Pengampu</Label>
              <Select value={draft.guru_id ?? "none"} onValueChange={(v) => setDraft({ ...draft, guru_id: v === "none" ? null : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
