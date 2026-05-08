import { Outlet } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Topbar } from "./Topbar";
import { UnitSwitcher } from "./UnitSwitcher";

export default function DashboardLayout() {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="relative z-10 flex min-w-0 flex-1 flex-col">
          <Topbar />
          <div className="border-b border-border bg-card px-4 py-3 md:hidden">
            <UnitSwitcher />
          </div>
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-7xl animate-fade-in">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
