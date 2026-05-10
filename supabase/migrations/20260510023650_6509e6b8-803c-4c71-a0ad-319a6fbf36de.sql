
ALTER TABLE public.cms_pages
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS meta_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS keywords text,
  ADD COLUMN IF NOT EXISTS og_image_url text;

CREATE INDEX IF NOT EXISTS idx_cms_pages_sort_order ON public.cms_pages(sort_order);
CREATE INDEX IF NOT EXISTS idx_cms_pages_slug ON public.cms_pages(slug);

INSERT INTO public.cms_pages (slug, title, content, is_published, sort_order, meta_title, meta_description, keywords)
VALUES
  ('visi', 'Visi', E'Menjadi yayasan pendidikan Islam terpadu yang unggul dalam membentuk generasi Qur''ani, cerdas, mandiri, dan berakhlak mulia di lingkungan Morombuh, Kwanyar, Bangkalan.\n\nMewujudkan lulusan yang menguasai ilmu agama dan ilmu pengetahuan secara seimbang serta siap menghadapi tantangan zaman.', true, 1,
    'Visi Yayasan Darur Rohman Morombuh Kwanyar',
    'Visi Yayasan Darur Rohman: membentuk generasi Qur''ani, cerdas, mandiri, dan berakhlak mulia di Morombuh Kwanyar Bangkalan.',
    'visi yayasan darul rohman, visi ponpes darurrahman morombuh, pendidikan islam kwanyar bangkalan'),
  ('misi', 'Misi', E'1. Menyelenggarakan pendidikan Islam terpadu dari jenjang TK, MI, SMP, SMK, dan Madrasah Diniyah.\n2. Menanamkan nilai-nilai Qur''an, akhlakul karimah, dan kemandirian sejak dini.\n3. Mengembangkan potensi akademik dan non-akademik peserta didik secara optimal.\n4. Membangun kemitraan dengan masyarakat, orang tua, dan pemerintah dalam mewujudkan pendidikan berkualitas.\n5. Membentuk lulusan yang siap berkontribusi bagi agama, bangsa, dan negara.', true, 2,
    'Misi Yayasan Darur Rohman Morombuh Kwanyar',
    'Lima misi Yayasan Darur Rohman menyelenggarakan pendidikan Islam terpadu dari TK hingga SMK di Morombuh Kwanyar.',
    'misi yayasan darul rohman, misi ponpes darurrahman, pendidikan terpadu morombuh'),
  ('profil', 'Profil Yayasan', E'Yayasan Darur Rohman Morombuh Kwanyar adalah lembaga pendidikan Islam yang berlokasi di Desa Morombuh, Kecamatan Kwanyar, Kabupaten Bangkalan, Jawa Timur.\n\nYayasan ini menaungi lima unit pendidikan: MI An-Nuriyah, SMP Darul Rohman, SMK Darul Rohman, Madrasah Diniyah Al Arsyadiyah, dan TK PGRI 02 Roudlotul Huffadz.\n\nDengan komitmen pada nilai-nilai Islam dan keunggulan akademik, yayasan terus berkembang sebagai pusat pendidikan terpadu di wilayah Madura.', true, 3,
    'Profil Yayasan Darur Rohman Morombuh Kwanyar',
    'Profil Yayasan Darur Rohman Morombuh Kwanyar Bangkalan, menaungi MI, SMP, SMK, Madrasah Diniyah, dan TK.',
    'profil yayasan darul rohman, ponpes darurrahman morombuh kwanyar, sejarah yayasan')
ON CONFLICT (slug) DO NOTHING;
