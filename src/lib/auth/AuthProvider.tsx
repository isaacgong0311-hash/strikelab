"use client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { usePathname } from "next/navigation";
import type { Session, User } from "@supabase/supabase-js";
import { hasSupabaseSessionCookie, loadSupabaseBrowser } from "@/lib/supabase/lazy";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { setMonitoringUser } from "@/lib/monitoring";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** Auth is wired up (env vars present). */
  enabled: boolean;
  /** Best-effort display name (from user metadata), falls back to email prefix. */
  displayName: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  enabled: false,
  displayName: null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  // Signed-out visitors never load supabase-js (src/lib/supabase/lazy.ts).
  // Re-checked on every navigation, because signing in with a password
  // happens client-side and sets the session cookie without a reload.
  const pathname = usePathname();
  const [listening, setListening] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || listening) return;
    let active = true;
    // Read the cookie jar (an external system) in a callback, not the effect body.
    void Promise.resolve().then(() => {
      if (!active) return;
      if (hasSupabaseSessionCookie()) {
        setLoading(true);
        setListening(true);
      } else {
        // Nothing to load: leave the initial "checking" state as signed out.
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [pathname, listening]);

  useEffect(() => {
    if (!listening) return;
    let active = true;
    let unsubscribe = () => {};

    void loadSupabaseBrowser().then((supabase) => {
      if (!active) return;
      if (!supabase) {
        setLoading(false);
        return;
      }

      supabase.auth.getSession().then(({ data }) => {
        if (!active) return;
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setLoading(false);
        // Tags error reports with the account id (no email: most users are
        // minors, and the id is enough to trace a crash). No-op without a DSN.
        setMonitoringUser(data.session?.user ? { id: data.session.user.id } : null);
      });

      const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
        setMonitoringUser(newSession?.user ? { id: newSession.user.id } : null);
      });
      unsubscribe = () => sub.subscription.unsubscribe();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [listening]);

  const signOut = useCallback(async () => {
    const supabase = await loadSupabaseBrowser();
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  const displayName = useMemo(() => {
    if (!user) return null;
    const meta = user.user_metadata ?? {};
    return (
      (meta.display_name as string) ||
      (meta.full_name as string) ||
      (meta.name as string) ||
      user.email?.split("@")[0] ||
      null
    );
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      enabled: isSupabaseConfigured,
      displayName,
      signOut,
    }),
    [user, session, loading, displayName, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
