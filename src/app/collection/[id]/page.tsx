"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Header } from "@/components/header";
import { AddUrlForm } from "@/components/add-url-form";
import { getCollection, addBookmark, deleteBookmark, type Collection } from "@/lib/db-client";

export default function CollectionPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [collection, setCollection] = useState<Collection | null>(null);

  const load = useCallback(async () => {
    const col = await getCollection(id);
    if (!col) router.replace("/dashboard");
    else setCollection(col);
  }, [id, router]);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace("/");
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) load();
  }, [isAuthenticated, load]);

  async function handleAdd(title: string, url: string) {
    await addBookmark(id, title, url);
    await load();
  }

  async function handleDelete(bookmarkId: string) {
    await deleteBookmark(bookmarkId);
    await load();
  }

  if (loading || !isAuthenticated || !collection) return null;

  function getDomain(u: string) {
    try { return new URL(u).hostname.replace("www.", ""); }
    catch { return u; }
  }

  const bookmarks = collection.bookmarks ?? [];

  return (
    <>
      <Header />
      <main className="mx-auto min-h-dvh max-w-[430px] px-4 pb-24 pt-3">
        <Link
          href="/dashboard"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-sm ring-1 ring-zinc-800 transition active:bg-zinc-800"
        >
          ←
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-zinc-100">
          📂 {collection.name}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          🔗 {bookmarks.length} link{bookmarks.length !== 1 ? "s" : ""}
        </p>

        <div className="mt-6">
          <AddUrlForm onAdd={handleAdd} />
        </div>

        <div className="mt-5 space-y-2">
          {bookmarks.length === 0 && (
            <p className="py-14 text-center text-sm text-zinc-600">
              🔖 No bookmarks yet
            </p>
          )}
          {[...bookmarks].reverse().map((b: any) => (
            <div
              key={b.id}
              className="rounded-2xl bg-zinc-900/80 px-5 py-4 ring-1 ring-zinc-800 transition active:ring-zinc-700"
            >
              <div className="flex items-center gap-3">
                <a
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 flex-1"
                >
                  <p className="truncate text-sm font-medium text-zinc-200">{b.title}</p>
                  <p className="mt-0.5 truncate text-xs text-zinc-500">
                    🌐 {getDomain(b.url)}
                  </p>
                </a>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-sm transition active:bg-red-900/50"
                  title="Remove"
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
