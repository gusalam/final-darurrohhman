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
import { Plus, Pencil, Trash2, Wallet, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { SearchBar } from "@/components/shared/SearchBar";
import { useDebounce } from "@/hooks/useDebounce";

const fmt = (n: number) => "Rp " + Number(n || 0).toLocaleString("id-ID");
const empty = (unit: string) => ({ student_id: "", jenis: "spp", periode: "", jumlah: 0, status: "belum", tanggal_bayar: null as string | null, catatan: "", unit });

export default function Keuangan() {
  const { role } = useAuth();
  const writable = canWriteUnit(role);
  const { unit, info } = useUnit();
  const { data, loading: fetching, refetch } = useSupabaseTable<any>("payments", { unit });
  const { data: students } = useSupabaseTable<any>("students", { unit });
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<any>(empty(unit));
  const [saving, setSaving] = useState(false);
  const { confirm, dialogProps } = useConfirm();
  const [q, setQ] = useState("");
  const dq = useDebounce(q);
  const filteredData = useMemo(() => {
    if (!dq) return data;
    const low = dq.toLowerCase();
    return data.filter((p: any) =>
      students.find((s: any) => s.id === p.student_id)?.nama?.toLowerCase().includes(low) ||
      p.jenis?.toLowerCase().includes(low) || p.periode?.toLowerCase().includes(low) || p.status?.toLowerCase().includes(low)
    );
  }, [data, dq, students]);

  const lunas = data.filter((p) => p.status === "lunas");
  const belum = data.filter((p) => p.status !== "lunas");

  const submit = async () => {
    if (!draft.student_id) return toast.error("Pilih siswa");
    setSaving(true);
    const payload = { ...draft, unit, jumlah: Number(draft.jumlah), tanggal_bayar: draft.tanggal_bayar || null };
    try {
      if (draft.id) await dbUpdate("payments", draft.id, payload);
      else await dbInsert("payments", payload);
      toast.success("Data berhasil disimpan"); setOpen(false); refetch();
    } catch {} finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <PageHeader title={`Keuangan ${info.short}`} subtitle="Tagihan SPP & pembayaran" action={
        writable ? <Button onClick={() => { setDraft(empty(unit)); setOpen(true); }} className="gradient-primary text-primary-foreground"><Plus className="mr-2 h-4 w-4" /> Buat Tagihan</Button> : undefined
      } />
      <SearchBar value={q} onChange={setQ} placeholder="Cari siswa, jenis, periode..." className="max-w-sm" />

      {fetching && data.length === 0 ? <><SkeletonCards count={3} /><SkeletonTable rows={5} cols={5} /></> : (<>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total" value={fmt(data.reduce((s, p) => s + Number(p.jumlah || 0), 0))} icon={Wallet} variant="primary" />
        <StatCard label="Lunas" value={fmt(lunas.reduce((s, p) => s + Number(p.jumlah || 0), 0))} icon={CheckCircle2} variant="secondary" hint={`${lunas.length} pembayaran`} />
        <StatCard label="Belum" value={fmt(belum.reduce((s, p) => s + Number(p.jumlah || 0), 0))} icon={Clock} variant="accent" hint={`${belum.length} tagihan`} />
      </div>

      <Card className="rounded-2xl border-0 shadow-soft">
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader><TableRow><TableHead>Siswa</TableHead><TableHead>Jenis</TableHead><TableHead>Periode</TableHead><TableHead>Jumlah</TableHead><TableHead>Status</TableHead>{writable && <TableHead className="text-right">Aksi</TableHead>}</TableRow></TableHeader>
            <TableBody>
              {filteredData.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="font-semibold">{students.find(s => s.id === p.student_id)?.nama ?? "-"}</TableCell>
                  <TableCell><Badge variant="outline" className="uppercase">{p.jenis}</Badge></TableCell>
                  <TableCell>{p.periode ?? "-"}</TableCell>
                  <TableCell className="font-mono">{fmt(p.jumlah)}</TableCell>
                  <TableCell><Badge className={p.status === "lunas" ? "bg-success text-primary-foreground" : "bg-warning text-secondary-foreground"}>{p.status}</Badge></TableCell>
                  {writable && (
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => { setDraft(p); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => confirm({ title: "Hapus Tagihan", description: "Yakin ingin menghapus tagihan ini?", variant: "danger", confirmLabel: "Ya, hapus", onConfirm: async () => { await dbDelete("payments", p.id); toast.success("Tagihan berhasil dihapus"); refetch(); } })}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {filteredData.length === 0 && <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">{dq ? "Data tidak ditemukan" : "Belum ada tagihan"}</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </>)}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{draft.id ? "Edit" : "Buat"} Tagihan</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2"><Label>Siswa</Label>
              <Select value={draft.student_id} onValueChange={(v) => setDraft({ ...draft, student_id: v })}>
                <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                <SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Jenis</Label>
              <Select value={draft.jenis} onValueChange={(v) => setDraft({ ...draft, jenis: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="spp">SPP</SelectItem><SelectItem value="daftar_ulang">Daftar Ulang</SelectItem><SelectItem value="kegiatan">Kegiatan</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Periode</Label><Input value={draft.periode ?? ""} placeholder="Jan 2026" onChange={(e) => setDraft({ ...draft, periode: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Jumlah</Label><Input type="number" value={draft.jumlah} onChange={(e) => setDraft({ ...draft, jumlah: Number(e.target.value) })} /></div>
            <div className="space-y-1.5"><Label>Status</Label>
              <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="belum">Belum</SelectItem><SelectItem value="lunas">Lunas</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 col-span-2"><Label>Tanggal Bayar</Label><Input type="date" value={draft.tanggal_bayar ?? ""} onChange={(e) => setDraft({ ...draft, tanggal_bayar: e.target.value || null })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Batal</Button><ButtonLoading onClick={submit} loading={saving} loadingText="Menyimpan..." className="gradient-primary text-primary-foreground">Simpan</ButtonLoading></DialogFooter>
        </DialogContent>
      </Dialog>
      {dialogProps && <ConfirmDialog {...dialogProps} />}
    </div>
  );
}
