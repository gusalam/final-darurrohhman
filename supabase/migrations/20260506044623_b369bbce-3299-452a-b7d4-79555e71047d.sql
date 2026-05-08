ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS deskripsi_madrasah text,
  ADD COLUMN IF NOT EXISTS deskripsi_tk text;