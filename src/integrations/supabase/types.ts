export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          catatan: string | null
          created_at: string
          id: string
          status: string
          student_id: string
          tanggal: string
          unit: Database["public"]["Enums"]["unit_key"]
          updated_at: string
        }
        Insert: {
          catatan?: string | null
          created_at?: string
          id?: string
          status?: string
          student_id: string
          tanggal?: string
          unit: Database["public"]["Enums"]["unit_key"]
          updated_at?: string
        }
        Update: {
          catatan?: string | null
          created_at?: string
          id?: string
          status?: string
          student_id?: string
          tanggal?: string
          unit?: Database["public"]["Enums"]["unit_key"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          created_at: string
          id: string
          nama: string
          tahun_ajaran: string | null
          tingkat: string | null
          unit: Database["public"]["Enums"]["unit_key"]
          updated_at: string
          wali_kelas_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          nama: string
          tahun_ajaran?: string | null
          tingkat?: string | null
          unit: Database["public"]["Enums"]["unit_key"]
          updated_at?: string
          wali_kelas_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          nama?: string
          tahun_ajaran?: string | null
          tingkat?: string | null
          unit?: Database["public"]["Enums"]["unit_key"]
          updated_at?: string
          wali_kelas_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_wali_kelas_id_fkey"
            columns: ["wali_kelas_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_banners: {
        Row: {
          created_at: string
          cta_label: string | null
          cta_url: string | null
          id: string
          image_url: string | null
          is_active: boolean
          sort_order: number
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          sort_order?: number
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          sort_order?: number
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cms_pages: {
        Row: {
          content: string | null
          cover_url: string | null
          created_at: string
          gallery_urls: string[] | null
          id: string
          is_published: boolean
          map_embed: string | null
          slug: string
          title: string
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          content?: string | null
          cover_url?: string | null
          created_at?: string
          gallery_urls?: string[] | null
          id?: string
          is_published?: boolean
          map_embed?: string | null
          slug: string
          title: string
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          content?: string | null
          cover_url?: string | null
          created_at?: string
          gallery_urls?: string[] | null
          id?: string
          is_published?: boolean
          map_embed?: string | null
          slug?: string
          title?: string
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
      cms_posts: {
        Row: {
          audience: string
          author_id: string | null
          category: string | null
          content: string | null
          cover_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published_at: string | null
          slug: string
          status: string
          title: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          audience?: string
          author_id?: string | null
          category?: string | null
          content?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: string
          title: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          audience?: string
          author_id?: string | null
          category?: string | null
          content?: string | null
          cover_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: string
          title?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      grades: {
        Row: {
          catatan: string | null
          created_at: string
          id: string
          jenis: string
          nilai: number
          semester: string | null
          student_id: string
          subject_id: string
          tahun_ajaran: string | null
          unit: Database["public"]["Enums"]["unit_key"]
          updated_at: string
        }
        Insert: {
          catatan?: string | null
          created_at?: string
          id?: string
          jenis?: string
          nilai: number
          semester?: string | null
          student_id: string
          subject_id: string
          tahun_ajaran?: string | null
          unit: Database["public"]["Enums"]["unit_key"]
          updated_at?: string
        }
        Update: {
          catatan?: string | null
          created_at?: string
          id?: string
          jenis?: string
          nilai?: number
          semester?: string | null
          student_id?: string
          subject_id?: string
          tahun_ajaran?: string | null
          unit?: Database["public"]["Enums"]["unit_key"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          catatan: string | null
          created_at: string
          id: string
          jenis: string
          jumlah: number
          periode: string | null
          status: string
          student_id: string
          tanggal_bayar: string | null
          unit: Database["public"]["Enums"]["unit_key"]
          updated_at: string
        }
        Insert: {
          catatan?: string | null
          created_at?: string
          id?: string
          jenis?: string
          jumlah: number
          periode?: string | null
          status?: string
          student_id: string
          tanggal_bayar?: string | null
          unit: Database["public"]["Enums"]["unit_key"]
          updated_at?: string
        }
        Update: {
          catatan?: string | null
          created_at?: string
          id?: string
          jenis?: string
          jumlah?: number
          periode?: string | null
          status?: string
          student_id?: string
          tanggal_bayar?: string | null
          unit?: Database["public"]["Enums"]["unit_key"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      ppdb_applications: {
        Row: {
          alamat: string | null
          asal_sekolah: string | null
          catatan: string | null
          created_at: string
          dokumen_url: string | null
          email: string | null
          id: string
          jenis_kelamin: string | null
          nama: string
          nama_wali: string | null
          no_pendaftaran: string | null
          status: string
          tanggal_lahir: string | null
          telepon_wali: string | null
          unit: Database["public"]["Enums"]["unit_key"]
          updated_at: string
        }
        Insert: {
          alamat?: string | null
          asal_sekolah?: string | null
          catatan?: string | null
          created_at?: string
          dokumen_url?: string | null
          email?: string | null
          id?: string
          jenis_kelamin?: string | null
          nama: string
          nama_wali?: string | null
          no_pendaftaran?: string | null
          status?: string
          tanggal_lahir?: string | null
          telepon_wali?: string | null
          unit: Database["public"]["Enums"]["unit_key"]
          updated_at?: string
        }
        Update: {
          alamat?: string | null
          asal_sekolah?: string | null
          catatan?: string | null
          created_at?: string
          dokumen_url?: string | null
          email?: string | null
          id?: string
          jenis_kelamin?: string | null
          nama?: string
          nama_wali?: string | null
          no_pendaftaran?: string | null
          status?: string
          tanggal_lahir?: string | null
          telepon_wali?: string | null
          unit?: Database["public"]["Enums"]["unit_key"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          nama: string
          unit: Database["public"]["Enums"]["unit_key"] | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          nama: string
          unit?: Database["public"]["Enums"]["unit_key"] | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          nama?: string
          unit?: Database["public"]["Enums"]["unit_key"] | null
          updated_at?: string
        }
        Relationships: []
      }
      schedules: {
        Row: {
          created_at: string
          guru_id: string | null
          hari: string
          id: string
          jam_mulai: string
          jam_selesai: string
          kelas_id: string
          ruangan: string | null
          subject_id: string
          unit: Database["public"]["Enums"]["unit_key"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          guru_id?: string | null
          hari: string
          id?: string
          jam_mulai: string
          jam_selesai: string
          kelas_id: string
          ruangan?: string | null
          subject_id: string
          unit: Database["public"]["Enums"]["unit_key"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          guru_id?: string | null
          hari?: string
          id?: string
          jam_mulai?: string
          jam_selesai?: string
          kelas_id?: string
          ruangan?: string | null
          subject_id?: string
          unit?: Database["public"]["Enums"]["unit_key"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_guru_id_fkey"
            columns: ["guru_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_kelas_id_fkey"
            columns: ["kelas_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          alamat: string | null
          created_at: string
          deskripsi: string | null
          deskripsi_madrasah: string | null
          deskripsi_mi: string | null
          deskripsi_smk: string | null
          deskripsi_smp: string | null
          deskripsi_tk: string | null
          email: string | null
          hero_image_url: string | null
          hero_subtitle: string | null
          hero_title: string | null
          hero_video_url: string | null
          id: string
          map_embed: string | null
          nama_yayasan: string
          singleton: boolean
          tagline: string | null
          telepon: string | null
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          alamat?: string | null
          created_at?: string
          deskripsi?: string | null
          deskripsi_madrasah?: string | null
          deskripsi_mi?: string | null
          deskripsi_smk?: string | null
          deskripsi_smp?: string | null
          deskripsi_tk?: string | null
          email?: string | null
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          hero_video_url?: string | null
          id?: string
          map_embed?: string | null
          nama_yayasan?: string
          singleton?: boolean
          tagline?: string | null
          telepon?: string | null
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          alamat?: string | null
          created_at?: string
          deskripsi?: string | null
          deskripsi_madrasah?: string | null
          deskripsi_mi?: string | null
          deskripsi_smk?: string | null
          deskripsi_smp?: string | null
          deskripsi_tk?: string | null
          email?: string | null
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          hero_video_url?: string | null
          id?: string
          map_embed?: string | null
          nama_yayasan?: string
          singleton?: boolean
          tagline?: string | null
          telepon?: string | null
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
      students: {
        Row: {
          alamat: string | null
          created_at: string
          id: string
          jenis_kelamin: string | null
          kelas_id: string | null
          nama: string
          nama_wali: string | null
          nis: string | null
          nisn: string | null
          status: string
          tanggal_lahir: string | null
          telepon_wali: string | null
          unit: Database["public"]["Enums"]["unit_key"]
          updated_at: string
        }
        Insert: {
          alamat?: string | null
          created_at?: string
          id?: string
          jenis_kelamin?: string | null
          kelas_id?: string | null
          nama: string
          nama_wali?: string | null
          nis?: string | null
          nisn?: string | null
          status?: string
          tanggal_lahir?: string | null
          telepon_wali?: string | null
          unit: Database["public"]["Enums"]["unit_key"]
          updated_at?: string
        }
        Update: {
          alamat?: string | null
          created_at?: string
          id?: string
          jenis_kelamin?: string | null
          kelas_id?: string | null
          nama?: string
          nama_wali?: string | null
          nis?: string | null
          nisn?: string | null
          status?: string
          tanggal_lahir?: string | null
          telepon_wali?: string | null
          unit?: Database["public"]["Enums"]["unit_key"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_kelas_id_fkey"
            columns: ["kelas_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          created_at: string
          guru_id: string | null
          id: string
          kode: string | null
          nama: string
          unit: Database["public"]["Enums"]["unit_key"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          guru_id?: string | null
          id?: string
          kode?: string | null
          nama: string
          unit: Database["public"]["Enums"]["unit_key"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          guru_id?: string | null
          id?: string
          kode?: string | null
          nama?: string
          unit?: Database["public"]["Enums"]["unit_key"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_guru_id_fkey"
            columns: ["guru_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_subjects: {
        Row: {
          created_at: string
          id: string
          subject_id: string
          teacher_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          subject_id: string
          teacher_id: string
        }
        Update: {
          created_at?: string
          id?: string
          subject_id?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_subjects_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          jabatan: string | null
          mapel_utama: string | null
          nama: string
          nip: string | null
          telepon: string | null
          unit: Database["public"]["Enums"]["unit_key"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          jabatan?: string | null
          mapel_utama?: string | null
          nama: string
          nip?: string | null
          telepon?: string | null
          unit: Database["public"]["Enums"]["unit_key"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          jabatan?: string | null
          mapel_utama?: string | null
          nama?: string
          nip?: string | null
          telepon?: string | null
          unit?: Database["public"]["Enums"]["unit_key"]
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_unit: {
        Args: { _unit: Database["public"]["Enums"]["unit_key"] }
        Returns: boolean
      }
      can_write_unit: {
        Args: { _unit: Database["public"]["Enums"]["unit_key"] }
        Returns: boolean
      }
      get_user_unit: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["unit_key"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_any_admin: { Args: { _user_id: string }; Returns: boolean }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "admin_mi"
        | "admin_smp"
        | "admin_smk"
        | "admin_madrasah"
        | "admin_tk"
      unit_key: "mi" | "smp" | "smk" | "madrasah" | "tk"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "super_admin",
        "admin_mi",
        "admin_smp",
        "admin_smk",
        "admin_madrasah",
        "admin_tk",
      ],
      unit_key: ["mi", "smp", "smk", "madrasah", "tk"],
    },
  },
} as const
