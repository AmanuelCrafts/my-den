import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  create table if not exists collections (
    id text primary key,
    name text not null,
    user_token text not null,
    created_at text not null default (datetime('now'))
  );

  create table if not exists bookmarks (
    id text primary key,
    collection_id text not null references collections(id) on delete cascade,
    title text not null,
    url text not null,
    created_at text not null default (datetime('now'))
  );

  create index if not exists idx_collections_user on collections(user_token);
  create index if not exists idx_bookmarks_collection on bookmarks(collection_id);
`);

export default db;
