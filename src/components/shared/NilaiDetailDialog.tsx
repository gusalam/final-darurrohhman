import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Grade { id: string; jenis: string; nilai: number; semester: string | null; tahun_ajaran: string | null; catatan: string | null; }

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  siswa: string;
  grades: Grade[];
}

export function NilaiDetailDialog({ open, onOpenChange, siswa, grades }: Props) {
  const avg = grades.length ? Math.round(grades.reduce((a, b) => a + Number(b.nilai), 0) / grades.length) : 0;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">{siswa}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="rounded-xl bg-primary p-4 text-center text-primary-foreground">
            <p className="text-xs opacity-90">Rata-rata</p>
            <p className="mt-1 text-3xl font-bold">{avg}</p>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {grades.map((g) => (
              <div key={g.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                <div>
                  <p className="font-semibold capitalize">{g.jenis}</p>
                  <p className="text-xs text-muted-foreground">{g.semester ?? "-"} • {g.tahun_ajaran ?? "-"}</p>
                </div>
                <Badge className="bg-primary text-primary-foreground">{g.nilai}</Badge>
              </div>
            ))}
            {grades.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Belum ada nilai</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
