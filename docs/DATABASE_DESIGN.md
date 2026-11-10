# Database Design (short)

9 tables, MySQL 8 / InnoDB, database `pukur_pulse`.

| Table | Purpose | Key constraints |
|---|---|---|
| users | account (name, email, phone, password hash) | PK; UNIQUE email; UNIQUE phone |
| ponds | a user's ponds | FK user_id; UNIQUE(user_id, pond_name); CHECK area > 0; CHECK status |
| fish_species | fixed species list | UNIQUE species_name |
| stocking_batches | species stocked in a pond | FK pond_id, species_id; CHECK qty > 0, cost >= 0, status |
| feed_logs | feed per batch | FK batch_id; CHECK qty > 0, cost >= 0 |
| water_readings | pH / DO / temperature per pond | FK pond_id; NULL = not measured; CHECK ranges; CHECK at least one value |
| harvests | partial harvests per batch | FK batch_id; CHECK qty > 0 |
| sales | sales per batch | FK batch_id; CHECK qty > 0, price >= 0, status paid/unpaid |
| expenses | other expenses per batch | FK batch_id; CHECK amount >= 0, type in 5 categories |

**Ownership chain:** users → ponds → stocking_batches → (feed_logs, harvests, sales, expenses). Every query checks `ponds.user_id` in SQL.
**Foreign keys:** all `ON DELETE RESTRICT` (history is never silently deleted).
**Indexes:** (pond_id, recorded_at), and (batch_id, date) on feed, harvest, sales, expenses.
**Views:** `v_pond_feed_expense_summary`, `v_batch_financial_summary` (each money source summed alone, then joined: no double counting).
**Sale amount** is never stored: `quantity_kg * price_per_kg`.
**Estimated Recorded Profit/Loss** = revenue − (purchase cost + feed + other expenses). Not exact net profit.
