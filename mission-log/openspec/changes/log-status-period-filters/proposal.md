## Why

The logs list always loads every log for the active project. There is no way to focus on unfinished work or on the current week, so the table grows noisy as a project accumulates history. Filters for completion status and a month/week period, applied in the API, keep the list useful without extra client-side filtering.

## What Changes

- Replace the placeholder `LogFilters` bar with status pills (`Finalizado` / `No Finalizado`) and a period control (month + four week chips, or a free date range).
- Default the period to the **current month** and **current week**. Weeks are always 1–4; week 4 runs from day 22 through the end of the month. An optional **Fechas avanzadas** toggle swaps month/week for start/end date inputs.
- Filter logs on `GET /log` with optional query params: `completed`, `from`, `to` (inclusive range on `createdAt`), still scoped by `projectId`.
- Keep the existing project visual language (pills, borders, brand colors). The attached mock is a structural guide only, not a new palette.

## Capabilities

### New Capabilities
- `log-list-query`: Optional filters on `GET /log` for completion status and an inclusive `createdAt` date range, applied in the database.
- `log-filters-bar`: Logs view filter bar — status pills, month navigation, four week chips, optional advanced start/end dates, defaults, and refetch of the list when filters change.

### Modified Capabilities
- None — `openspec/specs/` has no main specs yet.

## Impact

- Backend (`logger-brain`): `logController`, `logService`, new query validation/middleware for GET params. No schema/migration — `completed` and `createdAt` already exist.
- Frontend (`mission-log`): `LogFilters.vue`, `LogsView.vue`, `useLog.ts`. Reuse `dayjs` helpers in `src/utils/date.ts`.
- API contract: `GET /api/v1/app/log?projectId=&completed=&from=&to=` — additive, not **BREAKING**.
- No new runtime dependencies.
