DROP POLICY IF EXISTS "admins update ppdb in own unit" ON public.ppdb_applications;
DROP POLICY IF EXISTS "admins delete ppdb in own unit" ON public.ppdb_applications;

CREATE POLICY "unit admin update ppdb in own unit"
ON public.ppdb_applications
FOR UPDATE TO authenticated
USING (public.can_write_unit(unit))
WITH CHECK (public.can_write_unit(unit));

CREATE POLICY "unit admin delete ppdb in own unit"
ON public.ppdb_applications
FOR DELETE TO authenticated
USING (public.can_write_unit(unit));