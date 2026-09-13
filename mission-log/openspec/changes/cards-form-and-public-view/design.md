## Context

See proposal.md for why. There is no `cards` table, no card routes, and `/cards` still mounts `LogsView`. Projects already have owner CRUD, `ColorPicker`, `ConfirmModal`, and an `activeProject` in `projectStore`. `App.vue` only mounts the authenticated shell when `route.meta.requiresAuth` is true — a public route can reuse that split.

`entities.md` lists the card fields. Treat `name uuid` as a typo: `name` is the title (`varchar`). `user_id` is an integer, like the other tables. Sections are not in that list; they are added here as JSON on the card.

## Goals / Non-Goals

**Goals:**
- One Drizzle table, one owner write API, one public read API.
- One Vue form for create and edit; one public page.
- Reuse `ColorPicker`, `ConfirmModal`, project list, and existing request-form → controller → service flow.
- Keep the form layout close to the attached wireframes (project chip, color cluster, title, description, sections + add/reorder, save).

**Non-Goals:**
- Card list / gallery UI (leave `/cards` as the later entry).
- Delete card.
- Meeting link (`meeting_id` stays null; no UI).
- Using a card as a prompt in the writer or logs.
- Share tokens, unlisted vs public flags, or robots/noindex.
- Autosave (explicit confirm only).

## Decisions

### 1. Sections live as JSON on `cards`, not a child table

- **A. `card_sections` table** — extra migration, extra write path, reorder as `position` updates. Rejected for v1.
- **B. (Chosen) `sections` jsonb** on `cards`, typed as `{ title: string; description: string }[]`. Order = array order. Prompt conversion is `sections: []`. One payload, one `PUT`.

Validate each section: `title` min 1, `description` string (may be empty). Drop empty trailing drafts on the client before confirm, or require title so empty rows do not save.

### 2. Schema mapping from `entities.md`

| Field | Store as | Notes |
| --- | --- | --- |
| `id` | uuid v7 PK | same `$defaultFn` as projects |
| `user_id` | integer not null | from JWT |
| `project_id` | uuid nullable | no DB FK (same as logs today) |
| `meeting_id` | uuid nullable | column only; never set in this change |
| `name` | varchar(255) not null | title |
| `description` | text not null default `''` | text, not varchar — prompts can be long |
| `color` | varchar(7) not null | `#RRGGBB`, default `#f5f5f4` |
| `is_prompt` | boolean not null default false | |
| `sections` | jsonb not null default `[]` | |
| timestamps | `commons.ts` | |

Service checks `project_id`: if set, `getProjectById` + `project.userId === user.id`, else `BadRequestError400`. No FK, same style as logs.

### 3. Routes: protected resource + public mount

Protected (behind `requireAuth`):

- `POST /api/v1/app/card`
- `GET /api/v1/app/card/:id`
- `PUT /api/v1/app/card/:id`

Public (new router, **not** under `/app`):

- `GET /api/v1/public/card/:id`

- **A. Public path under `/app`** — still hits `requireAuth`. Rejected.
- **B. (Chosen) `router.use('/public', publicRouter)`** next to `/auth` and `/app`.

Owner `GET`/`PUT`: `userId` match or `NotFoundError404` (do not leak existence to other users). Public `GET`: any existing id, 404 if missing.

Public JSON: `{ id, name, description, color, isPrompt, sections, project: { name, color } | null }`. No `userId`, no `meetingId`. Join project only for the summary.

No list endpoint in this change.

Create/update body (Zod): `name`, `description` (optional, default `''`), `color` (same hex regex as projects), `isPrompt` (default false), `projectId` (uuid v7 nullable optional), `sections` (array, default `[]`). If `isPrompt`, service writes `sections: []` regardless of body. Do not accept `meetingId`.

### 4. Frontend: small presentational pieces, logic in composable + view

Follow mission-log rules: components = UI, `useCard` = HTTP + toasts, view owns the draft and confirm.

```
views/cards/CardFormView.vue
views/cards/CardPublicView.vue
components/Card/CardProjectSelect.vue
components/Card/CardSectionList.vue
composables/useCard.ts
interfaces/card.ts
```

Reuse `ColorPicker.vue` and `ConfirmModal.vue`. `CardProjectSelect` is a compact pill/select: user projects + “Ningún proyecto”. It does **not** call `setStoredActiveProject`.

Draft defaults on create: `projectId = activeProject?.id ?? null`, `color = '#f5f5f4'`, `isPrompt = false`, `sections = []`.

Prompt toggle on: `sections = []` in the draft immediately; hide `CardSectionList`. Prompt off: list stays empty until add.

Section chrome matches the wireframe: add (plus), remove, up/down reorder. No drag library.

Save: open `ConfirmModal`; on confirm, `create` or `update`. Create success → `router.replace({ name: 'editCard', params: { id } })`.

Routes (declare `/cards/new` **before** `/cards/:id`):

| path | name | auth |
| --- | --- | --- |
| `/cards/new` | `newCard` | required |
| `/cards/:id` | `editCard` | required |
| `/c/:id` | `publicCard` | none |

Leave `/cards` as the later list placeholder.

Public fetch: existing `api` (`API_BASE_URL`) → `GET /public/card/:id`. Token may be attached if the visitor is logged in; the public handler ignores it.

`CardPublicView`: `meta.requiresAuth = false` so `App.vue` skips header/drawer/writer. Centered panel, same color language, no inputs. Missing card → existing `NotFoundView` (or the same not-found component).

### 5. Confirm is the only write gate

Projects autosave; cards do not. User asked to confirm every save. No debounce write. Dirty-state warning on leave is out of scope.

## Risks / Trade-offs

- **[Risk]** UUID v7 public ids are time-ordered and guessable → **Mitigation**: accepted for v1; document that the link *is* the secret. Tokenized/unlisted links later.
- **[Risk]** No FK on `project_id` → orphan project label if the project is deleted → **Mitigation**: public/owner get treat a missing project as `project: null`. Do not fail the card read.
- **[Risk]** Toggling prompt on drops sections in the draft before save → **Mitigation**: intended. Confirm copy should say that a prompt save drops sections.
- **[Risk]** JSON sections are harder to query later → **Mitigation**: acceptable until a list/search-by-section exists; migrate to a table then if needed.
- **[Risk]** `openspec` planning home is `mission-log`, but the change includes `logger-brain` → **Mitigation**: implement both trees; same as `log-status-period-filters`.

## Migration Plan

1. Deploy `logger-brain` with the new table (`pnpm db:generate` / migrate) and both routers.
2. Deploy `mission-log` with the new routes.
3. No backfill. Empty `cards` is fine.
4. Rollback: drop the public/protected card routes and leave the table (or drop it if unused). No client depends on cards yet.

## Open Questions

None — meeting link, list, delete, and “use card” stay later by design.
