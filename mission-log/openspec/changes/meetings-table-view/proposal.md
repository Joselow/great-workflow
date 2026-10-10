## Why

The meetings screen is a card grid. It is fine for a handful of items and poor for scanning scheduled meetings, reading the basics, and acting on one row. The list endpoint already accepts a date range; the view does not use it. A table is the view to build now. A calendar can reuse the same list and the same filter object later.

## What Changes

- Replace the card grid on the meetings view with a table of basic meeting data: title, date and time, estimated duration, project, and participants. Keep the existing “Nueva reunión” action and open the existing planning form from a row.
- Add a row actions menu on the right. The only option in this change is **Eliminar**, with the existing confirm modal. The menu is the place for later actions.
- Add a separate date-filter component. The view owns one filters object, `{ from, to }`. Changing it refetches `GET /meeting`. No extra watchers.
- Include `participants` on each list item so the table does not load the full meeting.
- Do not build a calendar, a view switcher, search, status filters, checkboxes, or bulk actions.

## Capabilities

### New Capabilities
- `meeting-table-view`: Meetings list rendered as a table with basic columns, row navigation to the planning form, and a per-row actions menu whose only action is delete.
- `meeting-date-filters`: A separate date-range filter. One `{ from, to }` object drives `GET /meeting`. The parent refetches from the update handler.

### Modified Capabilities
- None — `openspec/specs/` has no main specs yet.

## Impact

- Frontend (`mission-log`): `MeetingsView.vue` becomes the table host. New table component and a small actions menu. New date-filter component. `MeetingListItem` gains `participants`. `useMeeting().getMeetings` already sends `from` / `to`.
- Backend (`logger-brain`): `listMeetings` selects `participants` in addition to the current list columns. `GET /meeting` query (`projectId`, `from`, `to`, `page`, `limit`) stays as it is. Not **BREAKING**.
- No new runtime dependencies. No migration. Calendar view is out of this change.
