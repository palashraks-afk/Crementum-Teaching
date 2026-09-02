# Crementum

The Crementum site — a 501(c)(3) running free one-on-one peer tutoring. Next.js App Router,
frontend and backend in one deployable app.

## Running it

```bash
npm install
cp .env.example .env
npm run dev
```

Then open http://localhost:3300.

Nothing else is required to develop. The database file is created on first write, and with no
`RESEND_API_KEY` set, notification emails are written to the server log instead of being sent —
submissions are still saved either way.

## How it is put together

```
src/
  app/                 pages, one folder per route
  components/          UI, each with its own .module.css
  content/             the catalog, chapters, FAQ, and site constants
  server/              database, validation, email, rate limiting, server actions
scripts/init-db.mjs    applies the schema without starting the app
```

**Content lives in `src/content/`, not in markup.** Adding a course means adding one line to
`catalog.ts` — it then appears in the homepage index, the subjects page, the booking dropdown,
and the course count, with no other edits.

**Forms are server actions**, not API routes. `src/server/actions.ts` validates with Zod, writes
the row, and sends the notification. Because they are plain form posts, the forms submit and show
their errors even if the page's JavaScript never loads.

## Database

libSQL, which is SQLite locally and Turso in production.

- Local: `DATABASE_URL="file:./data/crementum.db"` — the default, created automatically.
- Production: set `DATABASE_URL` to a Turso URL and `DATABASE_AUTH_TOKEN` to its token.

Two tables, `session_requests` and `chapter_applications`, both with a `status` column that
starts at `new` so requests can be triaged later. The schema is applied on first connection and
is idempotent.

Reading what has come in, until there is an admin screen:

```bash
node -e "const{createClient}=require('@libsql/client');createClient({url:'file:./data/crementum.db'}).execute('SELECT * FROM session_requests ORDER BY id DESC').then(r=>console.table(r.rows))"
```

## Email

Set `RESEND_API_KEY` and verify a sending domain at resend.com, then point `NOTIFY_FROM` at an
address on it. `NOTIFY_EMAIL` is where notifications land. Replies go to the student, because
each notification sets reply-to.

Delivery failures are logged and never fail the submission — the row is already saved.

## Design

Tokens are at the top of `src/app/globals.css` and everything derives from them.

- **Ink** `#161A1C`, **slate** `#24383F`, **paper** `#EEF0EC`, **highlighter** `#DDF25B`.
- Familjen Grotesk for display, Newsreader for reading, Martian Mono for labels and data.
- The highlighter is the only loud colour. It marks search hits in the course index, the timing
  labels on the process steps, and one word in a headline. Adding a fourth use will cost the
  other three their meaning.
- Section padding comes from `.band` alone, so two rules can never fight over vertical rhythm.

## Before this goes live

- Replace the founding story in `src/app/about/page.tsx` — it is marked with a `TODO` and is
  currently written generically because the real history is not in the codebase.
- Check the wording in `RECOGNITION` (`src/content/site.ts`). "Recognized by the US House of
  Representatives" should match whatever the actual recognition was.
- Update `SITE.stats` when the session and chapter counts move.
- `metadataBase` in `src/app/layout.tsx` is set to `https://crementum.org`. Point it at the real
  domain so social previews resolve.
- Rate limiting is per-process and in-memory (`src/server/rate-limit.ts`). It is enough for a
  single instance; move it to the database or an edge limiter before running several.
