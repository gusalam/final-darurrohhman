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
import { dbUpdate, dbDelete } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, FileText, CheckCircle2, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { SearchBar } from "@/components/shared/SearchBar";
import { useDebounce } from "@/hooks/useDebounce";

const STATUS = ["baru", "verifikasi", "diterima", "ditolak"];

export default function PPDB() {
  const { role } = useAuth();
  const writable = canWriteUnit(role);
  const { unit, info } = useUnit();
  const { data, loading: fetching, refetch } = useSupabaseTable<any>("ppdb_applications", { unit });
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const { confirm, dialogProps } = useConfirm();
  const [q, setQ] = useState("");
  const dq = useDebounce(q);
  const filtered = useMemo(() => {
    if (!dq) return data;
    const low = dq.toLowerCase();
    return data.filter((p: any) =>
      p.nama?.toLowerCase().includes(low) || p.asal_sekolah?.toLowerCase().includes(low) ||
      p.nama_wali?.toLowerCase().includes(low) || p.status?.toLowerCase().includes(low)
    );
  }, [data, dq]);

  const cnt = (s: string) => data.filter((d) => d.status === s).length;
  const submit = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      await dbUpdate("ppdb_applications", draft.id, { status: draft.status, catatan: draft.catatan });
      toast.success("Status berhasil diperbarui"); setOpen(false); refetch();
    } catch {} finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <PageHeader title={`PPDB ${info.short}`} subtitle="Pendaftar peserta didik baru" />
      <SearchBar value={q} onChange={setQ} placeholder="Cari nama, asal sekolah, wali..." className="max-w-sm" />
      {fetching && data.length === 0 ? <><SkeletonCards count={4} /><SkeletonTable rows={5} cols={5} /></> : (<>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total" value={data.length} icon={FileText} variant="primary" />
        <StatCard label="Diterima" value={cnt("diterima")} icon={CheckCircle2} variant="secondary" />
        <StatCard label="Pending" value={cnt("baru") + cnt("verifikasi")} icon={Clock} variant="accent" />
        <StatCard label="Ditolak" value={cnt("ditolak")} icon={XCircle} />
      </div>

      <Card className="rounded-2xl border-0 shadow-soft">
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Nama</TableHead><TableHead>Asal</TableHead><TableHead>Wali</TableHead><TableHead>Telp</TableHead><TableHead>Status</TableHead>{writable && <TableHead className="text-right">Aksi</TableHead>}</TableRow></TableHeader>
            <TableBody>
              {filtered.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="font-semibold">{p.nama}</TableCell>
                  <TableCell className="text-muted-foreground">{p.asal_sekolah ?? "-"}</TableCell>
                  <TableCell>{p.nama_wali ?? "-"}</TableCell>
                  <TableCell className="font-mono text-xs">{p.telepon_wali ?? "-"}</TableCell>
                  <TableCell><Badge className={p.status === "diterima" ? "bg-success text-primary-foreground" : p.status === "ditolak" ? "bg-destructive text-destructive-foreground" : "bg-warning text-secondary-foreground"}>{p.status}</Badge></TableCell>
                  {writable && (
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => { setDraft({ ...p }); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => confirm({ title: "Hapus Pendaftar", description: `Yakin ingin menghapus data "${p.nama}"?`, variant: "danger", confirmLabel: "Ya, hapus", onConfirm: async () => { await dbDelete("ppdb_applications", p.id); toast.success("Data berhasil dihapus"); refetch(); } })}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">{dq ? "Data tidak ditemukan" : "Belum ada pendaftar"}</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </>)}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Status — {draft?.nama}</DialogTitle></DialogHeader>
          {draft && (
            <div className="space-y-3">
              <div className="space-y-1.5"><Label>Status</Label>
                <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Catatan</Label><Input value={draft.catatan ?? ""} onChange={(e) => setDraft({ ...draft, catatan: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Batal</Button><ButtonLoading onClick={submit} loading={saving} loadingText="Menyimpan..." className="gradient-primary text-primary-foreground">Simpan</ButtonLoading></DialogFooter>
        </DialogContent>
      </Dialog>
      {dialogProps && <ConfirmDialog {...dialogProps} />}
    </div>
  );
}
