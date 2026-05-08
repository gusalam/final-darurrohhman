import { Link, Navigate, useParams } from "react-router-dom";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { ArrowLeft, Calendar } from "lucide-react";
import { Reveal } from "@/components/shared/Reveal";

const UNIT_META: Record<string, { label: string; full: string }> = {
  mi: { label: "MI", full: "Madrasah Ibtidaiyah An-Nuriyah" },
  smp: { label: "SMP", full: "SMP Darul Rohman" },
  smk: { label: "SMK", full: "SMK Darul Rohman" },
  madrasah: { label: "Madrasah", full: "Madrasah Diniyah Al Arsyadiyah" },
  tk: { label: "TK", full: "TK PGRI 02 Roudlotul Huffadz" },
};

export default function JadwalUnit() {
  const { unit = "" } = useParams();
  const meta = UNIT_META[unit];
  const { data: schedules, loading } = useSupabaseTable<any>("schedules", {
    select: "*, classes(nama, unit), subjects(nama), teachers(nama)",
    orderBy: { column: "jam_mulai", ascending: true },
  });

  if (!meta) return <Navigate to="/" replace />;

  const rows = (schedules ?? []).filter((s: any) => s.unit === unit);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`Jadwal Pelajaran ${meta.label} — ${meta.full}`}
        description={`Jadwal pelajaran real-time untuk ${meta.full} di Yayasan Darur Rohman Morombuh Kwanyar.`}
        canonical={`https://yayasandarurrahmanku.web.app/jadwal/${unit}`}
        keywords={`jadwal pelajaran ${meta.label.toLowerCase()}, ${meta.full.toLowerCase()}, yayasan darur rohman morombuh`}
      />
      <PublicNavbar />

      <section className="bg-card border-b border-border">
        <div className="mx-auto max-w-screen-2xl px-4 py-10 md:px-6 md:py-14">
          <Link to="/#jadwal">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
            </Button>
          </Link>
          <Badge variant="outline" className="border-primary text-primary">
            <Calendar className="mr-1 h-3 w-3" /> Jadwal {meta.label}
          </Badge>
          <h1 className="mt-2 font-display text-2xl font-bold md:text-4xl">Jadwal Pelajaran {meta.full}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Data jadwal real-time. Tabel akan otomatis diperbarui mengikuti pengaturan unit.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-screen-2xl px-4 py-10 md:px-6 md:py-14">
        <Reveal>
          {loading ? (
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Memuat jadwal…</p>
          ) : rows.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Belum ada jadwal untuk unit {meta.label}.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hari</TableHead>
                    <TableHead>Jam</TableHead>
                    <TableHead>Kelas</TableHead>
                    <TableHead>Mata Pelajaran</TableHead>
                    <TableHead>Guru</TableHead>
                    <TableHead>Ruang</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.hari}</TableCell>
                      <TableCell>{(s.jam_mulai ?? "").slice(0, 5)}–{(s.jam_selesai ?? "").slice(0, 5)}</TableCell>
                      <TableCell>{s.classes?.nama ?? "-"}</TableCell>
                      <TableCell>{s.subjects?.nama ?? "-"}</TableCell>
                      <TableCell>{s.teachers?.nama ?? "-"}</TableCell>
                      <TableCell>{s.ruangan ?? "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Reveal>
      </section>
    </div>
  );
}
