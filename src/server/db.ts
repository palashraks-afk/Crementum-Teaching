import "server-only";
import { createClient, type Client } from "@libsql/client";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DEFAULT_BRANCHES } from "@/content/site";

const url = process.env.DATABASE_URL ?? "file:./data/crementum.db";

function ensureLocalDir(target: string) {
  if (!target.startsWith("file:")) return;
  const path = target.slice("file:".length);
  try {
    mkdirSync(dirname(path), { recursive: true });
  } catch {
    /* exists */
  }
}

let client: Client | undefined;
let ready: Promise<void> | undefined;

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS session_requests (
     id           INTEGER PRIMARY KEY AUTOINCREMENT,
     created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
     user_id      TEXT,
     name         TEXT    NOT NULL,
     email        TEXT    NOT NULL,
     grade        TEXT,
     course_slug  TEXT,
     course_label TEXT    NOT NULL,
     needed_by    TEXT,
     details      TEXT    NOT NULL,
     scheduled_at TEXT,
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
  `CREATE TABLE IF NOT EXISTS contact_messages (
     id         INTEGER PRIMARY KEY AUTOINCREMENT,
     created_at TEXT    NOT NULL DEFAULT (datetime('now')),
     name       TEXT    NOT NULL,
     email      TEXT    NOT NULL,
     send_to    TEXT    NOT NULL,
     message    TEXT    NOT NULL,
     status     TEXT    NOT NULL DEFAULT 'new'
   )`,
  `CREATE TABLE IF NOT EXISTS branches (
     id         TEXT PRIMARY KEY,
     city       TEXT NOT NULL,
     region     TEXT NOT NULL,
     country    TEXT NOT NULL DEFAULT 'USA',
     lat        REAL NOT NULL,
     lng        REAL NOT NULL,
     hq         INTEGER NOT NULL DEFAULT 0,
     created_at TEXT NOT NULL DEFAULT (datetime('now'))
   )`,
  `CREATE TABLE IF NOT EXISTS users (
     id            TEXT PRIMARY KEY,
     email         TEXT NOT NULL UNIQUE,
     name          TEXT,
     image         TEXT,
     password_hash TEXT,
     branch_id     TEXT,
     remind        INTEGER NOT NULL DEFAULT 1,
     created_at    TEXT NOT NULL DEFAULT (datetime('now'))
   )`,
  `CREATE INDEX IF NOT EXISTS idx_session_requests_email
     ON session_requests (email)`,
  `CREATE INDEX IF NOT EXISTS idx_session_requests_created
     ON session_requests (created_at DESC)`,
];

