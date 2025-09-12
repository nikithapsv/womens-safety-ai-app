"use client";

import { useCallback, useMemo, useState } from "react";

export type Session = { user: { id: string; email?: string; name?: string } } | null;

export const authClient = {
  signUp: {
    email: async ({ email, name, password }: { email: string; name?: string; password: string }) => {
      // mock success
      await new Promise((r) => setTimeout(r, 300));
      return { data: { user: { id: "1", email, name } }, error: null as null | { code: string } };
    },
  },
  signIn: {
    email: async ({ email, password, rememberMe, callbackURL }: { email: string; password: string; rememberMe?: boolean; callbackURL?: string }) => {
      await new Promise((r) => setTimeout(r, 300));
      if (!email || !password) {
        return { data: null, error: { code: "INVALID_CREDENTIALS" } as const };
      }
      // store a mock bearer token for API calls
      try { localStorage.setItem("bearer_token", "mock-token"); } catch {}
      return { data: { session: { user: { id: "1", email } } }, error: null };
    },
  },
  signOut: async () => {
    await new Promise((r) => setTimeout(r, 200));
    try { localStorage.removeItem("bearer_token"); } catch {}
    return { error: null as null | { code: string } };
  },
};

export function useSession() {
  const [user, setUser] = useState<Session["user"] | null>(null);
  const [pending, setPending] = useState(false);

  const refetch = useCallback(() => {
    setPending(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
      setUser(token ? { id: "1" } as any : null);
    } finally {
      setPending(false);
    }
  }, []);

  const data = useMemo(() => (user ? ({ user } as any) : null), [user]);

  return { data, isPending: pending, refetch } as { data: { user: { id: string } } | null; isPending: boolean; refetch: () => void };
}