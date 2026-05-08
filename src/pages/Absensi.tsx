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
import { PageHeader, StatCard } from "@/components/shared/StatCard";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ButtonLoading } from "@/components/shared/ButtonLoading";
import { SkeletonTable, SkeletonCards } from "@/components/shared/SkeletonTable";
import { useConfirm } from "@/hooks/useConfirm";
import { useUnit } from "@/context/UnitContext";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { dbInsert, dbUpdate, dbDelete } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, CheckCircle2, AlertCircle, Heart, XCircle } from "lucide-react";
import { toast } from "sonner";
import { SearchBar } from "@/components/shared/SearchBar";
import { useDebounce } from "@/hooks/useDebounce";

const STATUSES = ["hadir", "izin", "sakit", "alpha"] as const;
const empty = (unit: string) => ({ student_id: "", tanggal: new Date().toISOString().slice(0, 10), status: "hadir", catatan: "", unit });

export default function Absensi() {
  const { role } = useAuth();
  const writable = canWriteUnit(role);
  const { unit, info } = useUnit();
  const { data, loading: fetching, refetch } = useSupabaseTable<any>("attendance", { unit });
  const { data: students } = useSupabaseTable<any>("students", { unit });
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<any>(empty(unit));
  const [saving, setSaving] = useState(false);
  const { confirm, dialogProps } = useConfirm();
  const [q, setQ] = useState("");
  const dq = useDebounce(q);
  const filtered = useMemo(() => {
    if (!dq) return data;
    const low = dq.toLowerCase();
    return data.filter((a: any) =>
      students.find((s: any) => s.id === a.student_id)?.nama?.toLowerCase().includes(low) ||
      a.status?.toLowerCase().includes(low) || a.tanggal?.includes(low)
    );
  }, [data, dq, students]);

  const stat = (s: string) => data.filter((x) => x.status === s).length;
  const submit = async () => {
    if (!draft.student_id) return toast.error("Pilih siswa");
    setSaving(true);
    const payload = { ...draft, unit };
    try {
      if (draft.id) await dbUpdate("attendance", draft.id, payload);
      else await dbInsert("attendance", payload);
      toast.success("Data berhasil disimpan"); setOpen(false); refetch();
    } catch {} finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <PageHeader title={`Absensi ${info.short}`} subtitle={`${data.length} catatan`} action={
        writable ? <Button onClick={() => { setDraft(empty(unit)); setOpen(true); }} className="gradient-primary text-primary-foreground"><Plus className="mr-2 h-4 w-4" /> Catat Kehadiran</Button> : undefined
      } />
      <SearchBar value={q} onChange={setQ} placeholder="Cari nama siswa, status..." className="max-w-sm" />

      {fetching && data.length === 0 ? <><SkeletonCards count={4} /><SkeletonTable rows={5} cols={4} /></> : (<>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Hadir" value={stat("hadir")} icon={CheckCircle2} variant="primary" />
        <StatCard label="Izin" value={stat("izin")} icon={AlertCircle} variant="accent" />
        <StatCard label="Sakit" value={stat("sakit")} icon={Heart} variant="secondary" />
        <StatCard label="Alpha" value={stat("alpha")} icon={XCircle} />
      </div>

      <Card className="rounded-2xl border-0 shadow-soft">
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Tanggal</TableHead><TableHead>Siswa</TableHead><TableHead>Status</TableHead><TableHead>Catatan</TableHead>{writable && <TableHead className="text-right">Aksi</TableHead>}</TableRow></TableHeader>
            <TableBody>
              {filtered.map((a: any) => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-xs">{a.tanggal}</TableCell>
                  <TableCell className="font-semibold">{students.find(s => s.id === a.student_id)?.nama ?? "-"}</TableCell>
                  <TableCell><Badge className={a.status === "hadir" ? "bg-success text-primary-foreground" : a.status === "izin" ? "bg-accent text-accent-foreground" : a.status === "sakit" ? "bg-warning text-secondary-foreground" : "bg-destructive text-destructive-foreground"}>{a.status}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{a.catatan ?? "-"}</TableCell>
                  {writable && (
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => { setDraft(a); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => confirm({ title: "Hapus Absensi", description: "Yakin ingin menghapus data absensi ini?", variant: "danger", confirmLabel: "Ya, hapus", onConfirm: async () => { await dbDelete("attendance", a.id); toast.success("Absensi berhasil dihapus"); refetch(); } })}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">{dq ? "Data tidak ditemukan" : "Belum ada absensi"}</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </>)}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{draft.id ? "Edit" : "Catat"} Absensi</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Siswa</Label>
              <Select value={draft.student_id} onValueChange={(v) => setDraft({ ...draft, student_id: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih siswa" /></SelectTrigger>
                <SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Tanggal</Label><Input type="date" value={draft.tanggal} onChange={(e) => setDraft({ ...draft, tanggal: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Status</Label>
                <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5"><Label>Catatan</Label><Input value={draft.catatan ?? ""} onChange={(e) => setDraft({ ...draft, catatan: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Batal</Button><ButtonLoading onClick={submit} loading={saving} loadingText="Menyimpan..." className="gradient-primary text-primary-foreground">Simpan</ButtonLoading></DialogFooter>
        </DialogContent>
      </Dialog>
      {dialogProps && <ConfirmDialog {...dialogProps} />}
    </div>
  );
}
