import { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { dashboardPathFor } from "@/lib/units";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn, ArrowLeft, Loader2 } from "lucide-react";
import logo from "@/assets/logo-yayasan.png";

export default function Login() {
  const { user, role, profile, loading, signIn } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user && role) {
    return <Navigate to={dashboardPathFor(role, profile?.unit ?? null)} replace />;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await signIn(email.trim(), password);
    setSubmitting(false);
    if (res.ok) {
      toast.success("Selamat datang!");
      nav("/dashboard", { replace: true });
    } else {
      toast.error(res.message ?? "Login gagal");
    }
  };

  return (
    <div className="relative min-h-screen w-full gradient-hero p-4 md:p-8">
      <Link to="/" className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-white/20 md:left-6 md:top-6">
        <ArrowLeft className="h-3.5 w-3.5" /> Beranda Yayasan
      </Link>
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg items-center">
        <Card className="w-full rounded-2xl border-0 shadow-md-soft">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-1.5 shadow-soft">
              <img src={logo} alt="Logo Yayasan" className="h-full w-full object-contain" />
            </div>
            <div>
              <CardTitle className="font-display text-2xl">Masuk ke Sistem</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Yayasan Darul Rohman — Sistem Terpadu Pendidikan</p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@darulrohman.id" required className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPwd ? "text" : "password"} value={password}
                    onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required
                    className="h-11 pr-10" />
                  <button type="button" onClick={() => setShowPwd((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={submitting}
                className="h-11 w-full gradient-primary text-primary-foreground shadow-md-soft hover:opacity-95">
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                {submitting ? "Memproses..." : "Masuk"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
