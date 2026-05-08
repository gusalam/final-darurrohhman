
ALTER TABLE public.hero_settings
  ADD COLUMN IF NOT EXISTS intro_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS intro_logo_url text,
  ADD COLUMN IF NOT EXISTS intro_text text DEFAULT 'Yayasan Darur Rohman Morombuh',
  ADD COLUMN IF NOT EXISTS intro_duration_ms integer NOT NULL DEFAULT 2500;
