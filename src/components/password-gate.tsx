"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/auth-context";

export function PasswordGate() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const { login } = useAuth();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(false);
    const ok = login(password);
    if (ok) setPassword("");
    else setError(true);
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-[340px]">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[22px] bg-zinc-900 text-4xl ring-1 ring-zinc-800">
            🔐
          </div>
          <h1 className="text-2xl font-bold text-zinc-100">My Den</h1>
          <p className="mt-1.5 text-sm text-zinc-500">Enter password to unlock</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              className="w-full rounded-xl border-0 bg-zinc-900 px-5 py-3.5 text-base text-zinc-100 placeholder-zinc-600 ring-1 ring-zinc-800 outline-none transition focus:ring-2 focus:ring-emerald-500"
            />
            {error && (
              <p className="px-1 text-sm text-red-400">✖️ Wrong password</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-500 py-3.5 text-base font-semibold text-white transition active:scale-[0.98] active:bg-emerald-600"
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
}
