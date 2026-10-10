## Context

See proposal.md for why. `MeetingsView.vue` loads `GET /meeting` with `page` and `limit` and renders a card grid. `useMeeting().getMeetings` already forwards `projectId`, `from`, `to`, `page`, and `limit`. `listMeetings` already filters `meetings.date` with an inclusive calendar range (`from` at start of that day, `to` exclusive of the next day) and requires both dates or neither. The list select does not include `participants`. Page size is capped at 24. Delete already exists (`DELETE /meeting/:id`) and the planning form already confirms destructive actions with `ConfirmModal`.

The attached table mock is layout only: a header, rows, and a trailing actions area. It is not the palette, and it is not the column set. This product has no location, requester, or meeting-status enum.

`src/utils/date.ts` already uses `dayjs` with the Spanish locale and exposes `endOfMonth()`. There is no shared dropdown component.

## Goals / Non-Goals

**Goals:**

- One table on the meetings route, fed by the existing list endpoint.
- One filters object, `{ from, to }`, owned by the view. The filter component emits the next object; the view assigns it and fetches in that handler.
- A trailing menu per row whose only item is delete, confirmed before the request.
- Add `participants` to the list projection so a row does not need `GET /meeting/:id`.

**Non-Goals:**

- Calendar view, view-mode switch, or a placeholder calendar control.
- Search, status filters, project filter on this screen, checkboxes, bulk delete, pagination controls.
- New query params, a new route, or a migration.
- Watchers on the filters object, the list, or the menu.

## Decisions

### 1. The view owns one object and fetches in the handler

`MeetingsView` holds:

```ts
interface MeetingDateFilters {
  from: string
  to: string
}
```

Empty string means unset. Default is the current month: `dayjs().startOf('month')` through `dayjs().endOf('month')`, formatted `YYYY-MM-DD`. `endOfMonth()` already exists; the start date can be the same `dayjs` call inline. No new date module.

The filter component receives `filters` and emits `update` with the full next object. It does not fetch. The view handler:

- assigns `filters`
- if both empty, calls `getMeetings({ page: 1, limit: 24 })`
- if both set and `from <= to`, calls `getMeetings({ from, to, page: 1, limit: 24 })`
- otherwise does not call the API

The first fetch is the direct call already at the bottom of `MeetingsView`, with the default object. No `watch`.

- **A. Deep-watch the filters object** — same pattern as logs, and the extra watcher the request rules out. Rejected.
- **B. (Chosen) Emit the whole object and fetch in the handler.**

Do not send `projectId`. This screen stays all meetings for the owner, as it does today.

### 2. Keep the list endpoint; add `participants` to the select

`listMeetings` adds `participants: meetings.participants` and maps it onto each item. `MeetingListItem` gains `participants: string`. No other list field changes. Order stays `date` descending. `from` / `to` validation stays in `MeetingListQuerySchema`.

- **A. Load each row with `GET /meeting/:id`** — N+1 for a column that is already a column. Rejected.
- **B. (Chosen) Extend the list select.** Additive response field, not **BREAKING**.

### 3. Table, filter, and menu are three components

- `MeetingDateFilters.vue` — two `type="date"` inputs and a clear control. Labels in Spanish (`Desde`, `Hasta`). Clear emits `{ from: '', to: '' }`. When the pair is incomplete or reversed, the component shows a short inline message; the view still decides not to fetch.
- `MeetingTable.vue` — presentational. Columns: title, date and time, duration (`{n} min`), project (`Sin proyecto` when null), participants (blank when empty). Receives items and emits `open` and `delete`.
- `MeetingRowActions.vue` — a button (`more_vert`) and a small menu with one item, **Eliminar**. Clicking the menu does not emit `open`. Confirm with the existing `ConfirmModal`, then emit `delete`. The view calls `deleteMeeting` and removes the row with `deleteFromArray`.

Title carries the existing `color` as a small swatch. No status badge.

Row activation navigates to `editMeeting`. Create stays `newMeeting`.

Visual language stays Pastel Soft UI: flat, thin border, small radius, current text colors, dark mode. The mock's chips, avatars, and checkbox column are not implemented.

- **A. One file for filters, table, and menu** — the view is already a screen; stuffing the menu into it fights one-responsibility. Rejected.
- **B. (Chosen) Three components.** The view only owns `filters`, `items`, load, and delete.

### 4. One page, and say when it is truncated

Request `limit: 24` (the current max) and `page: 1`. If `total` is greater than `items.length`, the view shows the visible count and the total. No pager. Narrowing the dates is how the user sees the rest.

- **A. Raise the limit or add pages** — extra API and UI for a case the date filter already shrinks. Rejected for this change.
- **B. (Chosen) Keep the cap and surface `total`.**

### 5. Calendar stays a later consumer of this list

A calendar would call the same `getMeetings` with the same `{ from, to }`. This change does not add a mode flag, a second layout, or a disabled toggle. The seam is the filters object and the list call, nothing else.

## Risks / Trade-offs

- [A month with more than 24 meetings hides the rest] → The view shows `visible` of `total`. Pagination can be a later change without changing the filters object.
- [Server-local `startOfDay` can shift a meeting near midnight] → Existing list behavior. This change does not reinterpret dates.
- [A menu on the last row can clip] → Position the menu from the button and close it on an outside click. No new dependency.
- [Clearing the range returns every meeting, still capped at 24] → Same truncation notice. The default remains the current month so the first paint is bounded.

## Migration Plan

No migration and no deploy order. Ship the list field first or together with the view; old clients ignore `participants`. Rollback is reverting the view to the grid and leaving the extra response field in place.
