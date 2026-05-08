import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PLACEHOLDER = "/placeholder.png";

interface Props {
  images: string[];
  intervalMs?: number;
}

export function GaleriSlider({ images, intervalMs = 3500 }: Props) {
  const [idx, setIdx] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => {
      if (!pausedRef.current) setIdx((i) => (i + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(t);
  }, [images.length, intervalMs]);

  if (images.length === 0) return null;

  const go = (delta: number) => setIdx((i) => (i + delta + images.length) % images.length);

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-muted shadow-soft"
      onTouchStart={() => { pausedRef.current = true; }}
      onTouchEnd={() => { pausedRef.current = false; }}
    >
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${idx * 100}%)` }}
      >
        {images.map((u, i) => (
          <div key={i} className="relative aspect-[4/3] w-full shrink-0">
            <img
              src={u}
              alt={`Galeri ${i + 1}`}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Sebelumnya"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur transition hover:bg-black/70"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Berikutnya"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white backdrop-blur transition hover:bg-black/70"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIdx(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === idx ? "w-5 bg-secondary" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
