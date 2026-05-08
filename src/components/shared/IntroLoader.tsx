import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoYayasan from "@/assets/logo-yayasan.png";

interface Props {
  enabled?: boolean;
  logoUrl?: string | null;
  text?: string | null;
  durationMs?: number | null;
  /** When true, ignore sessionStorage and always show; call onClose when finished. */
  preview?: boolean;
  onClose?: () => void;
}

const SESSION_KEY = "ydr_intro_shown";

export function IntroLoader({ enabled = true, logoUrl, text, durationMs, preview = false, onClose }: Props) {
  const [shown, setShown] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!preview && !enabled) return;
    if (typeof window === "undefined") return;
    if (!preview && sessionStorage.getItem(SESSION_KEY) === "1") return;
    setShown(true);
    setHidden(false);
    const dur = Math.max(800, Math.min(durationMs ?? 2500, 6000));
    const t = setTimeout(() => {
      setHidden(true);
      if (!preview) sessionStorage.setItem(SESSION_KEY, "1");
    }, dur);
    return () => clearTimeout(t);
  }, [enabled, durationMs, preview]);

  if (!shown) return null;

  return (
    <AnimatePresence onExitComplete={() => { if (preview) onClose?.(); }}>
      {!hidden && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-sidebar text-white"
          aria-hidden="true"
        >
          {/* radial glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--secondary)/0.2),transparent_60%)]" />

          <div className="relative flex flex-col items-center gap-5 px-6 text-center">
            <motion.div
              initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white p-2 shadow-2xl"
            >
              <img src={logoUrl || logoYayasan} alt="Logo" className="h-full w-full object-contain" />
            </motion.div>

            <motion.div
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.5, ease: "easeOut" }}
            >
              <p dir="rtl" lang="ar" className="text-base text-secondary md:text-lg">
                مؤسسة دار الرحمن مورمبوح
              </p>
              <h1 className="mt-1 font-display text-xl font-bold md:text-2xl">
                {text || "Yayasan Darur Rohman Morombuh"}
              </h1>
            </motion.div>

            {/* progress line */}
            <div className="mt-2 h-[3px] w-44 overflow-hidden rounded-full bg-white/15">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
                className="h-full w-1/2 rounded-full bg-gradient-to-r from-secondary via-white to-secondary"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
