"use client";

import { useState, type FormEvent } from "react";

export function AddUrlForm({ onAdd }: { onAdd: (title: string, url: string) => void }) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    onAdd(title.trim(), url.trim());
    setTitle("");
    setUrl("");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      <div className="flex gap-2.5">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Label"
          className="min-w-0 flex-1 rounded-xl border-0 bg-zinc-900 px-4 py-3.5 text-sm text-zinc-100 placeholder-zinc-600 ring-1 ring-zinc-800 outline-none transition focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://"
          className="min-w-0 flex-[2] rounded-xl border-0 bg-zinc-900 px-4 py-3.5 text-sm text-zinc-100 placeholder-zinc-600 ring-1 ring-zinc-800 outline-none transition focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-white transition active:scale-[0.98] active:bg-emerald-600"
      >
        ➕ Add Bookmark
      </button>
    </form>
  );
}
