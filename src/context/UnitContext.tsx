import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { UNITS, UnitKey, canSwitchUnit, unitFromRole } from "@/lib/units";

interface UnitContextValue {
  unit: UnitKey;
  setUnit: (u: UnitKey) => void;
  canSwitch: boolean;
  info: typeof UNITS[UnitKey];
}

const UnitContext = createContext<UnitContextValue | null>(null);

export const UnitProvider = ({ children }: { children: ReactNode }) => {
  const { role, profile } = useAuth();
  const [unit, setUnitState] = useState<UnitKey>("mi");

  useEffect(() => {
    setUnitState(unitFromRole(role, profile?.unit ?? null));
  }, [role, profile?.unit]);

  const canSwitch = canSwitchUnit(role);
  const setUnit = (u: UnitKey) => { if (canSwitch) setUnitState(u); };

  return (
    <UnitContext.Provider value={{ unit, setUnit, canSwitch, info: UNITS[unit] }}>
      {children}
    </UnitContext.Provider>
  );
};

export const useUnit = () => {
  const ctx = useContext(UnitContext);
  if (!ctx) throw new Error("useUnit must be inside UnitProvider");
  return ctx;
};
