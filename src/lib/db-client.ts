export interface Collection {
  id: string;
  name: string;
  bookmarks: Bookmark[];
  created_at: string;
}

export interface Bookmark {
  id: string;
  collection_id: string;
  title: string;
  url: string;
  created_at: string;
}

const TOKEN_KEY = "myden-token";

function getToken(): string {
  if (typeof window === "undefined") return "";
  let token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(TOKEN_KEY, token);
  }
  return token;
}

async function api(path: string, options?: RequestInit) {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-user-token": getToken(),
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getCollections(): Promise<Collection[]> {
  return api("/api/collections");
}

export async function getCollection(id: string): Promise<Collection | null> {
  const data = await api(`/api/collections/${id}`);
  return data ?? null;
}

export async function createCollection(name: string): Promise<Collection> {
  return api("/api/collections", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function deleteCollection(id: string): Promise<void> {
  await api(`/api/collections/${id}`, { method: "DELETE" });
}

export async function addBookmark(
  collectionId: string,
  title: string,
  url: string
): Promise<Bookmark> {
  return api("/api/bookmarks", {
    method: "POST",
    body: JSON.stringify({ collectionId, title, url }),
  });
}

export async function deleteBookmark(id: string): Promise<void> {
  await api(`/api/bookmarks?id=${id}`, { method: "DELETE" });
}
