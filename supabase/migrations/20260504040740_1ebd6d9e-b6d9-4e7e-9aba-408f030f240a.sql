
-- Junction table: guru ↔ mata pelajaran (many-to-many)
CREATE TABLE public.teacher_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(teacher_id, subject_id)
);

CREATE INDEX idx_teacher_subjects_teacher ON public.teacher_subjects(teacher_id);
CREATE INDEX idx_teacher_subjects_subject ON public.teacher_subjects(subject_id);

ALTER TABLE public.teacher_subjects ENABLE ROW LEVEL SECURITY;

-- RLS: view if can access unit of the teacher
CREATE POLICY "view teacher_subjects"
  ON public.teacher_subjects FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers t
      WHERE t.id = teacher_id AND public.can_access_unit(t.unit)
    )
  );

CREATE POLICY "insert teacher_subjects"
  ON public.teacher_subjects FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teachers t
      WHERE t.id = teacher_id AND public.can_write_unit(t.unit)
    )
  );

CREATE POLICY "delete teacher_subjects"
  ON public.teacher_subjects FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teachers t
      WHERE t.id = teacher_id AND public.can_write_unit(t.unit)
    )
  );
