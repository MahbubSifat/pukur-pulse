# Project Progress

## Status: Minimal rebuild, Phase 5 in progress (Ponds, Batches, Feed & Water done)

### Changes from the old (bigger) version
- 11 tables → **9 tables** (removed `farmers`, `app_users`, `disease_cases`; renamed `other_expenses` → `expenses`)
- 2 roles (farmer/officer) → **one user type**
- Login by **email + password**; registration = name, email, **phone**, password, confirm
- `sales` now belongs to `batch_id` (was `harvest_id`)
- Removed unused/broken files, role/permission layer, officer pages, extra helper folders

### Done and tested
- [x] schema / seed / views / indexes load cleanly; 9 tables, 2 views
- [x] Constraints rejected invalid data (UNIQUE, CHECK, FK, delete RESTRICT)
- [x] Financial view = raw SQL totals (cost ৳430,120, revenue ৳574,450, diff 0)
- [x] Register / login (email) / logout; bcrypt hash; HttpOnly cookie
- [x] Protected pages (redirect to /login), API 401 when signed out
- [x] User isolation: other user's ponds/batches → 404; body `user_id` ignored
- [x] Pond CRUD + details, Batch CRUD + details, safe delete (409 message)
- [x] Dashboard 8 stat cards match raw SQL
- [x] Feed CRUD: date must be between stocking date and today; qty > 0; cost >= 0; fixed feed types
- [x] Water readings CRUD: blank field saved as NULL (never 0); at least one value required; ranges pH 0-14, DO 0-30, temp 0-50
- [x] Warning badges (demo thresholds, note shown on page); NULL never triggers a warning
- [x] Feed/water ownership: other user's batch/pond/record -> 404 or field error
- [x] `next build` succeeds

### Remaining
- [ ] Harvest, Sales (transaction + row lock), Expenses page
- [ ] Dashboard: 3 charts + recent tables
- [ ] MySQL Lab (47 topics) + docs/SYLLABUS_COVERAGE.md
- [ ] Responsive/UI review, screenshots, final README

### Syllabus verified so far (SQL run and checked)
#1 CREATE DATABASE, #2 CREATE TABLE, #3 INSERT, #32–#36 constraints, #37 CREATE VIEW, #45 CREATE INDEX.
(#38–#40 `pukur_app` user is created; the separate lab demo user comes with the MySQL Lab.)

### Known issues
- Google Fonts need internet at build time (works on a normal machine).
