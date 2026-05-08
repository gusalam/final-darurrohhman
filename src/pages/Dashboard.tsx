import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUnit } from "@/context/UnitContext";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABEL } from "@/lib/units";
import { StatCard, PageHeader } from "@/components/shared/StatCard";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { GraduationCap, Users, BookOpen, Wallet, Sparkles, Newspaper } from "lucide-react";
// Logo diambil dari info unit aktif

export default function Dashboard() {
  const { info, unit } = useUnit();
  const { profile, role } = useAuth();
  const { data: students } = useSupabaseTable("students", { unit });
  const { data: teachers } = useSupabaseTable("teachers", { unit });
  const { data: classes } = useSupabaseTable("classes", { unit });
  const { data: payments } = useSupabaseTable<any>("payments", { unit });
  const { data: posts } = useSupabaseTable<any>("cms_posts", { filters: { status: "published" } });

  const totalLunas = payments.filter((p) => p.status === "lunas").reduce((s, p) => s + Number(p.jumlah || 0), 0);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl gradient-hero p-6 shadow-md-soft md:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-1 md:h-20 md:w-20">
            <img src={info.logo} alt={`Logo ${info.short}`} className="h-full w-full object-contain" />
          </div>
          <div className="text-white">
            <Badge className="mb-2 border-0 bg-secondary text-secondary-foreground">
              <Sparkles className="mr-1 h-3 w-3" /> Unit {info.short} • {role ? ROLE_LABEL[role] : info.level}
            </Badge>
            <h1 className="font-display text-2xl font-bold md:text-3xl">Assalamu'alaikum, {profile?.nama ?? "Admin"} 👋</h1>
            <p className="mt-1 text-sm text-white/90">Dashboard {info.name}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Siswa" value={students.length} icon={GraduationCap} variant="primary" />
        <StatCard label="Total Guru" value={teachers.length} icon={Users} variant="secondary" />
        <StatCard label="Total Kelas" value={classes.length} icon={BookOpen} variant="accent" />
        <StatCard label="SPP Lunas" value={`Rp ${totalLunas.toLocaleString("id-ID")}`} icon={Wallet} />
      </div>

      <Card className="rounded-2xl border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <Newspaper className="h-5 w-5 text-primary" /> Berita & Pengumuman Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {posts.slice(0, 5).map((p: any) => (
            <div key={p.id} className="rounded-xl border border-border p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">{p.title}</p>
                <Badge variant="outline">{p.category ?? "berita"}</Badge>
              </div>
              {p.excerpt && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.excerpt}</p>}
            </div>
          ))}
          {posts.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Belum ada konten dipublikasikan</p>}
        </CardContent>
      </Card>
    </div>
  );
}
