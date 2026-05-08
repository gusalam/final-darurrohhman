
-- Public read policies so the homepage (anon) can display the jadwal
CREATE POLICY "public read schedules" ON public.schedules FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read classes" ON public.classes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read subjects" ON public.subjects FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read teachers" ON public.teachers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public read teacher_subjects" ON public.teacher_subjects FOR SELECT TO anon, authenticated USING (true);

-- Ensure realtime publication includes these tables
ALTER TABLE public.schedules REPLICA IDENTITY FULL;
ALTER TABLE public.classes REPLICA IDENTITY FULL;
ALTER TABLE public.subjects REPLICA IDENTITY FULL;
ALTER TABLE public.teachers REPLICA IDENTITY FULL;
ALTER TABLE public.teacher_subjects REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.schedules; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.classes; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.subjects; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.teachers; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.teacher_subjects; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;
