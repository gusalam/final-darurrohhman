import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logo from "@/assets/logo-yayasan.png";

const NAV = [
  { label: "Beranda", href: "#top" },
  { label: "Tentang", href: "#tentang" },
  { label: "Unit", href: "#unit" },
  { label: "Akademik", href: "#akademik" },
  { label: "PPDB", href: "#ppdb" },
  { label: "Berita", href: "#berita" },
  { label: "Galeri", href: "#galeri" },
  { label: "Kontak", href: "#kontak" },
];

interface Props {
  yayasanName?: string;
  tagline?: string;
}

function goTo(href: string) {
  if (href.startsWith("#")) {
    if (window.location.hash !== href) {
      window.history.replaceState(null, "", href);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
    setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }
}


export function PublicNavbar({ yayasanName, tagline }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-sidebar text-white shadow-soft">
      <div className="mx-auto flex h-[70px] max-w-7xl items-center gap-6 px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1">
            <img src={logo} alt="Logo" className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0 hidden sm:block">
            <p className="truncate text-sm font-bold leading-tight">{yayasanName ?? "Yayasan Darul Rohman"}</p>
            {tagline && <p className="truncate text-[11px] text-white/70">{tagline}</p>}
          </div>
        </Link>

        {/* Desktop menu */}
        <nav className="mx-auto hidden md:flex items-center gap-6 lg:gap-8">
          {NAV.map((n) => (
            <button
              key={n.label}
              onClick={() => goTo(n.href)}
              className="relative text-sm font-medium text-white/90 transition-colors duration-200 hover:text-secondary after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-secondary after:transition-all after:duration-200 hover:after:w-full"
            >
              {n.label}
            </button>
          ))}
        </nav>

        {/* Right: login + mobile trigger */}
        <div className="ml-auto flex items-center gap-3">
          <Link to="/login" className="hidden sm:block">
            <Button className="bg-secondary text-secondary-foreground font-bold hover:opacity-95">
              <LogIn className="mr-2 h-4 w-4" /> Login Admin
            </Button>
          </Link>

          {/* Mobile hamburger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost" className="md:hidden text-white hover:bg-white/10 hover:text-white" aria-label="Buka menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 border-0 bg-sidebar p-0 text-white">
              <div className="flex h-full flex-col">
                <div className="flex items-center gap-3 border-b border-white/10 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1">
                    <img src={logo} alt="Logo" className="h-full w-full object-contain" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{yayasanName ?? "Yayasan Darul Rohman"}</p>
                    {tagline && <p className="truncate text-[11px] text-white/70">{tagline}</p>}
                  </div>
                </div>
                <nav className="flex-1 space-y-1 overflow-y-auto p-3">
                  {NAV.map((n) => (
                    <button
                      key={n.label}
                      onClick={() => { setOpen(false); goTo(n.href); }}
                      className="block w-full rounded-md px-3 py-2.5 text-left text-sm font-semibold text-white transition hover:bg-white/10 hover:text-secondary"
                    >
                      {n.label}
                    </button>
                  ))}
                </nav>
                <div className="border-t border-white/10 p-3">
                  <Link to="/login" onClick={() => setOpen(false)}>
                    <Button className="w-full bg-secondary text-secondary-foreground font-bold">
                      <LogIn className="mr-2 h-4 w-4" /> Login Admin
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
