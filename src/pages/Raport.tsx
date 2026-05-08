import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/shared/StatCard";
import { SearchBar } from "@/components/shared/SearchBar";
import { useUnit } from "@/context/UnitContext";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { useDebounce } from "@/hooks/useDebounce";
import { Eye, X, FileSearch } from "lucide-react";
import { NilaiDetailDialog } from "@/components/shared/NilaiDetailDialog";

const predikat = (n: number) => n >= 90 ? "A" : n >= 80 ? "B" : n >= 70 ? "C" : "D";

export default function Raport() {
  const { unit, info } = useUnit();
  const { data: students } = useSupabaseTable<any>("students", { unit });
  const { data: grades } = useSupabaseTable<any>("grades", { unit });
  const { data: subjects } = useSupabaseTable<any>("subjects", { unit });
  const { data: classes } = useSupabaseTable<any>("classes", { unit });

  const [q, setQ] = useState("");
  const dq = useDebounce(q, 300);
  const [kelasFilter, setKelasFilter] = useState<string>("all");
  const [mapelFilter, setMapelFilter] = useState<string>("all");
  const [semesterFilter, setSemesterFilter] = useState<string>("all");
  const [studentId, setStudentId] = useState<string>("");

  const kelasName = (id?: string) => classes.find((c: any) => c.id === id)?.nama ?? "-";

  const filteredStudents = useMemo(() => {
    const low = dq.toLowerCase();
    return students.filter((s: any) => {
      if (kelasFilter !== "all" && s.kelas_id !== kelasFilter) return false;
      if (low) {
        const inName = s.nama?.toLowerCase().includes(low);
        const inKelas = kelasName(s.kelas_id).toLowerCase().includes(low);
        const inNis = (s.nis ?? "").toLowerCase().includes(low);
        if (!inName && !inKelas && !inNis) return false;
      }
      return true;
    });
  }, [students, dq, kelasFilter, classes]);

  const selected = filteredStudents.find((s: any) => s.id === studentId) ?? filteredStudents[0];
  const sid = selected?.id;

  const filteredGrades = useMemo(() => {
    return grades.filter((g: any) => {
      if (mapelFilter !== "all" && g.subject_id !== mapelFilter) return false;
      if (semesterFilter !== "all" && g.semester !== semesterFilter) return false;
      return true;
    });
  }, [grades, mapelFilter, semesterFilter]);

  const rows = useMemo(() => {
    if (!sid) return [];
    return subjects.map((s: any) => {
      const list = filteredGrades.filter((g: any) => g.student_id === sid && g.subject_id === s.id);
      const avg = list.length ? Math.round(list.reduce((a, b) => a + Number(b.nilai), 0) / list.length) : 0;
      return { subject: s.nama, count: list.length, avg };
    }).filter((r) => r.count > 0);
  }, [sid, subjects, filteredGrades]);

  const overall = rows.length ? Math.round(rows.reduce((a, b) => a + b.avg, 0) / rows.length) : 0;
  const [open, setOpen] = useState(false);
  const studentGrades = filteredGrades.filter((g: any) => g.student_id === sid);

  const semesterOpts = useMemo(() => {
    const set = new Set<string>();
    grades.forEach((g: any) => g.semester && set.add(g.semester));
    return Array.from(set);
  }, [grades]);

  const hasFilter = !!dq || kelasFilter !== "all" || mapelFilter !== "all" || semesterFilter !== "all";
  const clearAll = () => { setQ(""); setKelasFilter("all"); setMapelFilter("all"); setSemesterFilter("all"); };

  return (
    <div className="space-y-6">
      <PageHeader title="Raport Akademik" subtitle={`Unit ${info.short} — ${filteredStudents.length} siswa`} />

      <Card className="rounded-2xl border-0 shadow-soft">
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchBar value={q} onChange={setQ} placeholder="Cari nama siswa / kelas / NIS..." className="flex-1" />
            {hasFilter && (
              <Button variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground">
                <X className="mr-1 h-4 w-4" /> Reset
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Select value={kelasFilter} onValueChange={(v) => { setKelasFilter(v); setStudentId(""); }}>
                <SelectTrigger><SelectValue placeholder="Semua kelas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua kelas</SelectItem>
                  {classes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.nama}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={mapelFilter} onValueChange={setMapelFilter}>
                <SelectTrigger><SelectValue placeholder="Semua mapel" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua mapel</SelectItem>
                  {subjects.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                <SelectTrigger><SelectValue placeholder="Semua semester" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua semester</SelectItem>
                  {semesterOpts.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={sid ?? ""} onValueChange={setStudentId}>
                <SelectTrigger><SelectValue placeholder="Pilih siswa" /></SelectTrigger>
                <SelectContent>
                  {filteredStudents.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.nama} — {kelasName(s.kelas_id)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredStudents.length === 0 ? (
        <Card className="rounded-2xl border-0 shadow-soft">
          <CardContent className="flex flex-col items-center gap-2 py-16 text-center">
            <FileSearch className="h-12 w-12 text-muted-foreground/50" />
            <p className="font-semibold">Data raport tidak ditemukan</p>
            <p className="text-sm text-muted-foreground">Coba ubah kata kunci pencarian atau reset filter.</p>
          </CardContent>
        </Card>
      ) : selected && (
        <>
          <Card className="rounded-2xl border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="font-display flex items-center justify-between">
                <span>Identitas Siswa</span>
                <Button variant="outline" size="sm" onClick={() => setOpen(true)}><Eye className="mr-2 h-4 w-4" /> Detail Nilai</Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
              <Info label="Nama" value={selected.nama} />
              <Info label="NIS" value={selected.nis ?? "-"} />
              <Info label="Kelas" value={kelasName(selected.kelas_id)} />
              <Info label="Unit" value={`${info.short} — ${info.name}`} />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-soft">
            <CardHeader>
              <CardTitle className="font-display">Nilai per Mapel</CardTitle>
              <p className="text-sm text-muted-foreground">Rata-rata keseluruhan: <span className="font-bold text-primary">{overall}</span> ({predikat(overall)})</p>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader><TableRow><TableHead>Mata Pelajaran</TableHead><TableHead className="text-center">Jumlah Nilai</TableHead><TableHead className="text-center">Rata-rata</TableHead><TableHead className="text-center">Predikat</TableHead></TableRow></TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.subject}>
                      <TableCell className="font-medium">{r.subject}</TableCell>
                      <TableCell className="text-center">{r.count}</TableCell>
                      <TableCell className="text-center font-bold text-primary">{r.avg}</TableCell>
                      <TableCell className="text-center"><Badge>{predikat(r.avg)}</Badge></TableCell>
                    </TableRow>
                  ))}
                  {rows.length === 0 && <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">Belum ada nilai untuk filter saat ini</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <NilaiDetailDialog open={open} onOpenChange={setOpen} siswa={selected.nama} grades={studentGrades} />
        </>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
