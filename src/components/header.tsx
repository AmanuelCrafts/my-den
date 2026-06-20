"use client";

import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";

export function Header() {
  const { logout } = useAuth();
  const router = useRouter();

  function handleLock() {
    logout();
    router.replace("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-900 bg-zinc-950/90 backdrop-blur-xl">
      <div className="mx-auto flex h-12 max-w-[430px] items-center justify-between px-4">
        <Link href="/dashboard" className="text-sm font-semibold tracking-tight text-zinc-100">
          My Den
        </Link>
        <button
          onClick={handleLock}
          className="rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-medium text-zinc-400 ring-1 ring-zinc-800 transition active:scale-95 active:bg-zinc-800"
        >
          🔒 Lock
        </button>
      </div>
    </header>
  );
}
