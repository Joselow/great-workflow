## 1. Backend query contract (`logger-brain`)

- [x] 1.1 Add a Zod schema for `GET /log` query: optional `projectId` (uuid v7), optional `completed` (`true`/`false`), optional `from`/`to` (`YYYY-MM-DD`); require `from` and `to` together and `from <= to`
- [x] 1.2 Add `logQueryRequestForm` middleware that validates `req.query` and throws `BadRequestError400` with formatted errors
- [x] 1.3 Attach the middleware to `GET /` in `logRouter.ts`
- [x] 1.4 Thin `getLog` in `logController.ts`: read validated query, pass `{ projectId, completed, from, to }` to the service (keep `userId` from the JWT)

## 2. Backend filtering (`logger-brain`)

- [x] 2.1 Extend `logService.getLog` to AND optional `eq(completed, true)`, unfinished as `false` or `null`, and `createdAt >= from 00:00:00` with `createdAt < to+1 day`
- [x] 2.2 Keep existing `userId` + optional `projectId` filters and `orderBy(asc(createdAt))`

## 3. Period helpers (`mission-log`)

- [x] 3.1 Add `src/helpers/logPeriod.ts`: always 4 weeks; `{ from, to }` for month+week (1–7, 8–14, 15–21, 22–end of month)
- [x] 3.2 Defaults: current month + current week (day 22+ → week 4); changing to a non-current month selects week 1

## 4. Client fetch (`mission-log`)

- [x] 4.1 Extend `useLog().getLogs` to send optional `completed`, `from`, `to` next to `projectId`
- [x] 4.2 After create/update, drop the log from the local list if it no longer matches the active filters

## 5. Filter bar UI (`mission-log`)

- [x] 5.1 Rebuild `LogFilters.vue`: status pills, MES + prev/next, four Semana chips, Fechas avanzadas toggle; emit status/month/week/advanced/dates; brand styles that work in light and dark, wrap on small screens
- [x] 5.2 In `LogsView.vue`, own filter state, default period (advanced off), derive `from`/`to` from week or custom dates, refetch on filter or `activeProject` change
- [x] 5.3 Clicking the selected status pill clears `completed` and refetches
- [x] 5.4 Advanced on: hide month/weeks, show start/end dates (prefill from current week), send `from`/`to`; start > end toasts and skips fetch
- [x] 5.5 Advanced off: hide date inputs, restore month + four weeks and that range

## 6. Verification

- [x] 6.1 Default load: current month/week; network shows `from`/`to` for that week
- [x] 6.2 Toggle Finalizado / No Finalizado / clear; week and month changes refetch the matching range
- [x] 6.3 Invalid query (`from` without `to`, bad date) returns 400
- [x] 6.4 `GET /log?projectId=` without new params still returns the unfiltered project list

## 7. UX adjustments (weeks, advanced dates, colors)

- [x] 7.1 Week 4 always eats the rest of the month; never a 5th chip; day 22+ defaults to week 4
- [x] 7.2 Fechas avanzadas toggle as specified in 5.4–5.5
- [x] 7.3 Harmonize filter-bar colors: one accent for selected period (orange), cyan/pink for status, readable dark-mode fills `/20`–`/30`
