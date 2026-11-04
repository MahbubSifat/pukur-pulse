# Pukur Pulse — Project Progress

## Current phase
Phase 0 — Foundation (awaiting student verification)

## Completed
- [x] Next.js App Router (JavaScript) + Tailwind v4 scaffold
- [x] Dependencies: mysql2, lucide-react, chart.js, react-chartjs-2
- [x] Folder structure
- [x] MySQL connection pool + transaction helper
- [x] /api/health endpoint
- [x] Design tokens (colors, fonts, focus, reduced-motion)
- [x] Database pukur_pulse + least-privilege user pukur_app
- [x] Phase 1 (part 1+2): schema.sql — 11 tables, 10 FK, 23 CHECK, 5 UNIQUE (constraint tests passed)
- [x] Phase 1: seed.sql — 6 farmers, 9 ponds, 13 batches, 46 feed logs, 23 water readings, 8 disease cases, 9 harvests, 16 sales, 30 expenses (verified)
- [x] Phase 1: views.sql (3 views), indexes.sql (6 composite indexes); batch financial summary verified against raw tables (0 mismatches)


## Pending
- Phase 1: Database (11 tables, constraints, seed, views, indexes)
- Phase 2: Auth + roles + layout shell
- Phase 3–7: Modules, reports, DBMS Explorer
- Phase 8: UI audit, responsive, accessibility
- Phase 9: 47-topic test cases, documentation, viva guide

## Known issues
- create-next-app enables cacheComponents by default; disabled because every page reads cookies/MySQL
- Estimated Recorded Profit/Loss is negative overall because active batches have costs but no revenue yet; label it clearly in reports

## Syllabus
-- Done: #1 CREATE DATABASE, #2 CREATE TABLE, #3 INSERT, #32 Primary Keys, #33 Foreign Keys, #34 UNIQUE, #35 CHECK, #36 Referential Integrity, #37 CREATE VIEW, #38 CREATE USER, #39 GRANT, #40 SHOW GRANTS, #45 CREATE INDEX
- Remaining: 34 topics (#46 DROP INDEX and #47 EXPLAIN get their full before/after demo in the Phase 7 lab)

## Next recommended action
Phase 1 — views.sql and indexes.sql, then correct financial summary queries