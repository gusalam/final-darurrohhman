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

const HARI = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const empty = (unit: string) => ({ hari: "Senin", jam_mulai: "07:00", jam_selesai: "08:30", ruangan: "", subject_id: "", kelas_id: "", guru_id: null as string | null, unit });

export default function Jadwal() {
  const { role } = useAuth();
  const writable = canWriteUnit(role);
  const { unit, info } = useUnit();
  const { data, loading: fetching, refetch } = useSupabaseTable<any>("schedules", { unit });
  const { data: subjects } = useSupabaseTable<any>("subjects", { unit });
  const { data: classes } = useSupabaseTable<any>("classes", { unit });
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
    return data.filter((s: any) =>
      s.hari?.toLowerCase().includes(low) || subjects.find((x: any) => x.id === s.subject_id)?.nama?.toLowerCase().includes(low) ||
      classes.find((x: any) => x.id === s.kelas_id)?.nama?.toLowerCase().includes(low) || teachers.find((x: any) => x.id === s.guru_id)?.nama?.toLowerCase().includes(low) ||
      s.ruangan?.toLowerCase().includes(low)
    );
  }, [data, dq, subjects, classes, teachers]);

  const submit = async () => {
    if (!draft.subject_id || !draft.kelas_id) return toast.error("Mapel & kelas wajib");
    setSaving(true);
    const payload = { ...draft, unit, guru_id: draft.guru_id || null };
    try {
      if (draft.id) await dbUpdate("schedules", draft.id, payload);
      else await dbInsert("schedules", payload);
      toast.success("Data berhasil disimpan"); setOpen(false); refetch();
    } catch {} finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <PageHeader title={`Jadwal ${info.short}`} subtitle={`${data.length} jadwal`} action={
        writable ? <Button onClick={() => { setDraft(empty(unit)); setOpen(true); }} className="gradient-primary text-primary-foreground"><Plus className="mr-2 h-4 w-4" /> Tambah Jadwal</Button> : undefined
      } />
      <SearchBar value={q} onChange={setQ} placeholder="Cari hari, mapel, kelas, guru..." className="max-w-sm" />
      {fetching && data.length === 0 ? <SkeletonTable rows={5} cols={6} /> : (
      <Card className="rounded-2xl border-0 shadow-soft">
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Hari</TableHead><TableHead>Jam</TableHead><TableHead>Mapel</TableHead><TableHead>Kelas</TableHead><TableHead>Guru</TableHead><TableHead>Ruang</TableHead>{writable && <TableHead className="text-right">Aksi</TableHead>}</TableRow></TableHeader>
            <TableBody>
              {filtered.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell><Badge>{s.hari}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{s.jam_mulai?.slice(0,5)} - {s.jam_selesai?.slice(0,5)}</TableCell>
                  <TableCell className="font-semibold">{subjects.find(x => x.id === s.subject_id)?.nama ?? "-"}</TableCell>
                  <TableCell>{classes.find(x => x.id === s.kelas_id)?.nama ?? "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{teachers.find(x => x.id === s.guru_id)?.nama ?? "-"}</TableCell>
                  <TableCell>{s.ruangan ?? "-"}</TableCell>
                  {writable && (
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => { setDraft(s); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => confirm({ title: "Hapus Jadwal", description: "Yakin ingin menghapus jadwal ini?", variant: "danger", confirmLabel: "Ya, hapus", onConfirm: async () => { await dbDelete("schedules", s.id); toast.success("Jadwal berhasil dihapus"); refetch(); } })}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">{dq ? "Data tidak ditemukan" : "Belum ada jadwal"}</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{draft.id ? "Edit" : "Tambah"} Jadwal</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Hari</Label>
              <Select value={draft.hari} onValueChange={(v) => setDraft({ ...draft, hari: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{HARI.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Ruang</Label><Input value={draft.ruangan ?? ""} onChange={(e) => setDraft({ ...draft, ruangan: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Jam Mulai</Label><Input type="time" value={draft.jam_mulai ?? ""} onChange={(e) => setDraft({ ...draft, jam_mulai: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Jam Selesai</Label><Input type="time" value={draft.jam_selesai ?? ""} onChange={(e) => setDraft({ ...draft, jam_selesai: e.target.value })} /></div>
            <div className="space-y-1.5 col-span-2"><Label>Mapel</Label>
              <Select value={draft.subject_id} onValueChange={(v) => setDraft({ ...draft, subject_id: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih mapel" /></SelectTrigger>
                <SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Kelas</Label>
              <Select value={draft.kelas_id} onValueChange={(v) => setDraft({ ...draft, kelas_id: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih kelas" /></SelectTrigger>
                <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.nama}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Guru</Label>
              <Select value={draft.guru_id ?? "none"} onValueChange={(v) => setDraft({ ...draft, guru_id: v === "none" ? null : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="none">-</SelectItem>{teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.nama}</SelectItem>)}</SelectContent>
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
