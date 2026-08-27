## Context

`GET /log` already filters by `userId` and optional `projectId`. `LogFilters.vue` is a placeholder. The logs table therefore shows the full history of the active project. `completed` and `createdAt` already exist on the `logs` table — no migration.

The filter bar should follow current mission-log styling (rounded pills, brand orange/cyan/mint, dark-mode borders). The mock is layout-only: status pills, then month, then week chips in one row.

Frontend already uses `dayjs` with Spanish locale in `src/utils/date.ts`.

## Goals / Non-Goals

**Goals:**
- Filter the list in the database by completion and inclusive `createdAt` range.
- Default the UI to the current month and the current week of that month (always 4 weeks; week 4 through month-end).
- Let the user change month and select a week, or pick a free range via Fechas avanzadas; refetch with the new `from`/`to`.
- Keep the endpoint and UI small and consistent with existing controller → service → Drizzle flow.

**Non-Goals:**
- Filtering by `updatedAt`, tags, responsible, or free-text search.
- Multi-week selection (the advanced toggle is a single free range, not several week chips at once).
- Persisting filters in the URL or localStorage (session-only is enough).
- Pagination — still return the filtered set ordered by `createdAt` asc.
- Changing how create/update/delete work, except dropping a row from the visible list when it no longer matches the active filters.

## Decisions

### 1. Query params on the existing `GET /log`

Keep one list endpoint. Add optional `completed`, `from`, `to`.

- **A. New `/log/search` route** — extra surface for the same resource. Rejected.
- **B. (Chosen) Extend `GET /log`.** `projectId` already lives on the query string; same pattern.

`completed`: `"true"` | `"false"`. Omit = no status filter.

`from` / `to`: `YYYY-MM-DD`. Both required together, or both omitted. Inclusive range on `createdAt`: `createdAt >= from 00:00:00` AND `createdAt < to+1 day` (avoids timezone end-of-day bugs).

Validate with a Zod query schema and a GET middleware in `middlewares/requestForm/`, same style as body forms. Invalid `projectId` already throws `BadRequestError400` in the controller; move all query checks into that middleware so the controller stays thin.

### 2. Filter in SQL, not in the client

- **A. Fetch all project logs, filter in Vue** — simple but unbounded as history grows. Rejected.
- **B. (Chosen) Drizzle `and(...)` conditions** in `logService.getLog`. Same `eq`/`and` style as today, plus `gte`/`lt` on `createdAt` and optional `eq` on `completed`.

`completed` is nullable in the schema. `completed=false` MUST match only `false`, not `NULL`. Treat `NULL` as not completed for the “No Finalizado” filter (`or(eq(false), isNull)`), so old rows without the flag still show as unfinished.

### 3. Weeks are 7-day slices of the selected calendar month — always 4 chips

- **A. ISO weeks** — week numbers jump across months; the mock labels Semana 1–4 of a month. Rejected for this UI.
- **B. (Chosen) Day-of-month buckets, always four weeks.** Week 4 absorbs leftover days so there is never a 5th chip:
  - Week 1: days 1–7
  - Week 2: days 8–14
  - Week 3: days 15–21
  - Week 4: day 22 through **end of month** (e.g. August 2026 → `2026-08-22`–`2026-08-31`)

Current week = `min(floor((today.date() - 1) / 7) + 1, 4)` when the selected month is the current month. Day 22+ selects week 4.

Changing month:
- If the new month is the current calendar month → select the current week.
- Otherwise → select week 1.

Month control is prev/next around a “MES {nombre}” chip (Spanish month name via existing `dayjs` locale).

**Advanced dates:** a compact “Fechas avanzadas” toggle (default off) hides month/week and shows start/end `type="date"` inputs. The same `from`/`to` query params are sent. Turning it on prefills from the selected week so the inputs are not empty. If start > end, block the fetch and toast (`errorToast`); do not send a 400. Turning it off restores the month + week range.

Helpers for week ranges live in `mission-log/src/helpers/logPeriod.ts` (pure). The API only receives `from`/`to`; it does not know about weeks.

### 4. Status pills are exclusive and optional

Two pills: Finalizado / No Finalizado. At most one selected. Clicking the active pill again clears the status filter (all logs in the period). Default: no status filter — the proposal only defaulted month/week.

### 5. Filter state lives in `LogsView`, bar stays presentational

`LogFilters` receives month, selected week, week count, status, advanced flag, and start/end dates, and emits `update:month` / `update:week` / `update:status` / `update:advanced` / `update:fromDate` / `update:toDate`. `LogsView` owns the refs, derives `from`/`to` from the week range or the custom dates, and calls `getLogs(projectId, filters)`.

`useLog().getLogs` accepts an optional filters object and sends it as axios `params` next to `projectId`.

On filter or project change, refetch. After create/update, if the log no longer matches the active filters, remove it from the local array (same `deleteFromArray` helper as delete).

### 6. Visual language stays on the current design system

One accent per role, using existing CSS vars (`--color-brand-cyan`, `--color-brand-mint`, `--color-brand-orange`, `--color-brand-pink`). Do not mix mint fill with orange border on the same chip.

- Idle pills: `border-black/10` / `dark:border-white/15`, transparent fill, readable gray text.
- Period chips (month, week, advanced toggle): **orange** selected — `bg-brand-orange/20`–`/25`, `border-brand-orange/50`–`/60`, `dark:text-white`.
- Finalizado: **cyan**; No Finalizado: **pink**. Same `/20`–`/25` fills so they sit next to orange period chips without clashing.
- Dark mode: tinted fills, not pale mint on dark gray; borders at brand `/50` or `white/15`.

Wrap on small screens (`flex-wrap`). Keep the rounded-pill structure.

## Risks / Trade-offs

- **[Risk]** `timestamp` without timezone can shift the day near midnight → **Mitigation**: range is `[from, to+1 day)` in the server’s timestamp interpretation; document `YYYY-MM-DD` as calendar dates.
- **[Risk]** Week 4 is longer than 7 days in 29–31 day months; users may expect ISO weeks → **Mitigation**: labels stay “Semana 1–4” of the visible month; week 4 always runs to month-end.
- **[Risk]** Advanced start > end would 400 the API → **Mitigation**: validate on the client, toast, skip fetch.
- **[Risk]** Creating a log while viewing another month/week won’t show it in the table → **Mitigation**: expected; the new row still saves. Optional later: jump to current week after create (out of scope).
- **[Risk]** `NULL` completed vs `false` → **Mitigation**: “No Finalizado” includes both (Decision 2).

## Migration Plan

Additive query params. Old clients that only send `projectId` keep current behavior (full list). No DB migration. No feature flag. Deploy backend before or with frontend so the new params are honored.

## Open Questions

None — period default, week slicing, and optional status filter are decided above.
