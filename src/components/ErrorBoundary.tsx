import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  /** Jika true, render nothing (bukan fallback card) saat error — cocok untuk section opsional */
  silent?: boolean;
  /** Label area yang error, ditampilkan di fallback */
  label?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.label ? ` — ${this.props.label}` : ""}]`, error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.silent) return null;

    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-muted/40 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <div>
          <p className="text-lg font-bold">
            {this.props.label ? `Gagal memuat ${this.props.label}` : "Terjadi kesalahan"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Silakan coba muat ulang bagian ini.
          </p>
        </div>
        <Button variant="outline" onClick={this.handleRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Coba Lagi
        </Button>
      </div>
    );
  }
}