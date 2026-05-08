import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader, StatCard } from "@/components/shared/StatCard";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { UNITS, UnitKey } from "@/lib/units";
import { Building2, Users, GraduationCap, FileText } from "lucide-react";

export default function Yayasan() {
  const { data: students } = useSupabaseTable<any>("students");
  const { data: teachers } = useSupabaseTable<any>("teachers");
  const { data: classes } = useSupabaseTable<any>("classes");
  const { data: ppdb } = useSupabaseTable<any>("ppdb_applications");

  const units = Object.keys(UNITS) as UnitKey[];
  const cnt = (arr: any[], u: UnitKey) => arr.filter((x) => x.unit === u).length;
  const max = Math.max(1, ...units.map((u) => cnt(students, u)));

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard Yayasan" subtitle="Ringkasan multi-unit Darul Rohman" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Siswa" value={students.length} icon={GraduationCap} variant="primary" />
        <StatCard label="Total Guru" value={teachers.length} icon={Users} variant="secondary" />
        <StatCard label="Total Kelas" value={classes.length} icon={Building2} variant="accent" />
        <StatCard label="PPDB" value={ppdb.length} icon={FileText} />
      </div>

      <Card className="rounded-2xl border-0 shadow-soft">
        <CardHeader><CardTitle className="font-display">Distribusi Siswa per Unit</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          {units.map((k) => {
            const total = cnt(students, k);
            const pct = (total / max) * 100;
            return (
              <div key={k}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className="gradient-primary text-primary-foreground">{UNITS[k].short}</Badge>
                    <span className="font-semibold">{UNITS[k].name}</span>
                  </div>
                  <span className="font-mono font-bold text-primary">{total} siswa</span>
                </div>
                <div className="h-6 overflow-hidden rounded-xl bg-muted">
                  <div className={`h-full transition-all duration-700 ${k === "mi" ? "gradient-primary" : k === "smp" ? "gradient-sky" : k === "smk" ? "gradient-gold" : "gradient-primary"}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