export async function getDb(): Promise<Client> {
  if (!client) {
    ensureLocalDir(url);
    client = createClient({
      url,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
  }

  if (!ready) {
    const db = client;
    ready = (async () => {
      for (const statement of SCHEMA) {
        await db.execute(statement);
      }
      // CREATE TABLE IF NOT EXISTS never adds columns to a table that already
      // exists, so databases created by an older schema need them backfilled.
      const ADDED_COLUMNS: Record<string, Record<string, string>> = {
        users: {
          password_hash: "TEXT",
          branch_id: "TEXT",
        },
        session_requests: {
          user_id: "TEXT",
          scheduled_at: "TEXT",
        },
        branches: {
          school: "TEXT",
          lead: "TEXT",
          contact_email: "TEXT",
          founded: "TEXT",
          about: "TEXT",
        },
      };

      for (const [table, columns] of Object.entries(ADDED_COLUMNS)) {
        const info = await db.execute(`PRAGMA table_info(${table})`);
        const have = new Set(info.rows.map((row) => String(row.name)));
        for (const [column, type] of Object.entries(columns)) {
          if (!have.has(column)) {
            await db.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
          }
        }
      }

      const count = await db.execute("SELECT COUNT(*) AS n FROM branches");
      const n = Number(count.rows[0]?.n ?? 0);
      if (n === 0) {
        for (const b of DEFAULT_BRANCHES) {
          await db.execute({
            sql: `INSERT INTO branches (id, city, region, country, lat, lng, hq)
                  VALUES (?, ?, ?, ?, ?, ?, ?)`,
            args: [b.id, b.city, b.region, b.country, b.lat, b.lng, b.hq ? 1 : 0],
          });
        }
      }
    })().catch((error) => {
      ready = undefined;
      throw error;
    });
  }

  await ready;
  return client;
}

export type DbBranch = {
  id: string;
  city: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
  hq: boolean;
  /* Optional detail, filled in from /admin and shown when a pin is opened. */
  school: string | null;
  lead: string | null;
  contactEmail: string | null;
  founded: string | null;
  about: string | null;
};

function toBranch(row: Record<string, unknown>): DbBranch {
  const text = (v: unknown) => (v ? String(v) : null);
  return {
    id: String(row.id),
    city: String(row.city),
    region: String(row.region),
    country: String(row.country),
    lat: Number(row.lat),
    lng: Number(row.lng),
    hq: Boolean(row.hq),
    school: text(row.school),
    lead: text(row.lead),
    contactEmail: text(row.contact_email),
    founded: text(row.founded),
    about: text(row.about),
  };
}

export async function getBranches(): Promise<DbBranch[]> {
  const db = await getDb();
  const result = await db.execute("SELECT * FROM branches ORDER BY hq DESC, city ASC");
  return result.rows.map((row) => toBranch(row as unknown as Record<string, unknown>));
}

export async function upsertBranch(branch: {
  id: string;
  city: string;
  region: string;
  country: string;
  lat: number;
  lng: number;
  hq: boolean;
  school?: string | null;
  lead?: string | null;
  contactEmail?: string | null;
  founded?: string | null;
  about?: string | null;
}): Promise<void> {
  const db = await getDb();
  await db.execute({
    sql: `INSERT INTO branches
            (id, city, region, country, lat, lng, hq, school, lead, contact_email, founded, about)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            city=excluded.city, region=excluded.region, country=excluded.country,
            lat=excluded.lat, lng=excluded.lng, hq=excluded.hq,
            school=excluded.school, lead=excluded.lead,
            contact_email=excluded.contact_email, founded=excluded.founded,
            about=excluded.about`,
    args: [
      branch.id,
      branch.city,
      branch.region,
      branch.country,
      branch.lat,
      branch.lng,
      branch.hq ? 1 : 0,
      branch.school ?? null,
      branch.lead ?? null,
      branch.contactEmail ?? null,
      branch.founded ?? null,
      branch.about ?? null,
    ],
  });
}

export async function deleteBranch(id: string): Promise<void> {
  const db = await getDb();
  await db.execute({ sql: "DELETE FROM branches WHERE id = ?", args: [id] });
}

/* ---------------------------------------------------------------- users -- */

export type DbUser = {
  id: string;
  email: string;
  name: string | null;
  passwordHash: string | null;
  branchId: string | null;
};

function toUser(row: Record<string, unknown>): DbUser {
  return {
    id: String(row.id),
    email: String(row.email),
    name: row.name ? String(row.name) : null,
    passwordHash: row.password_hash ? String(row.password_hash) : null,
    branchId: row.branch_id ? String(row.branch_id) : null,
  };
}

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const db = await getDb();
  const result = await db.execute({
    sql: "SELECT * FROM users WHERE email = ? LIMIT 1",
    args: [email.trim().toLowerCase()],
  });
  const row = result.rows[0];
  return row ? toUser(row as unknown as Record<string, unknown>) : null;
}

/** Inserts if new, and fills in a missing name on an existing row. */
export async function upsertUser(input: {
  id: string;
  email: string;
  name?: string | null;
  passwordHash?: string | null;
}): Promise<DbUser> {
  const db = await getDb();
  const email = input.email.trim().toLowerCase();
  await db.execute({
    sql: `INSERT INTO users (id, email, name, password_hash)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(email) DO UPDATE SET name = COALESCE(users.name, excluded.name)`,
    args: [input.id, email, input.name ?? null, input.passwordHash ?? null],
  });
  const user = await getUserByEmail(email);
  if (!user) throw new Error("user vanished immediately after upsert");
  return user;
}

export async function setUserBranch(email: string, branchId: string): Promise<void> {
  const db = await getDb();
  await db.execute({
    sql: "UPDATE users SET branch_id = ? WHERE email = ?",
    args: [branchId, email.trim().toLowerCase()],
  });
}
