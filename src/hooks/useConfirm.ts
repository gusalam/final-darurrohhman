import { useState, useCallback } from "react";
import type { ConfirmVariant } from "@/components/shared/ConfirmDialog";

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  onConfirm: () => Promise<void> | void;
}

export function useConfirm() {
  const [state, setState] = useState<(ConfirmOptions & { open: boolean }) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setState({ ...opts, open: true });
  }, []);

  const dialogProps = state
    ? {
        open: state.open,
        onOpenChange: (v: boolean) => { if (!v) setState(null); },
        title: state.title,
        description: state.description,
        confirmLabel: state.confirmLabel,
        cancelLabel: state.cancelLabel,
        variant: state.variant,
        onConfirm: state.onConfirm,
      }
    : null;

  return { confirm, dialogProps };
}