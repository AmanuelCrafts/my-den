"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { supabase } from "@/lib/supabase/client";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const PASSWORD = process.env.NEXT_PUBLIC_APP_PASSWORD ?? "Gon_123)";
const INACTIVITY_MS = 15 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSession = useCallback(async () => {
    setIsAuthenticated(false);
    await supabase.auth.signOut();
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      clearSession();
    }, INACTIVITY_MS);
  }, [clearSession]);

  useEffect(() => {
    supabase.auth.signOut().finally(() => setLoading(false));
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    resetTimer();
    const events = ["mousedown", "touchstart", "keydown", "scroll"] as const;
    const handler = () => resetTimer();
    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isAuthenticated, resetTimer]);

  const login = useCallback(async (password: string): Promise<boolean> => {
    if (password !== PASSWORD) return false;
    const { error } = await supabase.auth.signInAnonymously();
    if (error) return false;
    setIsAuthenticated(true);
    return true;
  }, []);

  const logout = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
