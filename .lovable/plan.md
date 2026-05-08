
## Goal

Super admin can **view** all unit data (students, classes, teachers, attendance, grades, payments, schedules, subjects) but **cannot** insert, update, or delete. Each unit's admin retains full CRUD for their own unit. CMS tables remain fully controlled by super admin.

## Database Changes (Migration)

### 1. Create a new helper function `can_write_unit(unit)`

This function returns true only for the matching unit admin (excludes super_admin):

```sql
CREATE OR REPLACE FUNCTION public.can_write_unit(_unit unit_key)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND (
        (_unit = 'mi'  AND ur.role = 'admin_mi')  OR
        (_unit = 'smp' AND ur.role = 'admin_smp') OR
        (_unit = 'smk' AND ur.role = 'admin_smk')
      )
  )
$$;
```

### 2. Update RLS policies on 8 unit tables

Tables: `students`, `classes`, `teachers`, `attendance`, `grades`, `payments`, `schedules`, `subjects`

For each table:
- **SELECT** policy: keep `can_access_unit(unit)` (super_admin + unit admin can read)
- **INSERT** policy: change to `can_write_unit(unit)` 
- **UPDATE** policy: change to `can_write_unit(unit)`
- **DELETE** policy: change to `can_write_unit(unit)`

No changes to CMS tables (`cms_banners`, `cms_pages`, `cms_posts`, `site_settings`) -- super admin keeps full access.

## Frontend Changes

### 3. Add `canWriteUnit` helper in `src/lib/units.ts`

```ts
export const canWriteUnit = (role?: Role | null) => 
  role === "admin_mi" || role === "admin_smp" || role === "admin_smk";
```

### 4. Update all unit data pages to hide write actions for super_admin

Pages: `Siswa.tsx`, `Kelas.tsx`, `Guru.tsx`, `Nilai.tsx`, `Absensi.tsx`, `Jadwal.tsx`, `Mapel.tsx`, `Keuangan.tsx`, `Raport.tsx`

In each page:
- Import `useAuth` and `canWriteUnit`
- Conditionally hide "Tambah" / "Add" buttons
- Conditionally hide edit (Pencil) and delete (Trash) action buttons
- Keep all read/view functionality intact

This ensures the UI matches the backend restrictions -- super admin sees data but cannot modify it.

## Summary of Access Matrix

| Role | Unit Data (MI/SMP/SMK) | CMS |
|------|----------------------|-----|
| super_admin | Read only | Full CRUD |
| admin_mi | Full CRUD (MI only) | No access |
| admin_smp | Full CRUD (SMP only) | No access |
| admin_smk | Full CRUD (SMK only) | No access |
