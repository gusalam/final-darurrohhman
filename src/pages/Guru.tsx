import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { canWriteUnit } from "@/lib/units";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/StatCard";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ButtonLoading } from "@/components/shared/ButtonLoading";
import { SkeletonCards } from "@/components/shared/SkeletonTable";
import { SearchBar } from "@/components/shared/SearchBar";
import { useConfirm } from "@/hooks/useConfirm";
import { useDebounce } from "@/hooks/useDebounce";
import { useUnit } from "@/context/UnitContext";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { supabase } from "@/integrations/supabase/client";
import { dbInsert, dbUpdate, dbDelete } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Phone, Mail, UserCog, BookOpen } from "lucide-react";
import { toast } from "sonner";

const empty = (unit: string) => ({ nama: "", nip: "", jabatan: "", telepon: "", email: "", unit });

export default function Guru() {
  const { role } = useAuth();
  const writable = canWriteUnit(role);
  const { unit, info } = useUnit();
  const { data: teachers, loading: fetching, refetch } = useSupabaseTable<any>("teachers", { unit });
  const { data: subjects } = useSupabaseTable<any>("subjects", { unit });
  const { data: classes } = useSupabaseTable<any>("classes", { unit });
  const { data: teacherSubjects, refetch: refetchTS } = useSupabaseTable<any>("teacher_subjects", {});

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<any>(empty(unit));
  const [draftSubjectIds, setDraftSubjectIds] = useState<string[]>([]);
  const [draftWaliKelasId, setDraftWaliKelasId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState("");
  const dq = useDebounce(q);
  const { confirm, dialogProps } = useConfirm();

  const tsMap = useMemo(() => {
    const m: Record<string, string[]> = {};
    teacherSubjects.forEach((ts: any) => {
      if (!m[ts.teacher_id]) m[ts.teacher_id] = [];
      m[ts.teacher_id].push(ts.subject_id);
    });
    return m;
  }, [teacherSubjects]);

  const waliMap = useMemo(() => {
    const m: Record<string, string> = {};
    classes.forEach((c: any) => { if (c.wali_kelas_id) m[c.wali_kelas_id] = c.nama; });
    return m;
  }, [classes]);

  const filtered = useMemo(() => {
    if (!dq) return teachers;
    const low = dq.toLowerCase();
    return teachers.filter((g: any) =>
      g.nama?.toLowerCase().includes(low) || g.nip?.toLowerCase().includes(low) || g.jabatan?.toLowerCase().includes(low)
    );
  }, [teachers, dq]);

  const openEdit = (g: any) => {
    setDraft(g);
    setDraftSubjectIds(tsMap[g.id] ?? []);
    const waliClass = classes.find((c: any) => c.wali_kelas_id === g.id);
    setDraftWaliKelasId(waliClass?.id ?? null);
    setOpen(true);
  };
  const openNew = () => {
    setDraft(empty(unit));
    setDraftSubjectIds([]);
    setDraftWaliKelasId(null);
    setOpen(true);
  };

  const submit = async () => {
    if (!draft.nama?.trim()) return toast.error("Nama wajib diisi");
    if (draftWaliKelasId) {
      const cls = classes.find((c: any) => c.id === draftWaliKelasId);
      if (cls?.wali_kelas_id && cls.wali_kelas_id !== draft.id) {
        return toast.error(`Kelas "${cls.nama}" sudah punya wali kelas lain`);
      }
    }
    setSaving(true);
    try {
      const { id: _id, created_at: _c, updated_at: _u, mapel_utama: _m, ...rest } = draft;
      const payload = { ...rest, unit };
      let teacherId = draft.id;
      if (draft.id) {
        await dbUpdate("teachers", draft.id, payload);
      } else {
        const res = await dbInsert("teachers", payload) as any;
        teacherId = res?.id;
      }

      const existingIds = tsMap[teacherId] ?? [];
      const toAdd = draftSubjectIds.filter((sid) => !existingIds.includes(sid));
      const toRemove = existingIds.filter((sid) => !draftSubjectIds.includes(sid));
      if (toAdd.length) {
        await supabase.from("teacher_subjects" as any).insert(toAdd.map((sid) => ({ teacher_id: teacherId, subject_id: sid })));
      }
      if (toRemove.length) {
        for (const sid of toRemove) {
          await supabase.from("teacher_subjects" as any).delete().eq("teacher_id", teacherId).eq("subject_id", sid);
        }
      }

      const prevWaliClass = classes.find((c: any) => c.wali_kelas_id === teacherId);
      if (prevWaliClass && prevWaliClass.id !== draftWaliKelasId) {
        await dbUpdate("classes", prevWaliClass.id, { wali_kelas_id: null });
      }
      if (draftWaliKelasId) {
        await dbUpdate("classes", draftWaliKelasId, { wali_kelas_id: teacherId });
      }

      toast.success("Data berhasil disimpan");
      setOpen(false);
      refetch();
      refetchTS();
    } catch {} finally { setSaving(false); }
  };

  const subjectName = (id: string) => subjects.find((s: any) => s.id === id)?.nama ?? "";

  return (
    <div className="space-y-6">
      <PageHeader title={`Guru & Staff ${info.short}`} subtitle={`${teachers.length} guru terdaftar`} action={
        writable ? <Button onClick={openNew} className="gradient-primary text-primary-foreground"><Plus className="mr-2 h-4 w-4" /> Tambah Guru</Button> : undefined
      } />

      <SearchBar value={q} onChange={setQ} placeholder="Cari nama, NIP, jabatan..." className="max-w-sm" />

      {fetching && teachers.length === 0 ? <SkeletonCards count={3} /> : (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((g: any) => {
          const isWali = !!waliMap[g.id];
          const guruMapels = (tsMap[g.id] ?? []).map(subjectName).filter(Boolean);
          return (
          <Card key={g.id} className="rounded-2xl border-0 shadow-soft">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14 ring-2 ring-secondary/40">
                  <AvatarFallback className="gradient-primary font-bold text-primary-foreground">{g.nama.split(" ").slice(0, 2).map((s: string) => s[0]).join("")}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{g.nama}</p>
                  <p className="text-xs text-muted-foreground">NIP {g.nip ?? "-"}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {isWali && <Badge className="bg-success text-primary-foreground">Wali Kelas {waliMap[g.id]}</Badge>}
                    {guruMapels.length > 0 && <Badge className="bg-primary/80 text-primary-foreground">Guru Mapel</Badge>}
                  </div>
                </div>
              </div>
              {guruMapels.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {guruMapels.map((m) => <Badge key={m} variant="outline" className="text-xs">{m}</Badge>)}
                </div>
              )}
              <div className="mt-4 space-y-2 border-t border-border/60 pt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><UserCog className="h-4 w-4" />{g.jabatan ?? "-"}</div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4" />{g.telepon ?? "-"}</div>
                <div className="flex items-center gap-2"><Mail className="h-4 w-4" />{g.email ?? "-"}</div>
              </div>
              {writable && (
                <div className="mt-3 flex gap-1">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(g)}><Pencil className="mr-1 h-3.5 w-3.5" /> Edit</Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => confirm({ title: "Hapus Guru", description: `Yakin ingin menghapus "${g.nama}"?`, variant: "danger", confirmLabel: "Ya, hapus", onConfirm: async () => { await dbDelete("teachers", g.id); toast.success("Guru berhasil dihapus"); refetch(); refetchTS(); } })}><Trash2 className="h-4 w-4" /></Button>
                </div>
              )}
            </CardContent>
          </Card>
          );
        })}
        {filtered.length === 0 && <p className="col-span-full py-12 text-center text-muted-foreground">{dq ? "Data tidak ditemukan" : "Belum ada guru"}</p>}
      </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{draft.id ? "Edit" : "Tambah"} Guru</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            {[["nama", "Nama"], ["nip", "NIP"], ["jabatan", "Jabatan"], ["telepon", "Telepon"], ["email", "Email"]].map(([k, l]) => (
              <div key={k} className="space-y-1.5"><Label>{l}</Label><Input value={draft[k] ?? ""} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} /></div>
            ))}
            <div className="space-y-1.5">
              <Label>Wali Kelas</Label>
              <Select value={draftWaliKelasId ?? "none"} onValueChange={(v) => setDraftWaliKelasId(v === "none" ? null : v)}>
                <SelectTrigger><SelectValue placeholder="Pilih kelas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">- Bukan Wali Kelas -</SelectItem>
                  {classes.map((c: any) => {
                    const taken = c.wali_kelas_id && c.wali_kelas_id !== draft.id;
                    return <SelectItem key={c.id} value={c.id} disabled={!!taken}>{c.nama}{taken ? " (sudah ada wali)" : ""}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> Mata Pelajaran yang Diajar</Label>
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-border p-3 max-h-40 overflow-y-auto">
              {subjects.length === 0 && <p className="col-span-2 text-xs text-muted-foreground">Belum ada mapel</p>}
              {subjects.map((s: any) => (
                <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox
                    checked={draftSubjectIds.includes(s.id)}
                    onCheckedChange={(checked) => {
                      setDraftSubjectIds((prev) =>
                        checked ? [...prev, s.id] : prev.filter((id) => id !== s.id)
                      );
                    }}
                  />
                  {s.nama}
                </label>
              ))}
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Batal</Button><ButtonLoading onClick={submit} loading={saving} loadingText="Menyimpan..." className="gradient-primary text-primary-foreground">Simpan</ButtonLoading></DialogFooter>
        </DialogContent>
      </Dialog>
      {dialogProps && <ConfirmDialog {...dialogProps} />}
    </div>
  );
}
