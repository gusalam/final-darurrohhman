import { useState, useRef, DragEvent } from "react";
import { Upload, Loader2, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  value?: string;
  onFile: (file: File) => Promise<void> | void;
  onClear?: () => void;
  uploading?: boolean;
  multiple?: boolean;
  onFiles?: (files: File[]) => Promise<void> | void;
  label?: string;
  className?: string;
  height?: string;
}

export function DropZone({
  value, onFile, onClear, uploading, multiple, onFiles,
  label = "Tarik & lepas gambar di sini, atau klik untuk pilih",
  className, height = "h-44",
}: DropZoneProps) {
  const [hover, setHover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (multiple && onFiles) {
      await onFiles(Array.from(files));
    } else {
      await onFile(files[0]);
    }
  };

  const onDrop = async (e: DragEvent) => {
    e.preventDefault();
    setHover(false);
    await handleFiles(e.dataTransfer.files);
  };

  return (
    <div className={cn("relative", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setHover(true); }}
        onDragLeave={() => setHover(false)}
        onDrop={onDrop}
        className={cn(
          "group relative flex w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed bg-muted/30 transition",
          height,
          hover ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          uploading && "pointer-events-none opacity-70",
        )}
      >
        {value && !multiple ? (
          <>
            <img src={value} alt="preview" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
              <p className="text-sm font-semibold text-white">Klik untuk ganti</p>
            </div>
            {onClear && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onClear(); }}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </>
        ) : uploading ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Uploading...</p>
          </>
        ) : (
          <>
            <div className="rounded-full bg-primary/10 p-3">
              {multiple ? <ImageIcon className="h-6 w-6 text-primary" /> : <Upload className="h-6 w-6 text-primary" />}
            </div>
            <p className="px-4 text-center text-sm font-medium">{label}</p>
            <p className="text-xs text-muted-foreground">PNG, JPG, WEBP</p>
          </>
        )}
      </div>
    </div>
  );
}
