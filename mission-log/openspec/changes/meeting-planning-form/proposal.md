## Why

Flow Work Logger already records logs and cards; meetings are the missing closed loop between “what happened” and “what we will talk about”. Planning a meeting from logs, attaching cards, and later spawning logs from the meeting needs a real meeting resource and many-to-many links — not a flag or a single `meeting_id` on cards and logs.

## What Changes

- Persist **meetings** as an owner-scoped resource: create, get, update, delete, list. First product slice is **planning** (title, date, project, current status, objective, agenda, duration, participants, color). Execution fields (`summary`, `lessons`, `executed`, `objectiveAchieved`) stay on the row and are not edited in this form.
- **BREAKING**: replace `logs.meeting_id` + `logs.type_meeting_link` with join table `log_meetings` (`log_id`, `meeting_id`, `source`: `log` | `meeting`). A meeting can be created from n logs (`source = log`); a log can later be created from a meeting (`source = meeting`).
- **BREAKING**: drop `cards.meeting_id`. Associate cards through `card_meetings`. `fl_meeting` stays as a card flag (filter / badge), not as the link.
- Authenticated **create/edit meeting form** (wireframe layout, existing Pastel Soft UI / Soft Brutalism colors — not the mock’s rainbow outlines). Associate existing cards or create one in a modal.
- Extract the card editor from `CardFormView` into a reusable form so the page and the modal share one component.
- Meeting-to-meeting links are **not** in this change.

## Capabilities

### New Capabilities
- `meeting-api`: Owner CRUD for meetings, agenda as JSON, `card_meetings` and `log_meetings` (with `source`), drop `cards.meeting_id` and log meeting columns.
- `meeting-planning-form`: Create/edit planning UI, card association (pick existing or create in modal), reusable card form component.
- `log-meeting-relation`: Logs no longer store a single meeting; create/update log payloads drop `meetingId` / `typeMeetingLink`; links go through `log_meetings`.

### Modified Capabilities
- None — `openspec/specs/` has no main specs yet.

## Impact

- Backend (`logger-brain`): reshape `meetings` schema; new `log_meetings` and `card_meetings`; Drizzle migration; `meeting` validation / middleware / controller / service / router under `/api/v1/app/meeting`. Adjust log and card services so they no longer read or write `meetingId`.
- Frontend (`mission-log`): `MeetingFormView`, meeting routes, `useMeeting`, card picker + modal, split `CardForm` out of `CardFormView`. Reuse `CardProjectSelect`, `ColorPicker`, `ConfirmModal`, `useCard`, `projectStore`.
- API: **BREAKING** for log create/update bodies and card JSON (`meetingId` gone). Card `flMeeting` unchanged.
- No new runtime dependencies. Agenda items live as JSON on the meeting (same idea as card sections).
