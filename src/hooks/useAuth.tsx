import { useQuery } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";
import type { AppRole, Profile } from "@/lib/types";

interface AuthState {
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthState>({ session: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session: current } }) => {
      setSession(current);
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ session, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function useCurrentUser() {
  const { session, loading } = useAuth();
  const userId = session?.user.id;

  const profile = useQuery({
    queryKey: ["me", "profile", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as Profile | null;
    },
  });

  const roles = useQuery({
    queryKey: ["me", "roles", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      if (error) throw new Error(error.message);
      return (data as { role: AppRole }[]).map((r) => r.role);
    },
  });

  const roleList = roles.data ?? [];
  return {
    session,
    userId,
    profile: profile.data ?? null,
    roles: roleList,
    isStaff: roleList.some((r) => r !== "subscriber"),
    isEditor: roleList.includes("owner") || roleList.includes("editor"),
    loading: loading || (Boolean(userId) && (profile.isLoading || roles.isLoading)),
  };
}
