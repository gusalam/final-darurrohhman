
CREATE TABLE IF NOT EXISTS public.hero_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  badge_text text DEFAULT 'Sistem Terpadu Pendidikan',
  title text DEFAULT 'Membentuk Generasi Qur''ani, Cerdas & Berakhlak Mulia',
  description text DEFAULT 'Yayasan Darul Rohman menyelenggarakan pendidikan Islam terpadu MI, SMP, SMK, Madrasah Diniyah, dan TK.',
  button_primary_text text DEFAULT 'Jelajahi Unit',
  button_primary_link text DEFAULT '#unit',
  button_secondary_text text DEFAULT 'Hubungi Kami',
  button_secondary_link text DEFAULT '#kontak',
  background_type text NOT NULL DEFAULT 'image',
  background_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hero_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read hero settings" ON public.hero_settings
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "super admin manage hero settings" ON public.hero_settings
  FOR ALL TO authenticated
  USING (is_super_admin(auth.uid()))
  WITH CHECK (is_super_admin(auth.uid()));

CREATE TRIGGER update_hero_settings_updated_at
  BEFORE UPDATE ON public.hero_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.hero_settings (singleton) VALUES (true) ON CONFLICT DO NOTHING;

ALTER PUBLICATION supabase_realtime ADD TABLE public.hero_settings;
