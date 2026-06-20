import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = req.headers.get("x-user-token") || "anon";

  const row = db
    .prepare(
      `select c.*, json_group_array(
        json_object('id', b.id, 'collection_id', b.collection_id, 'title', b.title, 'url', b.url, 'created_at', b.created_at)
      ) filter (where b.id is not null) as bookmarks
      from collections c
      left join bookmarks b on b.collection_id = c.id
      where c.id = ? and c.user_token = ?
      group by c.id`
    )
    .get(id, token) as any;

  if (!row) return NextResponse.json(null);
  return NextResponse.json({ ...row, bookmarks: JSON.parse(row.bookmarks) });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = req.headers.get("x-user-token") || "anon";

  db.prepare(
    "delete from collections where id = ? and user_token = ?"
  ).run(id, token);

  return NextResponse.json({ ok: true });
}
