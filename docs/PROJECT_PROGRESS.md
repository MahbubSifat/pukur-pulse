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

## Pending
- Phase 1: Database (11 tables, constraints, seed, views, indexes)
- Phase 2: Auth + roles + layout shell
- Phase 3–7: Modules, reports, DBMS Explorer
- Phase 8: UI audit, responsive, accessibility
- Phase 9: 47-topic test cases, documentation, viva guide

## Known issues
- create-next-app enables cacheComponents by default; disabled because every page reads cookies/MySQL

## Syllabus
- Done: #1 CREATE DATABASE, #2 CREATE TABLE, #32 Primary Keys, #33 Foreign Keys, #34 UNIQUE, #35 CHECK, #36 Referential Integrity, #38 CREATE USER, #39 GRANT, #40 SHOW GRANTS
- Remaining: 37 topics

## Next recommended action
Phase 1 — review the 11-table design and write schema.sql