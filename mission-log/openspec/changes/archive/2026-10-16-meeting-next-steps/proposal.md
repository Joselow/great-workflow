## Why

A meeting ends with next steps, and those steps are logs: work that has to show up in the project, not a note trapped on the meeting. The form also reads in the wrong order for how the meeting is told: title, objective, current state, then the agenda, then what happens after.

## What Changes

- Reorder the meeting form, top to bottom: display title, objective, current status, title input, agenda, next steps, estimated time, participants, date and time. The top title is text. The title field below the current status is the input. Cards, summary, lessons, and the qualify action stay on the right.
- Add **Siguientes pasos**: text rows, no color. Each non-empty row becomes a real log owned by the user, then a `log_meetings` row with `source = meeting`.
- A next-step log stores `description` from the row, `responsible` as `Reunión [title] [fecha]`, and `tags` as `reunión, [project]`. `completed` and `comment` stay empty.
- Create and update do this in one transaction, in that order: the meeting, the logs (one batch insert), then the join rows (one batch insert). Removing a next step deletes that log and its join. Logs linked with `source = log` stay untouched.
- A next step requires the meeting to have a project. Blank rows are dropped.

## Capabilities

### New Capabilities
- `meeting-next-step-logs`: Create, update, and remove logs born from a meeting, joined with `source = meeting`, without disturbing logs that were attached from the log side.
- `meeting-form-order`: Left-column order, display title versus title input, and the next-step list that round-trips those logs.

### Modified Capabilities

## Impact

- Backend (`logger-brain`): meeting validation, request form, controller, and `meetingService`. No new table. `logs.project_id` is required, `responsible` is varchar(100), `tags` is varchar(255). `log_meetings.source` already allows `meeting`.
- Frontend (`mission-log`): `MeetingFormView` field order, a next-step list next to the agenda list, draft shape, and load/save mapping. Reuse the agenda interaction without a color picker.
- Saving a meeting with next steps creates logs that also appear in that project's log list.
