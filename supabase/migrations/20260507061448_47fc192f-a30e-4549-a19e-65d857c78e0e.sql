
-- Helper: any admin (super or unit admin)
CREATE OR REPLACE FUNCTION public.is_any_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin','admin_mi','admin_smp','admin_smk','admin_madrasah','admin_tk')
  )
$$;

-- Replace storage policies for media buckets to allow any admin
DROP POLICY IF EXISTS "super admin delete cms media" ON storage.objects;
DROP POLICY IF EXISTS "super admin update cms media" ON storage.objects;
DROP POLICY IF EXISTS "super admin write cms media" ON storage.objects;
DROP POLICY IF EXISTS "super admin upload cms-media" ON storage.objects;
DROP POLICY IF EXISTS "super admin update cms-media" ON storage.objects;
DROP POLICY IF EXISTS "super admin delete cms-media" ON storage.objects;
DROP POLICY IF EXISTS "super admin upload hero" ON storage.objects;
DROP POLICY IF EXISTS "super admin update hero" ON storage.objects;
DROP POLICY IF EXISTS "super admin delete hero" ON storage.objects;
DROP POLICY IF EXISTS "super admin upload galeri" ON storage.objects;
DROP POLICY IF EXISTS "super admin update galeri" ON storage.objects;
DROP POLICY IF EXISTS "super admin delete galeri" ON storage.objects;

CREATE POLICY "admins insert media buckets" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('cms-media','hero','galeri') AND public.is_any_admin(auth.uid()));
CREATE POLICY "admins update media buckets" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id IN ('cms-media','hero','galeri') AND public.is_any_admin(auth.uid()));
CREATE POLICY "admins delete media buckets" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('cms-media','hero','galeri') AND public.is_any_admin(auth.uid()));
