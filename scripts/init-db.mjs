/**
 * Creates the database and applies the schema without starting the app.
 * Useful on a fresh deploy: `npm run db:init`.
 */
import { createClient } from "@libsql/client";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const url = process.env.DATABASE_URL ?? "file:./data/crementum.db";

if (url.startsWith("file:")) {
  mkdirSync(dirname(url.slice("file:".length)), { recursive: true });
}

const db = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });

const statements = [
  `CREATE TABLE IF NOT EXISTS session_requests (
     id           INTEGER PRIMARY KEY AUTOINCREMENT,
     created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
     name         TEXT    NOT NULL,
     email        TEXT    NOT NULL,
     grade        TEXT,
     course_slug  TEXT,
     course_label TEXT    NOT NULL,
     needed_by    TEXT,
     details      TEXT    NOT NULL,
     status       TEXT    NOT NULL DEFAULT 'new'
   )`,
  `CREATE TABLE IF NOT EXISTS chapter_applications (
     id          INTEGER PRIMARY KEY AUTOINCREMENT,
     created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
     first_name  TEXT    NOT NULL,
     last_name   TEXT    NOT NULL,
     email       TEXT    NOT NULL,
     school      TEXT    NOT NULL,
     region      TEXT    NOT NULL,
     motivation  TEXT    NOT NULL,
     status      TEXT    NOT NULL DEFAULT 'new'
   )`,
  `CREATE INDEX IF NOT EXISTS idx_session_requests_created
     ON session_requests (created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_chapter_applications_created
     ON chapter_applications (created_at DESC)`,
];

for (const statement of statements) {
  await db.execute(statement);
}

console.log(`Schema applied to ${url}`);
