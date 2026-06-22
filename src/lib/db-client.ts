import { supabase } from "@/lib/supabase/client";

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

async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.id ?? null;
}

export async function getCollections(): Promise<Collection[]> {
  const userId = await getUserId();
  if (!userId) return [];
  const { data } = await supabase
    .from("collections")
    .select("id, name, created_at")
    .eq("user_token", userId)
    .order("created_at", { ascending: false });
  const collections = (data ?? []) as Omit<Collection, "bookmarks">[];
  const result: Collection[] = [];
  for (const c of collections) {
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
  const userId = await getUserId();
  if (!userId) return null;
  const { data: col } = await supabase
    .from("collections")
    .select("id, name, created_at")
    .eq("id", id)
    .eq("user_token", userId)
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
  const userId = await getUserId();
  const { data, error } = await supabase
    .from("collections")
    .insert({ name, user_token: userId })
    .select("id, name, created_at")
    .single();
  if (error) throw error;
  return { ...(data as Omit<Collection, "bookmarks">), bookmarks: [] };
}

export async function deleteCollection(id: string): Promise<void> {
  const userId = await getUserId();
  await supabase
    .from("collections")
    .delete()
    .eq("id", id)
    .eq("user_token", userId);
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
