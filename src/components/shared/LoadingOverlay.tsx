import { Loader2 } from "lucide-react";

interface Props {
  visible: boolean;
  text?: string;
}

export function LoadingOverlay({ visible, text = "Memproses..." }: Props) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-card p-8 shadow-lg animate-scale-in">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-semibold text-foreground">{text}</p>
      </div>
    </div>
  );
}