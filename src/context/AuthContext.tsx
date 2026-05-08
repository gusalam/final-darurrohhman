import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Role, UnitKey } from "@/lib/units";

export interface AuthProfile {
  id: string;
  email: string;
  nama: string;
  unit: UnitKey | null;
  avatar_url: string | null;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: AuthProfile | null;
  role: Role | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  signOut: () => Promise<void>;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  // Load profile + role for given user (deferred so we never block onAuthStateChange).
  const loadIdentity = async (uid: string) => {
    const [{ data: prof }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("id,email,nama,unit,avatar_url").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid),
    ]);
    setProfile(prof ?? null);
    // Pilih role tertinggi: super_admin > admin_*
    const list = (roles ?? []).map((r) => r.role as Role);
    const chosen: Role | null = list.includes("super_admin")
      ? "super_admin"
      : list[0] ?? null;
    setRole(chosen);
  };

  useEffect(() => {
    // 1) Pasang listener DULU (best practice agar tidak miss event).
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        // Defer ke microtask untuk hindari deadlock dengan SDK.
        setTimeout(() => { loadIdentity(sess.user.id); }, 0);
      } else {
        setProfile(null);
        setRole(null);
      }
    });

    // 2) Lalu cek session yang sudah ada.
    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) loadIdentity(sess.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, message: error.message };
    return { ok: true };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setRole(null);
  };

  const hasRole = (...roles: Role[]) => (role ? roles.includes(role) : false);

  return (
    <AuthContext.Provider value={{ session, user, profile, role, loading, signIn, signOut, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
