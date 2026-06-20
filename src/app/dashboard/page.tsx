"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Header } from "@/components/header";
import { getCollections, createCollection, deleteCollection, type Collection } from "@/lib/db-client";

export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.replace("/");
  }, [isAuthenticated, router]);

  const load = useCallback(async () => {
    const data = await getCollections();
    setCollections(data);
  }, []);

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated, load]);

  async function handleCreate() {
    if (!name.trim()) return;
    setBusy(true);
    await createCollection(name.trim());
    setName("");
    await load();
    setBusy(false);
  }

  async function handleDelete(id: string) {
    await deleteCollection(id);
    await load();
  }

  if (!isAuthenticated) return null;

  return (
    <>
      <Header />
      <main className="mx-auto min-h-dvh max-w-[430px] px-4 pb-24 pt-6">
        <h1 className="text-2xl font-bold text-zinc-100">📁 Collections</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {collections.length} collection{collections.length !== 1 ? "s" : ""}
        </p>

        <div className="mt-5 flex gap-2.5">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Collection name"
            className="min-w-0 flex-1 rounded-xl border-0 bg-zinc-900 px-4 py-3.5 text-sm text-zinc-100 placeholder-zinc-600 ring-1 ring-zinc-800 outline-none transition focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={handleCreate}
            disabled={busy}
            className="rounded-xl bg-emerald-500 px-5 py-3.5 text-sm font-semibold text-white transition active:scale-[0.98] active:bg-emerald-600 disabled:opacity-50"
          >
            New
          </button>
        </div>

        <div className="mt-5 space-y-2.5">
          {collections.length === 0 && (
            <p className="py-14 text-center text-sm text-zinc-600">
              📂 No collections yet
            </p>
          )}
          {collections.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl bg-zinc-900/80 ring-1 ring-zinc-800 transition active:ring-zinc-700"
            >
              <div className="flex items-center px-5 py-4">
                <Link href={`/collection/${c.id}`} className="min-w-0 flex-1">
                  <h3 className="text-base font-medium text-zinc-100">{c.name}</h3>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    🔗 {c.bookmarks?.length ?? 0} link{(c.bookmarks?.length ?? 0) !== 1 ? "s" : ""}
                  </p>
                </Link>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-sm transition active:bg-red-900/50"
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
