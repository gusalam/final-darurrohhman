import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/lib/units";
import { Loader2 } from "lucide-react";

interface Props { roles?: Role[]; }

export default function ProtectedRoute({ roles }: Props) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (roles && (!role || !roles.includes(role))) return <Navigate to="/" replace />;
  return <Outlet />;
}
