
DO $$
DECLARE
  units public.unit_key[] := ARRAY['mi','smp','smk']::public.unit_key[];
  u public.unit_key;
  i int; j int;
  nama_depan text[] := ARRAY['Ahmad','Siti','Muhammad','Fatimah','Abdul','Aisyah','Umar','Khadijah','Ali','Zainab','Hasan','Husein','Yusuf','Maryam','Ibrahim','Hawa','Ismail','Ruqayyah','Bilal','Sumayyah','Hamzah','Safiyyah','Khalid','Halimah','Salman','Asma','Anas','Hafsah','Zaid','Rahmah'];
  nama_belakang text[] := ARRAY['Saputra','Wijaya','Pratama','Santoso','Hidayat','Rahman','Kurniawan','Setiawan','Maulana','Firmansyah','Ramadhan','Nugroho','Permana','Wibowo','Sinaga','Lestari','Anggraini','Putri','Cahyani','Safitri'];
  jk text[] := ARRAY['L','P'];
  hari_arr text[] := ARRAY['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  status_abs text[] := ARRAY['hadir','hadir','hadir','hadir','izin','sakit','alpa'];
  jenis_nilai text[] := ARRAY['harian','uts','uas','tugas'];
  mapel_list text[];
  tingkat_list text[];
  sid uuid;
BEGIN
  -- TEACHERS
  FOREACH u IN ARRAY units LOOP
    FOR i IN 1..60 LOOP
      INSERT INTO public.teachers (nama, nip, email, telepon, unit, jabatan, mapel_utama)
      VALUES (
        nama_depan[1+(i % array_length(nama_depan,1))]||' '||nama_belakang[1+(i % array_length(nama_belakang,1))],
        '19'||lpad((70+(i%30))::text,2,'0')||lpad(((i*7)%12+1)::text,2,'0')||lpad(((i*3)%28+1)::text,2,'0')||lpad((1000+i)::text,4,'0')||u,
        'guru'||u||i||'.'||floor(random()*10000)::text||'@darulrohman.sch.id',
        '08'||lpad((100000000+i*137)::text,10,'0'),
        u,
        (ARRAY['Guru','Wali Kelas','Kepala Sekolah','Wakasek','Staff TU','Staff Perpustakaan'])[1+(i%6)],
        (ARRAY['Matematika','Bahasa Indonesia','Bahasa Inggris','IPA','IPS','PAI','PKn','Seni Budaya','PJOK','Prakarya'])[1+(i%10)]
      );
    END LOOP;
  END LOOP;

  -- SUBJECTS
  FOREACH u IN ARRAY units LOOP
    IF u = 'smk' THEN
      mapel_list := ARRAY['Matematika','Bahasa Indonesia','Bahasa Inggris','PAI','PKn','Sejarah','PJOK','Seni Budaya','Pemrograman Dasar','Sistem Komputer','Jaringan Dasar','Basis Data','Pemrograman Web','Desain Grafis','Multimedia','Kewirausahaan','Fisika','Kimia','Produk Kreatif','Bahasa Jepang'];
    ELSIF u = 'smp' THEN
      mapel_list := ARRAY['Matematika','Bahasa Indonesia','Bahasa Inggris','IPA','IPS','PAI','PKn','Seni Budaya','PJOK','Prakarya','TIK','Bahasa Arab','Bahasa Daerah','Tahfidz','BK','Mulok','Fiqih','Akidah Akhlak','SKI','Quran Hadits'];
    ELSE
      mapel_list := ARRAY['Matematika','Bahasa Indonesia','Bahasa Inggris','IPA','IPS','PAI','PKn','SBdP','PJOK','Bahasa Arab','Tahfidz','Quran Hadits','Fiqih','Akidah Akhlak','SKI','Mulok','BTQ','Tematik','Kaligrafi','Tilawah'];
    END IF;
    FOR i IN 1..array_length(mapel_list,1) LOOP
      INSERT INTO public.subjects (nama, kode, unit, guru_id)
      VALUES (
        mapel_list[i],
        upper(left(regexp_replace(mapel_list[i],'[^a-zA-Z]','','g'),3))||'-'||u||'-'||i||'-'||floor(random()*10000)::text,
        u,
        (SELECT id FROM public.teachers WHERE unit=u ORDER BY random() LIMIT 1)
      );
    END LOOP;
  END LOOP;

  -- CLASSES
  FOREACH u IN ARRAY units LOOP
    IF u = 'mi' THEN tingkat_list := ARRAY['1','2','3','4','5','6'];
    ELSIF u = 'smp' THEN tingkat_list := ARRAY['7','8','9'];
    ELSE tingkat_list := ARRAY['10','11','12'];
    END IF;
    FOR i IN 1..array_length(tingkat_list,1) LOOP
      FOR j IN 1..7 LOOP
        INSERT INTO public.classes (nama, tingkat, unit, wali_kelas_id, tahun_ajaran)
        VALUES (
          tingkat_list[i]||'-'||chr(64+j)||'-'||floor(random()*1000)::text,
          tingkat_list[i],
          u,
          (SELECT id FROM public.teachers WHERE unit=u ORDER BY random() LIMIT 1),
          '2025/2026'
        );
      END LOOP;
    END LOOP;
  END LOOP;

  -- STUDENTS
  FOREACH u IN ARRAY units LOOP
    FOR i IN 1..60 LOOP
      INSERT INTO public.students (nama, nis, nisn, jenis_kelamin, tanggal_lahir, alamat, nama_wali, telepon_wali, kelas_id, unit, status)
      VALUES (
        nama_depan[1+((i*3) % array_length(nama_depan,1))]||' '||nama_belakang[1+((i*5) % array_length(nama_belakang,1))],
        u||lpad((10000+i)::text,5,'0')||floor(random()*1000)::text,
        lpad((1000000000+(i*7919)+floor(random()*100000)::int)::text,10,'0'),
        jk[1+(i%2)],
        DATE '2010-01-01' + ((i*13)%3000),
        'Jl. Merdeka No.'||i||', Kab. Sumedang',
        'Bapak '||nama_belakang[1+(i%array_length(nama_belakang,1))],
        '08'||lpad((200000000+i*231)::text,10,'0'),
        (SELECT id FROM public.classes WHERE unit=u ORDER BY random() LIMIT 1),
        u,
        'aktif'
      );
    END LOOP;
  END LOOP;

  -- SCHEDULES
  FOREACH u IN ARRAY units LOOP
    FOR i IN 1..60 LOOP
      INSERT INTO public.schedules (kelas_id, subject_id, guru_id, hari, jam_mulai, jam_selesai, ruangan, unit)
      VALUES (
        (SELECT id FROM public.classes WHERE unit=u ORDER BY random() LIMIT 1),
        (SELECT id FROM public.subjects WHERE unit=u ORDER BY random() LIMIT 1),
        (SELECT id FROM public.teachers WHERE unit=u ORDER BY random() LIMIT 1),
        hari_arr[1+(i%6)],
        (TIME '07:00:00' + ((i%8)*INTERVAL '45 minutes')),
        (TIME '07:45:00' + ((i%8)*INTERVAL '45 minutes')),
        'R-'||(100+(i%20)),
        u
      );
    END LOOP;
  END LOOP;

  -- ATTENDANCE: random student + random date, dedupe via ON CONFLICT
  FOREACH u IN ARRAY units LOOP
    FOR i IN 1..120 LOOP
      SELECT id INTO sid FROM public.students WHERE unit=u ORDER BY random() LIMIT 1;
      INSERT INTO public.attendance (student_id, tanggal, status, catatan, unit)
      VALUES (
        sid,
        CURRENT_DATE - (floor(random()*60)::int),
        status_abs[1+(i%array_length(status_abs,1))],
        CASE WHEN i%5=0 THEN 'Tanpa keterangan' ELSE NULL END,
        u
      )
      ON CONFLICT (student_id, tanggal) DO NOTHING;
    END LOOP;
  END LOOP;

  -- GRADES
  FOREACH u IN ARRAY units LOOP
    FOR i IN 1..60 LOOP
      INSERT INTO public.grades (student_id, subject_id, nilai, jenis, semester, tahun_ajaran, catatan, unit)
      VALUES (
        (SELECT id FROM public.students WHERE unit=u ORDER BY random() LIMIT 1),
        (SELECT id FROM public.subjects WHERE unit=u ORDER BY random() LIMIT 1),
        70 + (random()*30)::int,
        jenis_nilai[1+(i%4)],
        (ARRAY['Ganjil','Genap'])[1+(i%2)],
        '2025/2026',
        CASE WHEN i%7=0 THEN 'Perlu remedial' ELSE NULL END,
        u
      );
    END LOOP;
  END LOOP;

  -- RAPORT
  FOREACH u IN ARRAY units LOOP
    FOR i IN 1..60 LOOP
      INSERT INTO public.grades (student_id, subject_id, nilai, jenis, semester, tahun_ajaran, catatan, unit)
      VALUES (
        (SELECT id FROM public.students WHERE unit=u ORDER BY random() LIMIT 1),
        (SELECT id FROM public.subjects WHERE unit=u ORDER BY random() LIMIT 1),
        75 + (random()*25)::int,
        'raport',
        (ARRAY['Ganjil','Genap'])[1+(i%2)],
        '2025/2026',
        'Nilai akhir raport',
        u
      );
    END LOOP;
  END LOOP;
END $$;
