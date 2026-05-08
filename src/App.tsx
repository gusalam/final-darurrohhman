import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/context/ThemeContext";
import { UnitProvider } from "@/context/UnitContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { dashboardPathFor } from "@/lib/units";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Login from "./pages/Login";
import PublicHome from "./pages/Public/Home";
import PostDetail from "./pages/Public/PostDetail";
import UnitDashboard from "./pages/dashboard/UnitDashboard";
import Siswa from "./pages/Siswa";
import Jadwal from "./pages/Jadwal";
import Absensi from "./pages/Absensi";
import Nilai from "./pages/Nilai";
import Raport from "./pages/Raport";
import Mapel from "./pages/Mapel";
import Keuangan from "./pages/Keuangan";
import Guru from "./pages/Guru";
import Kelas from "./pages/Kelas";
import PPDB from "./pages/PPDB";
import Yayasan from "./pages/Yayasan";
import CmsPosts from "./pages/cms/CmsPosts";
import CmsBanners from "./pages/cms/CmsBanners";
import CmsPages from "./pages/cms/CmsPages";
import CmsMedia from "./pages/cms/CmsMedia";
import CmsSiteSettings from "./pages/cms/CmsSiteSettings";
import CmsGaleri from "./pages/cms/CmsGaleri";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function DashboardIndexRedirect() {
  const { user, role, profile, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  return <Navigate to={dashboardPathFor(role, profile?.unit ?? null)} replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <UnitProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<PublicHome />} />
                <Route path="/berita/:slug" element={<PostDetail />} />
                <Route path="/login" element={<Login />} />


                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<DashboardIndexRedirect />} />
                  <Route element={<DashboardLayout />}>
                    <Route path="/dashboard/:unitKey" element={<UnitDashboard />} />
                    <Route path="/siswa" element={<Siswa />} />
                    <Route path="/kelas" element={<Kelas />} />
                    <Route path="/jadwal" element={<Jadwal />} />
                    <Route path="/absensi" element={<Absensi />} />
                    <Route path="/nilai" element={<Nilai />} />
                    <Route path="/raport" element={<Raport />} />
                    <Route path="/mapel" element={<Mapel />} />
                    <Route path="/keuangan" element={<Keuangan />} />
                    <Route path="/guru" element={<Guru />} />
                    <Route path="/ppdb" element={<PPDB />} />
                  </Route>
                </Route>

                <Route element={<ProtectedRoute roles={["super_admin"]} />}>
                  <Route element={<DashboardLayout />}>
                    <Route path="/yayasan" element={<ErrorBoundary label="Yayasan"><Yayasan /></ErrorBoundary>} />
                    <Route path="/cms/posts" element={<ErrorBoundary label="CMS Posts"><CmsPosts /></ErrorBoundary>} />
                    <Route path="/cms/banners" element={<ErrorBoundary label="CMS Banners"><CmsBanners /></ErrorBoundary>} />
                    <Route path="/cms/pages" element={<ErrorBoundary label="CMS Pages"><CmsPages /></ErrorBoundary>} />
                    <Route path="/cms/media" element={<ErrorBoundary label="Media Library"><CmsMedia /></ErrorBoundary>} />
                    <Route path="/cms/settings" element={<ErrorBoundary label="Pengaturan Situs"><CmsSiteSettings /></ErrorBoundary>} />
                    <Route path="/cms/galeri" element={<ErrorBoundary label="Galeri"><CmsGaleri /></ErrorBoundary>} />
                  </Route>
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </UnitProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
