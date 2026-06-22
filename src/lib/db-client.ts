import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

let _userToken: string | null = null;

export function setUserToken(token: string | null) {
  _userToken = token;
}

function token(): string {
  return _userToken ?? "";
}

export async function getCollections(): Promise<Collection[]> {
  const t = token();
  if (!t) return [];
  const { data } = await supabase
    .from("collections")
    .select("id, name, created_at")
    .eq("user_token", t)
    .order("created_at", { ascending: false });
  const cols = (data ?? []) as Omit<Collection, "bookmarks">[];
  const result: Collection[] = [];
  for (const c of cols) {
    const { data: bm } = await supabase
      .from("bookmarks")
      .select("id, collection_id, title, url, created_at")
      .eq("collection_id", c.id)
      .order("created_at", { ascending: true });
    result.push({ ...c, bookmarks: (bm ?? []) as Bookmark[] });
  }
  return result;
}

export async function getCollection(id: string): Promise<Collection | null> {
  const t = token();
  if (!t) return null;
  const { data: col } = await supabase
    .from("collections")
    .select("id, name, created_at")
    .eq("id", id)
    .eq("user_token", t)
    .single();
  if (!col) return null;
  const c = col as Omit<Collection, "bookmarks">;
  const { data: bm } = await supabase
    .from("bookmarks")
    .select("id, collection_id, title, url, created_at")
    .eq("collection_id", id)
    .order("created_at", { ascending: true });
  return { ...c, bookmarks: (bm ?? []) as Bookmark[] };
}

export async function createCollection(name: string): Promise<Collection> {
  const t = token();
  const { data, error } = await supabase
    .from("collections")
    .insert({ name, user_token: t })
    .select("id, name, created_at")
    .single();
  if (error) throw error;
  return { ...(data as Omit<Collection, "bookmarks">), bookmarks: [] };
}

export async function deleteCollection(id: string): Promise<void> {
  const t = token();
  await supabase
    .from("collections")
    .delete()
    .eq("id", id)
    .eq("user_token", t);
}

export async function addBookmark(
  collectionId: string,
  title: string,
  url: string
): Promise<Bookmark> {
  const { data, error } = await supabase
    .from("bookmarks")
    .insert({ collection_id: collectionId, title, url })
    .select("id, collection_id, title, url, created_at")
    .single();
  if (error) throw error;
  return data as Bookmark;
}

export async function deleteBookmark(id: string): Promise<void> {
  await supabase.from("bookmarks").delete().eq("id", id);
}
