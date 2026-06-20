import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = req.headers.get("x-user-token") || "anon";
  const rows = db
    .prepare(
      `select c.*, json_group_array(
        json_object('id', b.id, 'collection_id', b.collection_id, 'title', b.title, 'url', b.url, 'created_at', b.created_at)
      ) filter (where b.id is not null) as bookmarks
      from collections c
      left join bookmarks b on b.collection_id = c.id
      where c.user_token = ?
      group by c.id
      order by c.created_at desc`
    )
    .all(token) as any[];

  const collections = rows.map((r) => ({
    ...r,
    bookmarks: JSON.parse(r.bookmarks),
  }));

  return NextResponse.json(collections);
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("x-user-token") || "anon";
  const { name } = await req.json();
  const id = crypto.randomUUID();

  db.prepare(
    "insert into collections (id, name, user_token) values (?, ?, ?)"
  ).run(id, name, token);

  const collection = db
    .prepare("select * from collections where id = ?")
    .get(id) as any;

  return NextResponse.json({ ...collection, bookmarks: [] });
}
