## Context

See proposal.md for why. `meetings` already exists in Drizzle (`date`, `estimatedDuration`, `state`, `objective`, `summary`, `lessons`, `executed`, `objectiveAchieved`) but has **no router, no UI, no `title` / `projectId` / agenda**. Logs still store a single `meetingId` + `typeMeetingLink`. Cards store unused `meetingId` plus a real `flMeeting` flag used in the gallery.

`entities.md` already sketches the target: planning fields on `meetings`, `log_meetings.source`, `card_meetings`. Cards already have owner CRUD, list, `ColorPicker`, `CardProjectSelect`, and `CardFormView` (page-sized). mission-log UI: Pastel Soft UI / Soft Brutalism — flat, thin borders, small radius; wireframe colors are labels, not the palette.

## Goals / Non-Goals

**Goals:**
- Owner meeting CRUD following `routes → requestForm → controller → service → schema`.
- Planning form (create + edit) matching the wireframe structure.
- Many-to-many cards and logs; `source` on log links.
- Reuse the card editor inside a modal (extract from `CardFormView`).
- Few watches: one `startView` load, one draft `ref`.

**Non-Goals:**
- Meeting-to-meeting links.
- Execution UI (`summary`, `lessons`, `executed`, `objectiveAchieved`).
- Creating follow-up logs from a meeting (API can store `source = meeting`; no writer UI here).
- Public unauthenticated meeting page.
- Drag-and-drop agenda.
- Autosave.

## Decisions

### 1. Reshape `meetings`; keep execution columns unused in the form

Replace `state` with `topic_status`. Add `title`, `project_id` (nullable), `participants`, `color`, `agenda` jsonb.

| Field | Store as | Planning form |
| --- | --- | --- |
| `id` | uuid v7 PK | — |
| `user_id` | integer not null | JWT |
| `project_id` | uuid nullable | chip, default active project |
| `title` | varchar(100) not null | required |
| `date` | timestamptz not null | date + time |
| `estimated_duration` | integer not null | minutes, > 0 |
| `topic_status` | text not null default `''` | Estado actual |
| `objective` | varchar(255) not null default `''` | Objective |
| `participants` | text not null default `''` | free text |
| `color` | varchar(7) not null | `#RRGGBB`, same picker as cards |
| `agenda` | jsonb not null default `[]` | `{ title: string; done: boolean }[]` |
| `summary`, `lessons` | text nullable | not in form |
| `executed` | boolean default false | not in form |
| `objective_achieved` | boolean nullable | not in form |
| timestamps | `commons.ts` | — |

No DB FKs (same as logs/cards). Service: if `project_id` set, it must belong to the user.

Agenda as JSON, same rationale as card sections (one payload, order = array order). Empty titles dropped on write.

### 2. Join tables, not columns

```
logs ──< log_meetings >── meetings ──< card_meetings >── cards
              │
           source
         log | meeting
```

`log_meetings`: uuid v7 id, `log_id`, `meeting_id`, `source` (`log` | `meeting`), timestamps. Unique `(log_id, meeting_id)`. First link wins; a later attach of the same pair MUST NOT insert a second row (keep existing `source`).

`card_meetings`: uuid v7 id, `card_id`, `meeting_id`, timestamps. Unique `(card_id, meeting_id)`.

**BREAKING drops:** `logs.meeting_id`, `logs.type_meeting_link`, `cards.meeting_id`. Keep `cards.fl_meeting`.

Backfill (if any rows exist):
- log: `type_meeting_link = 'log-meet'` → `source = 'log'`; `'meet-log'` → `source = 'meeting'`; null + meeting_id → `source = 'log'`.
- card: each non-null `meeting_id` → `card_meetings` row.

### 3. Meeting API shape

Protected, `requireAuth`, mount `protectedRouter.use("/meeting", meetingRouter)`:

| Method | Path | Role |
| --- | --- | --- |
| `GET /` | list | owner, filters |
| `POST /` | create | planning + links |
| `GET /:id` | get | owner |
| `PUT /:id` | update | planning + replace links |
| `DELETE /:id` | delete | owner; join rows cascade in the service |

