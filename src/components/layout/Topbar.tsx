import { useState } from "react";
import { LogOut, Moon, Search, Sun, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { ROLE_LABEL } from "@/lib/units";
import { UnitSwitcher } from "./UnitSwitcher";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export function Topbar() {
  const { theme, toggle } = useTheme();
  const { profile, role, signOut } = useAuth();
  const nav = useNavigate();
  const [showLogout, setShowLogout] = useState(false);


  const initials = (profile?.nama ?? "U")
    .split(" ").slice(0, 2).map((s) => s[0]).join("").toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card px-4 shadow-soft md:px-6">
        <SidebarTrigger className="text-foreground" />
        <div className="hidden flex-1 md:block">
          <UnitSwitcher />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden lg:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Cari…" className="h-10 w-64 rounded-xl border-border bg-muted pl-10" />
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={toggle} className="rounded-xl">
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 rounded-xl px-2 sm:px-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-xs font-bold text-primary-foreground">
                  {initials}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold leading-none">{profile?.nama ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{role ? ROLE_LABEL[role] : "—"}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="font-semibold">{profile?.nama}</p>
                  <p className="text-xs font-normal text-muted-foreground">{profile?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem><User className="mr-2 h-4 w-4" /> Profil</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowLogout(true)} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" /> Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <ConfirmDialog
        open={showLogout}
        onOpenChange={setShowLogout}
        title="Konfirmasi Logout"
        description="Yakin ingin keluar dari sistem?"
        variant="warning"
        confirmLabel="Ya, keluar"
        onConfirm={async () => { await signOut(); toast.success("Anda telah keluar"); nav("/login", { replace: true }); }}
      />
    </>
  );
}
