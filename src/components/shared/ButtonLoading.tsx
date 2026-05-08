import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ComponentProps, ReactNode } from "react";

interface Props extends ComponentProps<typeof Button> {
  loading?: boolean;
  loadingText?: string;
  children: ReactNode;
}

export function ButtonLoading({ loading, loadingText, children, disabled, ...props }: Props) {
  return (
    <Button disabled={disabled || loading} {...props}>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText ?? "Memproses..."}
        </>
      ) : (
        children
      )}
    </Button>
  );
}