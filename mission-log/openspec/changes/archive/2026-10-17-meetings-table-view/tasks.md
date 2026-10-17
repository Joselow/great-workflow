## 1. List payload (`logger-brain`)

- [x] 1.1 Add `participants` to the `listMeetings` select and to each mapped item, and verify a list response includes `participants` as the stored text without a new query param
- [x] 1.2 Leave `MeetingListQuerySchema` as it is (`from` and `to` together, `from <= to`, limit max 24) and verify a request with only `from` still returns 400

## 2. Client types (`mission-log`)

- [x] 2.1 Add `participants: string` to `MeetingListItem` and add `MeetingDateFilters` as `{ from: string, to: string }`, and verify `pnpm typecheck` in `mission-log` accepts both

## 3. Date filter

- [x] 3.1 Create `MeetingDateFilters.vue` with Desde, Hasta, and clear; it receives one `filters` object and emits `update` with the whole next object, and verify clearing emits `{ from: '', to: '' }`
- [x] 3.2 In `MeetingsView`, own one `filters` ref defaulting to the current month (`YYYY-MM-DD` start through end), fetch in the update handler and on the initial call, and verify there is no `watch` on `filters`
- [x] 3.3 Skip the request when only one date is set or `from > to`, keep the previous rows, and show that the range is not applied; verify a reversed pair does not call `getMeetings`

## 4. Table and row menu

- [x] 4.1 Create `MeetingTable.vue` with columns title (color swatch), date and time, duration in minutes, project (`Sin proyecto` when null), and participants (blank when empty), and verify a sample item renders those cells
- [x] 4.2 Emit `open` from the row except the menu, and verify the menu click does not emit `open`
- [x] 4.3 Create `MeetingRowActions.vue` with a `more_vert` menu whose only item is Eliminar, confirm with `ConfirmModal`, and verify cancel leaves the row and confirm emits `delete`
- [x] 4.4 On confirm, call `deleteMeeting` and remove the row with `deleteFromArray`, and verify the deleted id is gone from `items` without a refetch

## 5. Wire the meetings view

- [x] 5.1 Replace the card grid in `MeetingsView` with the filter control above `MeetingTable`, keep Nueva reunión → `newMeeting`, and route `open` to `editMeeting`
- [x] 5.2 Request `page: 1` and `limit: 24`. When `total` is greater than the row count, show the visible count and the total; when it is not, show no truncation notice
- [x] 5.3 Style the table and filter with the current Pastel Soft UI (thin border, small radius, light and dark) and verify the mock's search, checkboxes, status chips, and avatars are absent

## 6. Verification

- [x] 6.1 Open the meetings view and verify the first request uses `from`/`to` for the current month and the table shows the basic columns
- [x] 6.2 Change the range, clear it, and enter an invalid pair; verify the network calls match the spec (valid pair sends both dates, clear omits both, invalid pair sends nothing)
- [x] 6.3 Delete a row from the menu and verify it disappears after confirm and stays after cancel
- [x] 6.4 Open a row and verify it lands on the planning form, and verify the screen has no calendar control
