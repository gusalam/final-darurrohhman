import { ReactNode, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Trash2, Info, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ConfirmVariant = "warning" | "danger" | "success" | "info";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  onConfirm: () => Promise<void> | void;
}

const variantConfig: Record<ConfirmVariant, { icon: typeof AlertTriangle; iconClass: string; btnClass: string }> = {
  warning: {
    icon: AlertTriangle,
    iconClass: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    btnClass: "bg-amber-500 hover:bg-amber-600 text-white",
  },
  danger: {
    icon: Trash2,
    iconClass: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    btnClass: "bg-red-500 hover:bg-red-600 text-white",
  },
  success: {
    icon: CheckCircle2,
    iconClass: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    btnClass: "bg-emerald-500 hover:bg-emerald-600 text-white",
  },
  info: {
    icon: Info,
    iconClass: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    btnClass: "bg-blue-500 hover:bg-blue-600 text-white",
  },
};

export function ConfirmDialog({
  open, onOpenChange, title, description, confirmLabel = "Ya, lanjutkan",
  cancelLabel = "Batal", variant = "warning", onConfirm,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);
  const cfg = variantConfig[variant];
  const Icon = cfg.icon;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch {
      // error handled by caller via toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(v) => { if (!loading) onOpenChange(v); }}>
      <AlertDialogContent className="rounded-xl shadow-lg animate-scale-in max-w-md">
        <AlertDialogHeader className="flex-row items-start gap-4">
          <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full", cfg.iconClass)}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <AlertDialogTitle className="text-lg font-bold">{title}</AlertDialogTitle>
            {description && <AlertDialogDescription className="text-sm">{description}</AlertDialogDescription>}
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel disabled={loading} className="rounded-lg">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => { e.preventDefault(); handleConfirm(); }}
            disabled={loading}
            className={cn("rounded-lg min-w-[120px]", cfg.btnClass)}
          >
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...</> : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}