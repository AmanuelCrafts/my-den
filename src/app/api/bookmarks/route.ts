import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: NextRequest) {
  const token = req.headers.get("x-user-token") || "anon";
  const { collectionId, title, url } = await req.json();

  const collection = db
    .prepare("select id from collections where id = ? and user_token = ?")
    .get(collectionId, token) as any;

  if (!collection) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const id = crypto.randomUUID();
  db.prepare(
    "insert into bookmarks (id, collection_id, title, url) values (?, ?, ?, ?)"
  ).run(id, collectionId, title, url);

  const bookmark = db
    .prepare("select * from bookmarks where id = ?")
    .get(id);

  return NextResponse.json(bookmark);
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const bookmark = db.prepare("select b.* from bookmarks b join collections c on c.id = b.collection_id where b.id = ? and c.user_token = ?").get(id, req.headers.get("x-user-token") || "anon") as any;
  if (!bookmark) return NextResponse.json({ error: "Not found" }, { status: 404 });

  db.prepare("delete from bookmarks where id = ?").run(id);
  return NextResponse.json({ ok: true });
}