List query (optional): `projectId` (uuid or literal `null`), `from` / `to` (YYYY-MM-DD, same pair rules as logs), `page` default 1, `limit` default 12 max 24. Order `date` desc. Owner `userId` always.

Write body: planning fields + `cardIds: uuidv7[]` (default `[]`) + `logLinks: { logId: uuidv7; source: 'log' \| 'meeting' }[]` (default `[]`). Service asserts every card and log is owned by the user, then **replaces** join rows for that meeting (delete missing, insert new). GET returns `cards: CardListItem[]` and `logs: { id, description, source }[]`.

Owner mismatch or missing meeting → `404` (no existence leak). Unowned card/log id in the payload → `400`.

Log create/update **stop accepting** `meetingId` / `typeMeetingLink`. Card create/update **stop returning** `meetingId`.

### 4. Frontend: one draft, page chrome vs extracted card form

```
views/meetings/MeetingsView.vue          thin list + new
views/meetings/MeetingFormView.vue       create/edit, owns draft
components/Meeting/MeetingAgendaList.vue add / remove / toggle done / reorder
components/Meeting/MeetingCardPanel.vue  attached tiles + add
components/Meeting/MeetingCardModal.vue  pick existing (useCard list) or create
components/Card/CardForm.vue             extracted editor (v-model draft, emit save)
views/cards/CardFormView.vue             page chrome (copy, share, danger) around CardForm
composables/useMeeting.ts
interfaces/meeting.ts
```

Layout (wireframe, existing tokens): left column planning fields; right column cards; color next to cards; duration + participants under agenda; save centered. `cardSurfaceStyle` / project chip / `ColorPicker variant="button"`. No rainbow section borders.

Draft is a single `ref`. `startView()` loads once. Do not `watch` every field. Prefill `logLinks` from `route.query.logs` (comma-separated ids) with `source: 'log'` — no log picker in the form.

Card add: modal with search/list (`GET /card`, `flMeeting` optional). Selecting an existing card pushes its id onto the draft. Creating one calls `createCard` immediately, then pushes the new id. Saving the meeting persists `cardIds`. An unsaved meeting can leave a newly created card in `/cards` (acceptable).

After create → `router.replace` to edit. Confirm before save (`ConfirmModal`). Delete via `DangerZone` on edit.

Routes (`/meetings/new` before `/meetings/:id`):

| path | name | auth |
| --- | --- | --- |
| `/meetings` | `meetings` | required |
| `/meetings/new` | `newMeeting` | required |
| `/meetings/:id` | `editMeeting` | required |

`Shift+M` in `App.vue` → `meetings` (same pattern as Shift+C / Shift+L).

### 5. `source` is the direction of birth

- `log`: meeting planned **from** those logs.
- `meeting`: log recorded **from** that meeting (later UI).

The planning form does not flip sources. Query-prefilled logs are always `log`.

## Risks / Trade-offs

- **[Risk]** Replace-all on `cardIds` / `logLinks` can drop links if the client sends a partial list → **Mitigation**: GET returns the full sets; the form always round-trips the draft arrays.
- **[Risk]** Creating a card in the modal before meeting save orphans the card → **Mitigation**: cards are first-class; user finds them in `/cards`.
- **[Risk]** Unique pair + “first source wins” can surprise if someone re-links → **Mitigation**: document; no silent source overwrite.
- **[Risk]** JSON agenda is weak to query → **Mitigation**: same as card sections; enough for v1.
- **[Risk]** OpenSpec home is `mission-log` while backend lives in `logger-brain` → **Mitigation**: implement both trees, same as `cards-form-and-public-view`.
- **[Risk]** Existing log rows with `meeting_id` → **Mitigation**: backfill then drop columns in one migration.

## Migration Plan

1. Generate/apply Drizzle migration: alter `meetings`, create join tables, backfill, drop old columns.
2. Deploy `logger-brain` (meeting router + log/card payload change).
3. Deploy `mission-log` (routes + form). Clients that still send `meetingId` on logs get `400` (unknown/stripped — Zod must reject leftover fields or ignore; **reject** to make the break visible).
4. Rollback: restore columns only if production still has the old client; otherwise keep join tables.

## Open Questions

None for this slice. Execution form and “log from meeting” stay later.
