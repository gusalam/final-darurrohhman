-- =========================================================
-- 1. site_settings (singleton)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  nama_yayasan text NOT NULL DEFAULT 'Yayasan Darul Rohman',
  tagline text,
  alamat text,
  telepon text,
  email text,
  deskripsi text,
  deskripsi_mi text,
  deskripsi_smp text,
  deskripsi_smk text,
  hero_image_url text,
  hero_title text,
  hero_subtitle text,
  youtube_url text,
  map_embed text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public read site settings" ON public.site_settings;
CREATE POLICY "public read site settings" ON public.site_settings
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "super admin manage site settings" ON public.site_settings;
CREATE POLICY "super admin manage site settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

DROP TRIGGER IF EXISTS site_settings_updated_at ON public.site_settings;
CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- 2. cms_pages enrichment
-- =========================================================
ALTER TABLE public.cms_pages
  ADD COLUMN IF NOT EXISTS cover_url text,
  ADD COLUMN IF NOT EXISTS gallery_urls text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS youtube_url text,
  ADD COLUMN IF NOT EXISTS map_embed text;

DROP TRIGGER IF EXISTS cms_pages_updated_at ON public.cms_pages;
CREATE TRIGGER cms_pages_updated_at
  BEFORE UPDATE ON public.cms_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- 3. cms_posts: unit + auto published_at
-- =========================================================
ALTER TABLE public.cms_posts
  ADD COLUMN IF NOT EXISTS unit text;

CREATE OR REPLACE FUNCTION public.cms_posts_set_published_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status = 'published' AND OLD.status IS DISTINCT FROM 'published' THEN
    NEW.published_at = now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS cms_posts_pub_trg ON public.cms_posts;
CREATE TRIGGER cms_posts_pub_trg
  BEFORE UPDATE ON public.cms_posts
  FOR EACH ROW EXECUTE FUNCTION public.cms_posts_set_published_at();

DROP TRIGGER IF EXISTS cms_posts_updated_at ON public.cms_posts;
CREATE TRIGGER cms_posts_updated_at
  BEFORE UPDATE ON public.cms_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- 4. updated_at triggers untuk semua tabel domain
-- =========================================================
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['students','teachers','classes','subjects','schedules','grades','attendance','payments','ppdb_applications','cms_banners','profiles']) LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I_updated_at ON public.%I', t, t);
    EXECUTE format('CREATE TRIGGER %I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t, t);
  END LOOP;
END $$;

-- =========================================================
-- 5. Storage buckets baru: hero & galeri (publik)
-- =========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('hero', 'hero', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('galeri', 'galeri', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public read + super admin manage untuk hero, galeri, cms-media
DO $$
DECLARE b text;
BEGIN
  FOR b IN SELECT unnest(ARRAY['hero','galeri','cms-media']) LOOP
    EXECUTE format($f$DROP POLICY IF EXISTS "public read %s" ON storage.objects$f$, b);
    EXECUTE format($f$CREATE POLICY "public read %s" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = %L)$f$, b, b);

    EXECUTE format($f$DROP POLICY IF EXISTS "super admin upload %s" ON storage.objects$f$, b);
    EXECUTE format($f$CREATE POLICY "super admin upload %s" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = %L AND public.is_super_admin(auth.uid()))$f$, b, b);

    EXECUTE format($f$DROP POLICY IF EXISTS "super admin update %s" ON storage.objects$f$, b);
    EXECUTE format($f$CREATE POLICY "super admin update %s" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = %L AND public.is_super_admin(auth.uid()))$f$, b, b);

    EXECUTE format($f$DROP POLICY IF EXISTS "super admin delete %s" ON storage.objects$f$, b);
    EXECUTE format($f$CREATE POLICY "super admin delete %s" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = %L AND public.is_super_admin(auth.uid()))$f$, b, b);
  END LOOP;
END $$;

-- ppdb-docs: anyone may upload (PPDB form); super admin & unit admin may read
DROP POLICY IF EXISTS "anyone upload ppdb docs" ON storage.objects;
CREATE POLICY "anyone upload ppdb docs" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'ppdb-docs');

DROP POLICY IF EXISTS "admins read ppdb docs" ON storage.objects;
CREATE POLICY "admins read ppdb docs" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'ppdb-docs');

-- =========================================================
-- 6. Realtime: enable replication identity full + add to publication
-- =========================================================
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['students','teachers','classes','subjects','schedules','grades','attendance','payments','ppdb_applications','cms_posts','cms_pages','cms_banners','site_settings','profiles','user_roles']) LOOP
    EXECUTE format('ALTER TABLE public.%I REPLICA IDENTITY FULL', t);
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END LOOP;
END $$;

-- =========================================================
-- 7. Seed 4 akun admin di auth.users + profiles + user_roles
-- =========================================================
DO $$
DECLARE
  v_super uuid := gen_random_uuid();
  v_mi    uuid := gen_random_uuid();
  v_smp   uuid := gen_random_uuid();
  v_smk   uuid := gen_random_uuid();
  v_pwd   text := crypt('admin123', gen_salt('bf'));
