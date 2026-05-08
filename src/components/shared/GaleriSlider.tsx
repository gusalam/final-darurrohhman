import { useEffect, useState, useRef, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PLACEHOLDER = "/placeholder.png";

interface Props {
  images: string[];
  intervalMs?: number;
}

export function GaleriSlider({ images, intervalMs = 3500 }: Props) {
  const [idx, setIdx] = useState(0);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  const pausedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  // Hanya jalankan slider & load gambar saat masuk viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") { setInView(true); return; }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setInView(true); }),
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Auto-advance hanya saat in-view & tidak dijeda
  useEffect(() => {
    if (!inView || images.length <= 1) return;
    const t = setInterval(() => {
      if (!pausedRef.current) setIdx((i) => (i + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(t);
  }, [inView, images.length, intervalMs]);

  // Preload gambar saat ini, sebelum, & sesudah (window 3 gambar)
  const visibleSet = useMemo(() => {
    if (images.length === 0) return new Set<number>();
    const n = images.length;
    return new Set([(idx - 1 + n) % n, idx, (idx + 1) % n]);
  }, [idx, images.length]);

  // Hint browser preload untuk gambar berikutnya via <link rel="preload">
  useEffect(() => {
    if (!inView || images.length === 0) return;
    const next = images[(idx + 1) % images.length];
    if (!next) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = next;
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, [idx, inView, images]);

  if (images.length === 0) return null;

  const go = (delta: number) => setIdx((i) => (i + delta + images.length) % images.length);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-2xl bg-muted shadow-soft"
      onTouchStart={() => { pausedRef.current = true; }}
      onTouchEnd={() => { pausedRef.current = false; }}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${idx * 100}%)` }}
      >
        {images.map((u, i) => {
          const shouldRender = inView && visibleSet.has(i);
          const isCurrent = i === idx;
          return (
            <div key={i} className="relative aspect-[4/3] w-full shrink-0">
              {/* Skeleton shimmer sampai gambar siap */}
              {!loaded[i] && (
                <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-muted via-muted-foreground/10 to-muted" />
              )}
              {shouldRender && (
                <img
                  src={u}
                  alt={`Galeri ${i + 1}`}
                  onLoad={() => setLoaded((s) => ({ ...s, [i]: true }))}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = PLACEHOLDER;
                    setLoaded((s) => ({ ...s, [i]: true }));
                  }}
                  loading={isCurrent ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={isCurrent ? "high" : "low"}
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
                    loaded[i] ? "opacity-100" : "opacity-0"
                  }`}
                />
              )}
            </div>
          );
        })}
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
