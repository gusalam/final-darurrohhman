import { useState, useMemo, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { canWriteUnit } from "@/lib/units";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/StatCard";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ButtonLoading } from "@/components/shared/ButtonLoading";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { useConfirm } from "@/hooks/useConfirm";
import { useUnit } from "@/context/UnitContext";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { dbInsert, dbUpdate, dbDelete } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, UserPlus, Download, Upload, FileDown, AlertTriangle } from "lucide-react";
import { SearchBar } from "@/components/shared/SearchBar";
import { useDebounce } from "@/hooks/useDebounce";
import { Progress } from "@/components/ui/progress";
import * as XLSX from "xlsx";
import { toast } from "sonner";

interface Student { id: string; nama: string; nis: string | null; nisn: string | null; jenis_kelamin: string | null; alamat: string | null; nama_wali: string | null; telepon_wali: string | null; kelas_id: string | null; status: string; unit: string; tanggal_lahir: string | null; }

const empty = (unit: string): Partial<Student> => ({ nama: "", nis: "", nisn: "", jenis_kelamin: "L", alamat: "", nama_wali: "", telepon_wali: "", kelas_id: null, status: "aktif", unit });

export default function Siswa() {
  const { role } = useAuth();
  const writable = canWriteUnit(role);
  const { unit, info } = useUnit();
  const { data, loading: fetching, refetch } = useSupabaseTable<Student>("students", { unit });
  const { data: classes } = useSupabaseTable<any>("classes", { unit });
  const [q, setQ] = useState("");
  const dq = useDebounce(q);
  const [importOpen, setImportOpen] = useState(false);
  const [importData, setImportData] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<any>(empty(unit));
  const [saving, setSaving] = useState(false);
  const { confirm, dialogProps } = useConfirm();

  const filtered = useMemo(() => {
    if (!dq) return data;
    const low = dq.toLowerCase();
    return data.filter((s) =>
      s.nama.toLowerCase().includes(low) || (s.nis ?? "").includes(low) || (s.nisn ?? "").includes(low) || (s.nama_wali ?? "").toLowerCase().includes(low)
    );
  }, [data, dq]);

  const openNew = () => { setDraft(empty(unit)); setOpen(true); };
  const openEdit = (s: Student) => { setDraft({ ...s }); setOpen(true); };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["nama_siswa", "nis", "nisn", "kelas", "jenis_kelamin", "alamat", "tanggal_lahir", "nama_wali", "telepon_wali"],
      ["Contoh Siswa", "12345", "0012345678", "", "L", "Jl. Contoh No. 1", "2010-01-15", "Bapak Contoh", "081234567890"],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, `template_siswa_${unit}.xlsx`);
  };

  const exportData = () => {
    const rows = data.map((s) => ({
      nama_siswa: s.nama, nis: s.nis ?? "", nisn: s.nisn ?? "",
      kelas: classes.find((c: any) => c.id === s.kelas_id)?.nama ?? "",
      jenis_kelamin: s.jenis_kelamin ?? "", alamat: s.alamat ?? "",
      tanggal_lahir: s.tanggal_lahir ?? "", nama_wali: s.nama_wali ?? "",
      telepon_wali: s.telepon_wali ?? "", status: s.status,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Siswa");
    XLSX.writeFile(wb, `data_siswa_${unit}_${info.short}.xlsx`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target?.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(ws);
        const errors: string[] = [];
        const existingNis = new Set(data.map((s) => s.nis).filter(Boolean));
        const seenNis = new Set<string>();
        rows.forEach((r, i) => {
          if (!r.nama_siswa?.toString().trim()) errors.push(`Baris ${i + 2}: Nama kosong`);
          const nis = r.nis?.toString().trim();
          if (nis) {
            if (existingNis.has(nis)) errors.push(`Baris ${i + 2}: NIS "${nis}" sudah ada`);
            if (seenNis.has(nis)) errors.push(`Baris ${i + 2}: NIS "${nis}" duplikat`);
            seenNis.add(nis);
          }
        });
        setImportData(rows); setImportErrors(errors); setImportOpen(true);
      } catch { toast.error("Gagal membaca file"); }
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  const doImport = async () => {
    setImporting(true); setImportProgress(0);
    let success = 0;
    for (let i = 0; i < importData.length; i++) {
      const r = importData[i];
      try {
        const kelasObj = r.kelas ? classes.find((c: any) => c.nama?.toLowerCase() === r.kelas?.toString().toLowerCase()) : null;
        await dbInsert("students", {
          nama: r.nama_siswa?.toString().trim(), nis: r.nis?.toString().trim() || null,
          nisn: r.nisn?.toString().trim() || null, jenis_kelamin: r.jenis_kelamin?.toString().trim() || null,
          alamat: r.alamat?.toString().trim() || null, tanggal_lahir: r.tanggal_lahir?.toString().trim() || null,
          nama_wali: r.nama_wali?.toString().trim() || null, telepon_wali: r.telepon_wali?.toString().trim() || null,
          kelas_id: kelasObj?.id ?? null, status: "aktif", unit,
        });
        success++;
      } catch {}
      setImportProgress(Math.round(((i + 1) / importData.length) * 100));
    }
    toast.success(`${success} dari ${importData.length} siswa berhasil diimpor`);
    setImporting(false); setImportOpen(false); refetch();
  };

  const submit = async () => {
    if (!draft.nama?.trim()) return toast.error("Nama wajib diisi");
    setSaving(true);
    try {
      const payload = { ...draft, unit, kelas_id: draft.kelas_id || null };
      if (draft.id) await dbUpdate("students", draft.id, payload);
      else await dbInsert("students", payload);
      toast.success("Data berhasil disimpan"); setOpen(false); refetch();
    } catch {
    } finally { setSaving(false); }
  };

  const remove = (s: Student) => {
    confirm({
      title: "Hapus Siswa",
      description: `Yakin ingin menghapus siswa "${s.nama}"? Data tidak bisa dikembalikan.`,
      variant: "danger",
      confirmLabel: "Ya, hapus",
      onConfirm: async () => { await dbDelete("students", s.id); toast.success("Siswa berhasil dihapus"); refetch(); },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Data Siswa ${info.short}`}
        subtitle={`${data.length} siswa terdaftar di ${info.name}`}
        action={writable ? (
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={downloadTemplate}><FileDown className="mr-1 h-4 w-4" /> Template</Button>
            <Button variant="outline" size="sm" onClick={exportData}><Download className="mr-1 h-4 w-4" /> Export</Button>
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}><Upload className="mr-1 h-4 w-4" /> Import</Button>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileUpload} />
            <Button onClick={openNew} className="gradient-primary text-primary-foreground"><UserPlus className="mr-2 h-4 w-4" /> Tambah</Button>
          </div>
        ) : undefined}
      />

      {fetching && data.length === 0 ? <SkeletonTable rows={5} cols={6} /> : (
      <Card className="rounded-2xl border-0 shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
          <CardTitle className="font-display">Daftar Siswa</CardTitle>
          <SearchBar value={q} onChange={setQ} placeholder="Cari nama, NIS..." className="w-64" />
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NIS</TableHead><TableHead>Nama</TableHead><TableHead>Kelas</TableHead>
                <TableHead>L/P</TableHead><TableHead>Wali</TableHead><TableHead>Status</TableHead>{writable && <TableHead className="text-right">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs">{s.nis ?? "-"}</TableCell>
                  <TableCell className="font-semibold">{s.nama}</TableCell>
                  <TableCell><Badge variant="outline">{classes.find((c) => c.id === s.kelas_id)?.nama ?? "-"}</Badge></TableCell>
                  <TableCell>{s.jenis_kelamin ?? "-"}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{s.nama_wali ?? "-"}</TableCell>
                  <TableCell><Badge className="bg-success text-primary-foreground">{s.status}</Badge></TableCell>
                  {writable && (
                    <TableCell className="text-right">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(s)}><Trash2 className="h-4 w-4" /></Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={7} className="py-8 text-center text-muted-foreground">{dq ? "Data tidak ditemukan" : "Belum ada siswa"}</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{draft.id ? "Edit Siswa" : "Tambah Siswa"}</DialogTitle></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nama"><Input value={draft.nama ?? ""} onChange={(e) => setDraft({ ...draft, nama: e.target.value })} /></Field>
            <Field label="NIS"><Input value={draft.nis ?? ""} onChange={(e) => setDraft({ ...draft, nis: e.target.value })} /></Field>
            <Field label="NISN"><Input value={draft.nisn ?? ""} onChange={(e) => setDraft({ ...draft, nisn: e.target.value })} /></Field>
            <Field label="Jenis Kelamin">
              <Select value={draft.jenis_kelamin ?? "L"} onValueChange={(v) => setDraft({ ...draft, jenis_kelamin: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="L">Laki-laki</SelectItem><SelectItem value="P">Perempuan</SelectItem></SelectContent>
              </Select>
            </Field>
            <Field label="Kelas">
              <Select value={draft.kelas_id ?? "none"} onValueChange={(v) => setDraft({ ...draft, kelas_id: v === "none" ? null : v })}>
                <SelectTrigger><SelectValue placeholder="Pilih kelas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">- Tidak ada -</SelectItem>
                  {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.nama}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Tanggal Lahir"><Input type="date" value={draft.tanggal_lahir ?? ""} onChange={(e) => setDraft({ ...draft, tanggal_lahir: e.target.value || null })} /></Field>
            <Field label="Nama Wali"><Input value={draft.nama_wali ?? ""} onChange={(e) => setDraft({ ...draft, nama_wali: e.target.value })} /></Field>
            <Field label="Telepon Wali"><Input value={draft.telepon_wali ?? ""} onChange={(e) => setDraft({ ...draft, telepon_wali: e.target.value })} /></Field>
            <div className="sm:col-span-2"><Field label="Alamat"><Input value={draft.alamat ?? ""} onChange={(e) => setDraft({ ...draft, alamat: e.target.value })} /></Field></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Batal</Button>
            <ButtonLoading onClick={submit} loading={saving} loadingText="Menyimpan..." className="gradient-primary text-primary-foreground">Simpan</ButtonLoading>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {dialogProps && <ConfirmDialog {...dialogProps} />}

      <Dialog open={importOpen} onOpenChange={(v) => !importing && setImportOpen(v)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Import Data Siswa</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{importData.length} baris ditemukan</p>
            {importErrors.length > 0 && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 max-h-40 overflow-y-auto space-y-1">
                <p className="text-sm font-semibold text-destructive flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> {importErrors.length} masalah</p>
                {importErrors.map((e, i) => <p key={i} className="text-xs text-destructive">{e}</p>)}
              </div>
            )}
            {importing && <div className="space-y-1"><Progress value={importProgress} className="h-2" /><p className="text-xs text-muted-foreground text-center">{importProgress}%</p></div>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportOpen(false)} disabled={importing}>Batal</Button>
            <ButtonLoading onClick={doImport} loading={importing} loadingText="Mengimpor..." disabled={importErrors.length > 0 || importData.length === 0} className="gradient-primary text-primary-foreground">Impor {importData.length} Siswa</ButtonLoading>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label>{label}</Label>{children}</div>;
}
