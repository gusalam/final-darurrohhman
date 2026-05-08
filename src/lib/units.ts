import type { Database } from "@/integrations/supabase/types";
import logoYayasan from "@/assets/logo-yayasan.png";
import logoMI from "@/assets/logo-mi.jpg";
import logoSMP from "@/assets/logo-smp.jpg";
import logoSMK from "@/assets/logo-smk.jpg";
import logoMadrasah from "@/assets/logo-madrasah.jpg";
import logoTK from "@/assets/logo-tk.jpg";

export type UnitKey = Database["public"]["Enums"]["unit_key"];
export type Role = Database["public"]["Enums"]["app_role"];

export interface UnitInfo {
  key: UnitKey;
  short: string;
  name: string;
  fullName: string;
  level: string;
  logo: string;
}

export const YAYASAN_LOGO = logoYayasan;

export const UNITS: Record<UnitKey, UnitInfo> = {
  mi:       { key: "mi",       short: "MI",       name: "MI An-Nuriyah",            fullName: "Madrasah Ibtidaiyah An-Nuriyah",          level: "Dasar",    logo: logoMI },
  smp:      { key: "smp",      short: "SMP",      name: "SMP Darul Rohman",         fullName: "SMP Darul Rohman",                         level: "Menengah", logo: logoSMP },
  smk:      { key: "smk",      short: "SMK",      name: "SMK Darul Rohman",         fullName: "SMK Darul Rohman",                         level: "Atas",     logo: logoSMK },
  madrasah: { key: "madrasah", short: "Madrasah", name: "Madrasah Diniyah",         fullName: "Madrasah Diniyah Al Arsyadiyah",           level: "Diniyah",  logo: logoMadrasah },
  tk:       { key: "tk",       short: "TK",       name: "TK Roudlotul Huffadz",     fullName: "TK PGRI 02 Roudlotul Huffadz",             level: "PAUD",     logo: logoTK },
};

export const UNIT_KEYS: UnitKey[] = ["mi", "smp", "smk", "madrasah", "tk"];

export const ROLE_LABEL: Record<Role, string> = {
  super_admin:    "Super Admin Yayasan",
  admin_mi:       "Admin MI An-Nuriyah",
  admin_smp:      "Admin SMP Darul Rohman",
  admin_smk:      "Admin SMK Darul Rohman",
  admin_madrasah: "Admin Madrasah Diniyah",
  admin_tk:       "Admin TK Roudlotul Huffadz",
};

const UNIT_ADMIN_ROLES: Role[] = ["admin_mi", "admin_smp", "admin_smk", "admin_madrasah", "admin_tk"];

export const canAccessCMS = (role?: Role | null) => role === "super_admin";
export const canSwitchUnit = (role?: Role | null) => role === "super_admin";
export const canWriteUnit = (role?: Role | null) =>
  !!role && UNIT_ADMIN_ROLES.includes(role);

const ROLE_TO_UNIT: Record<string, UnitKey> = {
  admin_mi: "mi",
  admin_smp: "smp",
  admin_smk: "smk",
  admin_madrasah: "madrasah",
  admin_tk: "tk",
};

export const dashboardPathFor = (role: Role | null | undefined, unit: UnitKey | null | undefined): string => {
  if (role === "super_admin") return "/yayasan";
  if (role && ROLE_TO_UNIT[role]) return `/dashboard/${ROLE_TO_UNIT[role]}`;
  if (unit) return `/dashboard/${unit}`;
  return "/dashboard/mi";
};

export const unitFromRole = (role: Role | null | undefined, fallback: UnitKey | null | undefined): UnitKey => {
  if (role && ROLE_TO_UNIT[role]) return ROLE_TO_UNIT[role];
  return fallback ?? "mi";
};

export const logoForRole = (role: Role | null | undefined, unit: UnitKey | null | undefined): string => {
  if (role === "super_admin" || (!role && !unit)) return YAYASAN_LOGO;
  const u = role && ROLE_TO_UNIT[role] ? ROLE_TO_UNIT[role] : unit;
  return u ? UNITS[u].logo : YAYASAN_LOGO;
};
