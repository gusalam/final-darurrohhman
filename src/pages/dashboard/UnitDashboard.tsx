import { useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import { useUnit } from "@/context/UnitContext";
import { useAuth } from "@/context/AuthContext";
import { UNITS, UnitKey, dashboardPathFor } from "@/lib/units";

const VALID = Object.keys(UNITS) as UnitKey[];

export default function UnitDashboard() {
  const { unitKey } = useParams<{ unitKey: string }>();
  const { setUnit, canSwitch } = useUnit();
  const { role, profile } = useAuth();

  const target = VALID.includes(unitKey as UnitKey) ? (unitKey as UnitKey) : null;

  useEffect(() => {
    if (target && canSwitch) setUnit(target);
  }, [target, canSwitch, setUnit]);

  if (!target) return <Navigate to="/dashboard/mi" replace />;

  // Admin unit hanya boleh akses dashboard unitnya. Super admin bebas.
  if (role && role !== "super_admin" && profile?.unit && profile.unit !== target) {
    return <Navigate to={dashboardPathFor(role, profile.unit)} replace />;
  }

  return <Dashboard />;
}
