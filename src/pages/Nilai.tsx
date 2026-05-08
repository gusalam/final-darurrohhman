import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useMemo } from "react";
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

const JENIS = ["harian", "tugas", "uts", "uas"];
const empty = (unit: string) => ({ student_id: "", subject_id: "", jenis: "harian", nilai: 0, semester: "Ganjil", tahun_ajaran: "2025/2026", catatan: "", unit });

export default function Nilai() {
  const { role } = useAuth();
  const writable = canWriteUnit(role);
  const { unit, info } = useUnit();
  const { data, loading: fetching, refetch } = useSupabaseTable<any>("grades", { unit });
  const { data: students } = useSupabaseTable<any>("students", { unit });
  const { data: subjects } = useSupabaseTable<any>("subjects", { unit });
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<any>(empty(unit));
  const [saving, setSaving] = useState(false);
  const { confirm, dialogProps } = useConfirm();
  const [q, setQ] = useState("");
  const dq = useDebounce(q);
  const filtered = useMemo(() => {
    if (!dq) return data;
    const low = dq.toLowerCase();
    return data.filter((g: any) =>
      students.find((s: any) => s.id === g.student_id)?.nama?.toLowerCase().includes(low) ||
      subjects.find((s: any) => s.id === g.subject_id)?.nama?.toLowerCase().includes(low) || g.jenis?.toLowerCase().includes(low)
    );
  }, [data, dq, students, subjects]);

  const submit = async () => {
    if (!draft.student_id || !draft.subject_id) return toast.error("Pilih siswa & mapel");
    setSaving(true);
    const payload = { ...draft, unit, nilai: Number(draft.nilai) };
    try {
      if (draft.id) await dbUpdate("grades", draft.id, payload);
      else await dbInsert("grades", payload);
      toast.success("Data berhasil disimpan"); setOpen(false); refetch();
    } catch {} finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <PageHeader title={`Nilai ${info.short}`} subtitle={`${data.length} entri nilai`} action={
        writable ? <Button onClick={() => { setDraft(empty(unit)); setOpen(true); }} className="gradient-primary text-primary-foreground"><Plus className="mr-2 h-4 w-4" /> Tambah Nilai</Button> : undefined
      } />
      <SearchBar value={q} onChange={setQ} placeholder="Cari siswa, mapel, jenis..." className="max-w-sm" />
      {fetching && data.length === 0 ? <SkeletonTable rows={5} cols={5} /> : (
      <Card className="rounded-2xl border-0 shadow-soft">
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Siswa</TableHead><TableHead>Mapel</TableHead><TableHead>Jenis</TableHead><TableHead className="text-center">Nilai</TableHead><TableHead>Semester</TableHead>{writable && <TableHead className="text-right">Aksi</TableHead>}</TableRow></TableHeader>
            <TableBody>
              {filtered.map((g: any) => (
                <TableRow key={g.id}>
                  <TableCell className="font-semibold">{students.find(s => s.id === g.student_id)?.nama ?? "-"}</TableCell>
                  <TableCell>{subjects.find(s => s.id === g.subject_id)?.nama ?? "-"}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{g.jenis}</Badge></TableCell>
                  <TableCell className="text-center font-bold text-primary">{g.nilai}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{g.semester} {g.tahun_ajaran}</TableCell>
                  {writable && (
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => { setDraft(g); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => confirm({ title: "Hapus Nilai", description: "Yakin ingin menghapus data nilai ini?", variant: "danger", confirmLabel: "Ya, hapus", onConfirm: async () => { await dbDelete("grades", g.id); toast.success("Nilai berhasil dihapus"); refetch(); } })}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">{dq ? "Data tidak ditemukan" : "Belum ada nilai"}</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{draft.id ? "Edit" : "Tambah"} Nilai</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2"><Label>Siswa</Label>
              <Select value={draft.student_id} onValueChange={(v) => setDraft({ ...draft, student_id: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                <SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Mapel</Label>
              <Select value={draft.subject_id} onValueChange={(v) => setDraft({ ...draft, subject_id: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                <SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Jenis</Label>
              <Select value={draft.jenis} onValueChange={(v) => setDraft({ ...draft, jenis: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{JENIS.map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Nilai</Label><Input type="number" min={0} max={100} value={draft.nilai} onChange={(e) => setDraft({ ...draft, nilai: Number(e.target.value) })} /></div>
            <div className="space-y-1.5"><Label>Semester</Label><Input value={draft.semester ?? ""} onChange={(e) => setDraft({ ...draft, semester: e.target.value })} /></div>
            <div className="space-y-1.5 col-span-2"><Label>Tahun Ajaran</Label><Input value={draft.tahun_ajaran ?? ""} onChange={(e) => setDraft({ ...draft, tahun_ajaran: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Batal</Button><ButtonLoading onClick={submit} loading={saving} loadingText="Menyimpan..." className="gradient-primary text-primary-foreground">Simpan</ButtonLoading></DialogFooter>
        </DialogContent>
      </Dialog>
      {dialogProps && <ConfirmDialog {...dialogProps} />}
    </div>
  );
}
