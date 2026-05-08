import { useUnit } from "@/context/UnitContext";
import { UNITS, UnitKey, UNIT_KEYS } from "@/lib/units";
import { Lock, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function UnitSwitcher() {
  const { unit, setUnit, canSwitch, info } = useUnit();
  if (!canSwitch) {
    return (
      <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted px-3 py-1.5 shadow-soft">
        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground">Unit:</span>
        <span className="rounded-md bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">{info.short}</span>
      </div>
    );
  }

  const keys: UnitKey[] = UNIT_KEYS;

  return (
    <Select value={unit} onValueChange={(v) => setUnit(v as UnitKey)}>
      <SelectTrigger className="w-auto min-w-[140px] rounded-xl border-border bg-muted shadow-soft font-semibold text-sm gap-2">
        <SelectValue>
          <span className="flex items-center gap-2">
            <span className="flex h-6 min-w-6 items-center justify-center rounded-md bg-primary px-1.5 text-xs font-bold text-primary-foreground">
              {info.short}
            </span>
            <span>{info.name}</span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        {keys.map((k) => {
          const u = UNITS[k];
          return (
            <SelectItem key={k} value={k} className="rounded-lg font-semibold">
              <span className="flex items-center gap-2">
                <span className="flex h-6 min-w-6 items-center justify-center rounded-md bg-primary px-1.5 text-xs font-bold text-primary-foreground">
                  {u.short}
                </span>
                <span>{u.name}</span>
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
