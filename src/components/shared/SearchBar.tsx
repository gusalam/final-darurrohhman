import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({ value, onChange, placeholder = "Cari nama, kelas, mapel...", className }: Props) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-xl pl-10 pr-9"
      />
      {value && (
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
          onClick={() => onChange("")}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
}