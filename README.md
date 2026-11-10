# Pukur Pulse — Track Your Pond. Understand Your Farm.

Minimal DBMS lab project: pond & fish farm management (Next.js + MySQL, no ORM).

## Setup
1. Install Node 20+ and MySQL 8+.
2. `npm install`
3. Create the database (run as MySQL root, from this folder):
   ```
   mysql -u root -p < database/schema.sql
   mysql -u root -p < database/seed.sql      # development demo data
   mysql -u root -p < database/views.sql
   mysql -u root -p < database/indexes.sql   # run once
   ```
   (`schema.sql` also creates the `pukur_app` user with normal rights only. If you already have this user, keep your own password.)
4. Copy `.env.example` to `.env.local` and set the DB password and `SESSION_SECRET`.
   Do not put `#` in the DB password (.env treats it as a comment).
5. `npm run dev` → http://localhost:3000

## Demo account (development only)
`demo@pukurpulse.test` / `Demo@1234`

## Docs
`docs/DATABASE_DESIGN.md`, `docs/ERD.md`, `docs/PROJECT_PROGRESS.md`
