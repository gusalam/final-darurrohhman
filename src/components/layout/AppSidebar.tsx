import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, GraduationCap, Calendar, ClipboardCheck, Award,
  Wallet, Building2, BookOpen, Newspaper, Image as ImageIcon,
  FilePen, ScrollText, Library, Settings, School, Briefcase, ImagePlus, UserCog, UserPlus,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuItem, useSidebar, SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABEL, Role, logoForRole, UNITS } from "@/lib/units";

interface NavItem { title: string; url: string; icon: any; roles: Role[]; }
const ALL: Role[] = ["super_admin", "admin_mi", "admin_smp", "admin_smk", "admin_madrasah", "admin_tk"];
const UNIT_ADMINS: Role[] = ["admin_mi", "admin_smp", "admin_smk", "admin_madrasah", "admin_tk"];

const akademikItems: NavItem[] = [
  { title: "Siswa", url: "/siswa", icon: GraduationCap, roles: ALL },
  { title: "Guru & Staff", url: "/guru", icon: UserCog, roles: ALL },
  { title: "Kelas", url: "/kelas", icon: School, roles: ALL },
  { title: "Mata Pelajaran", url: "/mapel", icon: BookOpen, roles: ALL },
  { title: "Jadwal", url: "/jadwal", icon: Calendar, roles: ALL },
  { title: "Absensi", url: "/absensi", icon: ClipboardCheck, roles: ALL },
  { title: "Nilai", url: "/nilai", icon: Award, roles: ALL },
  { title: "Raport", url: "/raport", icon: ScrollText, roles: ALL },
];
const manajemenItems: NavItem[] = [
  { title: "Keuangan", url: "/keuangan", icon: Wallet, roles: ALL },
  { title: "PPDB", url: "/ppdb", icon: UserPlus, roles: ALL },
];
const cmsItems: NavItem[] = [
  { title: "Posts", url: "/cms/posts", icon: Newspaper, roles: ["super_admin"] },
  { title: "Pages", url: "/cms/pages", icon: FilePen, roles: ["super_admin"] },
  { title: "Banner / Hero", url: "/cms/banners", icon: ImageIcon, roles: ["super_admin"] },
  { title: "Galeri", url: "/cms/galeri", icon: ImagePlus, roles: ["super_admin"] },
  { title: "Media Library", url: "/cms/media", icon: Library, roles: ["super_admin"] },
  { title: "Site Settings", url: "/cms/settings", icon: Settings, roles: ["super_admin"] },
];

export function AppSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const { role, profile } = useAuth();
  const collapsed = !isMobile && state === "collapsed";

  const visible = (items: NavItem[]) => items.filter((i) => role && i.roles.includes(role));
  const handleNavClick = () => { if (isMobile) setOpenMobile(false); };

  const renderItem = (item: NavItem) => (
    <SidebarMenuItem key={item.title}>
      <NavLink
        to={item.url}
        end={item.url === "/" || item.url.startsWith("/dashboard/")}
        title={item.title}
        onClick={handleNavClick}
        className={({ isActive }) =>
          `flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-smooth ${
            isActive
              ? "bg-secondary text-secondary-foreground shadow-gold"
              : "text-white hover:bg-sidebar-accent"
          }`
        }
      >
        <item.icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span className="truncate">{item.title}</span>}
      </NavLink>
    </SidebarMenuItem>
  );

  // Super admin: Dashboard Yayasan top-level + Unit Management group
  // Unit admin: single Dashboard link
  const topItems: NavItem[] = role === "super_admin"
    ? [{ title: "Dashboard Yayasan", url: "/yayasan", icon: Building2, roles: ["super_admin"] }]
    : [{ title: "Dashboard", url: `/dashboard/${profile?.unit ?? "mi"}`, icon: LayoutDashboard, roles: UNIT_ADMINS }];

  const unitItems: NavItem[] = role === "super_admin"
    ? [
        { title: "MI An-Nuriyah",      url: "/dashboard/mi",       icon: BookOpen,       roles: ["super_admin"] },
        { title: "SMP Darul Rohman",   url: "/dashboard/smp",      icon: GraduationCap,  roles: ["super_admin"] },
        { title: "SMK Darul Rohman",   url: "/dashboard/smk",      icon: Briefcase,      roles: ["super_admin"] },
        { title: "Madrasah Diniyah",   url: "/dashboard/madrasah", icon: BookOpen,       roles: ["super_admin"] },
        { title: "TK Roudlotul Huffadz", url: "/dashboard/tk",     icon: School,         roles: ["super_admin"] },
      ]
    : [];

  const top = visible(topItems);
  const units = visible(unitItems);
  const akademik = visible(akademikItems);
  const manajemen = visible(manajemenItems);
  const cms = visible(cmsItems);

  const headerLogo = logoForRole(role, profile?.unit ?? null);
  const headerName = role && role !== "super_admin" && profile?.unit
    ? UNITS[profile.unit].name
    : "Darul Rohman";

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border bg-sidebar p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white p-1">
            <img src={headerLogo} alt="Logo" className="h-full w-full object-contain" />
          </div>
          {!collapsed && (
            <div className="min-w-0 animate-fade-in">
              <p className="truncate text-sm font-bold text-white">{headerName}</p>
              <p className="truncate text-xs font-medium text-white/85">
                {role ? ROLE_LABEL[role] : "Morombuh Kwanyar"}
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-sidebar px-2 py-3">
        {[
          { label: "Utama", list: top },
          { label: "Unit Management", list: units },
          { label: "Akademik", list: akademik },
          { label: "Manajemen", list: manajemen },
          { label: "CMS", list: cms },
        ].map(({ label, list }) =>
          list.length ? (
            <SidebarGroup key={label}>
              {!collapsed && (
                <SidebarGroupLabel className="px-3 text-[11px] font-bold uppercase tracking-wider text-secondary">
                  {label}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>{list.map(renderItem)}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ) : null,
        )}
      </SidebarContent>

      {!collapsed && (
        <SidebarFooter className="border-t border-sidebar-border bg-sidebar p-4">
          <div className="rounded-lg bg-sidebar-accent p-3 text-center">
            <p className="text-sm font-bold text-secondary">YDR v2.0</p>
            <p className="mt-1 text-xs font-medium text-white">Sistem Terpadu Pendidikan</p>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
