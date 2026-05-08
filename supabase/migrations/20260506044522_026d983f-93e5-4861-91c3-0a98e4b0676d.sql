CREATE OR REPLACE FUNCTION public.can_access_unit(_unit unit_key)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.is_super_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND (
          (_unit = 'mi'       AND ur.role = 'admin_mi')       OR
          (_unit = 'smp'      AND ur.role = 'admin_smp')      OR
          (_unit = 'smk'      AND ur.role = 'admin_smk')      OR
          (_unit = 'madrasah' AND ur.role = 'admin_madrasah') OR
          (_unit = 'tk'       AND ur.role = 'admin_tk')
        )
    )
$$;

CREATE OR REPLACE FUNCTION public.can_write_unit(_unit unit_key)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND (
        (_unit = 'mi'       AND ur.role = 'admin_mi')       OR
        (_unit = 'smp'      AND ur.role = 'admin_smp')      OR
        (_unit = 'smk'      AND ur.role = 'admin_smk')      OR
        (_unit = 'madrasah' AND ur.role = 'admin_madrasah') OR
        (_unit = 'tk'       AND ur.role = 'admin_tk')
      )
  )
$$;