BEGIN
  -- super admin
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'superadmin@darulrohman.id') THEN
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
    VALUES (v_super, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'superadmin@darulrohman.id', v_pwd, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('nama','K.H. Abdul Rohman'), now(), now(), '', '', '', '');
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_super, v_super::text, jsonb_build_object('sub', v_super::text, 'email', 'superadmin@darulrohman.id'), 'email', now(), now(), now());
    INSERT INTO public.profiles (id, email, nama, unit) VALUES (v_super, 'superadmin@darulrohman.id', 'K.H. Abdul Rohman', NULL)
      ON CONFLICT (id) DO NOTHING;
    INSERT INTO public.user_roles (user_id, role) VALUES (v_super, 'super_admin') ON CONFLICT DO NOTHING;
  END IF;

  -- admin MI
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'mi@darulrohman.id') THEN
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
    VALUES (v_mi, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mi@darulrohman.id', v_pwd, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('nama','Ust. Hasan Basri','unit','mi'), now(), now(), '', '', '', '');
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_mi, v_mi::text, jsonb_build_object('sub', v_mi::text, 'email', 'mi@darulrohman.id'), 'email', now(), now(), now());
    INSERT INTO public.profiles (id, email, nama, unit) VALUES (v_mi, 'mi@darulrohman.id', 'Ust. Hasan Basri', 'mi'::unit_key)
      ON CONFLICT (id) DO NOTHING;
    INSERT INTO public.user_roles (user_id, role) VALUES (v_mi, 'admin_mi') ON CONFLICT DO NOTHING;
  END IF;

  -- admin SMP
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'smp@darulrohman.id') THEN
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
    VALUES (v_smp, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'smp@darulrohman.id', v_pwd, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('nama','Drs. Sutrisno, M.Pd','unit','smp'), now(), now(), '', '', '', '');
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_smp, v_smp::text, jsonb_build_object('sub', v_smp::text, 'email', 'smp@darulrohman.id'), 'email', now(), now(), now());
    INSERT INTO public.profiles (id, email, nama, unit) VALUES (v_smp, 'smp@darulrohman.id', 'Drs. Sutrisno, M.Pd', 'smp'::unit_key)
      ON CONFLICT (id) DO NOTHING;
    INSERT INTO public.user_roles (user_id, role) VALUES (v_smp, 'admin_smp') ON CONFLICT DO NOTHING;
  END IF;

  -- admin SMK
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'smk@darulrohman.id') THEN
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change)
    VALUES (v_smk, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'smk@darulrohman.id', v_pwd, now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('nama','Andi Pratama, M.Kom','unit','smk'), now(), now(), '', '', '', '');
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_smk, v_smk::text, jsonb_build_object('sub', v_smk::text, 'email', 'smk@darulrohman.id'), 'email', now(), now(), now());
    INSERT INTO public.profiles (id, email, nama, unit) VALUES (v_smk, 'smk@darulrohman.id', 'Andi Pratama, M.Kom', 'smk'::unit_key)
      ON CONFLICT (id) DO NOTHING;
    INSERT INTO public.user_roles (user_id, role) VALUES (v_smk, 'admin_smk') ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- =========================================================
-- 8. Seed konten awal site_settings + minimal CMS
-- =========================================================
INSERT INTO public.site_settings (singleton, nama_yayasan, tagline, alamat, telepon, email, deskripsi, deskripsi_mi, deskripsi_smp, deskripsi_smk, hero_title, hero_subtitle)
VALUES (
  true,
  'Yayasan Darul Rohman',
  'Membentuk Generasi Qur''ani, Cerdas & Berakhlak Mulia',
  'Morombuh, Kwanyar, Bangkalan, Madura, Jawa Timur',
  '+62 31 0000 0000',
  'info@darulrohman.id',
  'Yayasan Darul Rohman Morombuh Kwanyar adalah lembaga pendidikan Islam terpadu yang menyelenggarakan jenjang MI, SMP, dan SMK.',
  'Madrasah Ibtidaiyah dengan kurikulum terpadu Al-Qur''an, akhlak, dan sains untuk usia 6-12 tahun.',
  'Sekolah Menengah Pertama berbasis pesantren, mempersiapkan siswa siap akademis dan religius.',
  'Sekolah Menengah Kejuruan dengan jurusan RPL & TKJ, link & match dengan industri.',
  'Membentuk Generasi Qur''ani, Cerdas & Berakhlak Mulia',
  'Yayasan Darul Rohman Morombuh Kwanyar — pendidikan Islam terpadu MI, SMP, SMK.'
)
ON CONFLICT (singleton) DO NOTHING;

INSERT INTO public.cms_banners (title, subtitle, cta_label, cta_url, is_active, sort_order)
SELECT 'Selamat Datang di Yayasan Darul Rohman', 'Pendidikan Islam Terpadu di Madura', 'Pelajari Lebih Lanjut', '#unit', true, 1
WHERE NOT EXISTS (SELECT 1 FROM public.cms_banners);

INSERT INTO public.cms_pages (slug, title, content, is_published)
VALUES
  ('tentang', 'Tentang Yayasan', 'Yayasan Darul Rohman Morombuh Kwanyar berdiri dengan misi menyebarkan pendidikan Islam berkualitas di Bangkalan, Madura.', true),
  ('visi-misi', 'Visi & Misi', 'VISI: Menjadi lembaga pendidikan Islam unggulan.\n\nMISI:\n1) Menyelenggarakan pendidikan berbasis Al-Qur''an dan As-Sunnah.\n2) Mengembangkan potensi akademik dan non-akademik siswa.\n3) Membangun karakter islami yang kuat.', true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.cms_posts (slug, title, excerpt, content, category, status, audience, published_at)
VALUES
  ('selamat-datang', 'Selamat Datang di Sistem Yayasan', 'Sistem informasi terpadu Yayasan Darul Rohman kini hadir.', 'Sistem terpadu pendidikan Yayasan Darul Rohman kini aktif untuk seluruh civitas.', 'pengumuman', 'published', 'public', now()),
  ('ppdb-2026', 'Pembukaan PPDB 2026/2027', 'Pendaftaran peserta didik baru telah dibuka.', 'PPDB seluruh unit MI, SMP, dan SMK telah dibuka. Daftarkan putra-putri terbaik Anda.', 'berita', 'published', 'public', now())
ON CONFLICT (slug) DO NOTHING;
