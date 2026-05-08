
-- 1. Create can_write_unit function (excludes super_admin)
CREATE OR REPLACE FUNCTION public.can_write_unit(_unit unit_key)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND (
        (_unit = 'mi'  AND ur.role = 'admin_mi')  OR
        (_unit = 'smp' AND ur.role = 'admin_smp') OR
        (_unit = 'smk' AND ur.role = 'admin_smk')
      )
  )
$$;

-- 2. Update INSERT/UPDATE/DELETE policies on all 8 unit tables to use can_write_unit

-- students
DROP POLICY IF EXISTS "insert students in own unit" ON public.students;
CREATE POLICY "insert students in own unit" ON public.students FOR INSERT TO authenticated WITH CHECK (can_write_unit(unit));
DROP POLICY IF EXISTS "update students in own unit" ON public.students;
CREATE POLICY "update students in own unit" ON public.students FOR UPDATE TO authenticated USING (can_write_unit(unit));
DROP POLICY IF EXISTS "delete students in own unit" ON public.students;
CREATE POLICY "delete students in own unit" ON public.students FOR DELETE TO authenticated USING (can_write_unit(unit));

-- classes
DROP POLICY IF EXISTS "insert classes in own unit" ON public.classes;
CREATE POLICY "insert classes in own unit" ON public.classes FOR INSERT TO authenticated WITH CHECK (can_write_unit(unit));
DROP POLICY IF EXISTS "update classes in own unit" ON public.classes;
CREATE POLICY "update classes in own unit" ON public.classes FOR UPDATE TO authenticated USING (can_write_unit(unit));
DROP POLICY IF EXISTS "delete classes in own unit" ON public.classes;
CREATE POLICY "delete classes in own unit" ON public.classes FOR DELETE TO authenticated USING (can_write_unit(unit));

-- teachers
DROP POLICY IF EXISTS "insert teachers in own unit" ON public.teachers;
CREATE POLICY "insert teachers in own unit" ON public.teachers FOR INSERT TO authenticated WITH CHECK (can_write_unit(unit));
DROP POLICY IF EXISTS "update teachers in own unit" ON public.teachers;
CREATE POLICY "update teachers in own unit" ON public.teachers FOR UPDATE TO authenticated USING (can_write_unit(unit));
DROP POLICY IF EXISTS "delete teachers in own unit" ON public.teachers;
CREATE POLICY "delete teachers in own unit" ON public.teachers FOR DELETE TO authenticated USING (can_write_unit(unit));

-- attendance
DROP POLICY IF EXISTS "insert attendance in own unit" ON public.attendance;
CREATE POLICY "insert attendance in own unit" ON public.attendance FOR INSERT TO authenticated WITH CHECK (can_write_unit(unit));
DROP POLICY IF EXISTS "update attendance in own unit" ON public.attendance;
CREATE POLICY "update attendance in own unit" ON public.attendance FOR UPDATE TO authenticated USING (can_write_unit(unit));
DROP POLICY IF EXISTS "delete attendance in own unit" ON public.attendance;
CREATE POLICY "delete attendance in own unit" ON public.attendance FOR DELETE TO authenticated USING (can_write_unit(unit));

-- grades
DROP POLICY IF EXISTS "insert grades in own unit" ON public.grades;
CREATE POLICY "insert grades in own unit" ON public.grades FOR INSERT TO authenticated WITH CHECK (can_write_unit(unit));
DROP POLICY IF EXISTS "update grades in own unit" ON public.grades;
CREATE POLICY "update grades in own unit" ON public.grades FOR UPDATE TO authenticated USING (can_write_unit(unit));
DROP POLICY IF EXISTS "delete grades in own unit" ON public.grades;
CREATE POLICY "delete grades in own unit" ON public.grades FOR DELETE TO authenticated USING (can_write_unit(unit));

-- payments
DROP POLICY IF EXISTS "insert payments in own unit" ON public.payments;
CREATE POLICY "insert payments in own unit" ON public.payments FOR INSERT TO authenticated WITH CHECK (can_write_unit(unit));
DROP POLICY IF EXISTS "update payments in own unit" ON public.payments;
CREATE POLICY "update payments in own unit" ON public.payments FOR UPDATE TO authenticated USING (can_write_unit(unit));
DROP POLICY IF EXISTS "delete payments in own unit" ON public.payments;
CREATE POLICY "delete payments in own unit" ON public.payments FOR DELETE TO authenticated USING (can_write_unit(unit));

-- schedules
DROP POLICY IF EXISTS "insert schedules in own unit" ON public.schedules;
CREATE POLICY "insert schedules in own unit" ON public.schedules FOR INSERT TO authenticated WITH CHECK (can_write_unit(unit));
DROP POLICY IF EXISTS "update schedules in own unit" ON public.schedules;
CREATE POLICY "update schedules in own unit" ON public.schedules FOR UPDATE TO authenticated USING (can_write_unit(unit));
DROP POLICY IF EXISTS "delete schedules in own unit" ON public.schedules;
CREATE POLICY "delete schedules in own unit" ON public.schedules FOR DELETE TO authenticated USING (can_write_unit(unit));

-- subjects
DROP POLICY IF EXISTS "insert subjects in own unit" ON public.subjects;
CREATE POLICY "insert subjects in own unit" ON public.subjects FOR INSERT TO authenticated WITH CHECK (can_write_unit(unit));
DROP POLICY IF EXISTS "update subjects in own unit" ON public.subjects;
CREATE POLICY "update subjects in own unit" ON public.subjects FOR UPDATE TO authenticated USING (can_write_unit(unit));
DROP POLICY IF EXISTS "delete subjects in own unit" ON public.subjects;
CREATE POLICY "delete subjects in own unit" ON public.subjects FOR DELETE TO authenticated USING (can_write_unit(unit));
