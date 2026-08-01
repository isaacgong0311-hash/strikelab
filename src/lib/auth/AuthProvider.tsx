"use client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

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

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      // isSupabaseConfigured is false here too, so `loading` is already
      // false from its initial state — no setState needed.
      return;
    }

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseBrowser();
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
