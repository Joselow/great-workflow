## Context

See proposal.md for why. Cards already persist (`cards` table, owner create/get/update, public get). `/cards` still mounts `LogsView`. There is no list endpoint. `entities.md` already lists `fl_meeting`; the schema and form do not have it yet. `is_prompt` is a pill on the form. Projects, `ColorPicker`, and `debounce` (`src/utils/debounce.ts`) already exist. Logs already filter in SQL via query middleware — reuse that shape, not a new stack.

## Goals / Non-Goals

**Goals:**
- One owner list query that applies every filter in PostgreSQL (user scope first, then equality, then ILIKE).
- One `/cards` gallery: project + search + Prompt/Meeting pills, colored tiles, page arrows.
- `fl_meeting` on write (form + API) and on the list/public payload.

**Non-Goals:**
- Client-side search over a downloaded set.
- Full-text / `tsvector` / `pg_trgm` (LIKE is enough; add an index later if the table grows).
- Binding the list project filter to `activeProject`.
- Delete, bulk actions, drag-reorder, “use this card”.
- Linking `meeting_id` (still unused). `fl_meeting` is only a flag.
- URL-persisted filters.

## Decisions

### 1. Extend `GET /card`, do not add `/card/search`

- **A. New search route** — extra surface for the same resource. Rejected.
- **B. (Chosen) `GET /api/v1/app/card`** on the existing router, registered **before** `GET /:id`. Same pattern as `GET /log`.

Query (all optional except pagination defaults):

| Param | Meaning |
| --- | --- |
| `q` | Trimmed string, max 200. ILIKE across name, description, section title, section description |
| `projectId` | uuid v7 **or** the literal `null` |
| `isPrompt` | `"true"` / `"false"` |
| `flMeeting` | `"true"` / `"false"` |
| `page` | 1-based, default `1` |
| `limit` | default `6` (3×2 grid), max `24` |

Omit `projectId` → any project including free cards. `projectId=<uuid>` → that project (must not 404 the list if the user has no cards there; return empty). `projectId=null` → `project_id IS NULL`.

`isPrompt` / `flMeeting` omitted → no flag filter. Both present → **AND**. Invalid query → `400` via Zod + GET request-form (same as logs).

Response (`simpleSuccess`): `{ items, page, limit, total }`. `items` are compact list rows: `id`, `name`, `description`, `color`, `isPrompt`, `flMeeting`, `projectId`, `project: { name, color } | null`. No `sections`, no `userId`, no `meetingId` — search uses those fields in SQL only.

### 2. LIKE in SQL, escaped, after equality filters

- **A. Fetch all owner cards, filter in Vue** — unbounded. Rejected.
- **B. (Chosen) Drizzle `and(...)`** scoped by `userId`, then equality (`projectId` / `isNull`, `isPrompt`, `flMeeting`), then text match only when `q` is non-empty.

Text match (case-insensitive):

```
name ILIKE pattern
OR description ILIKE pattern
OR EXISTS (
  SELECT 1 FROM jsonb_array_elements(sections) AS s
  WHERE s->>'title' ILIKE pattern
     OR s->>'description' ILIKE pattern
)
```

Build `pattern` as `%` + escaped `q` + `%`. Escape `\`, `%`, and `_` so user input cannot become wildcards.

Empty / whitespace `q` → skip the text clause (do not `ILIKE %%`).

Order: `updatedAt` desc (recent edits first). `count(*)` with the same `where` for `total`.

Index: `(user_id, updated_at desc)` on `cards` so the common path (owner + page) is cheap. Equality filters ride that index. No `pg_trgm` in this change.

### 3. `fl_meeting` is a boolean flag, not `meeting_id`

Column `fl_meeting` boolean not null default `false`. Create/update accept optional `flMeeting` (default false on create; unchanged if omitted on update). Prompt still clears sections; meeting does **not**.

Public get includes `flMeeting`. Owner get/update already return the row — the new column comes along.

Form: a **Meeting** pill beside **Prompt**, same rounded-pill language (Prompt stays emerald; Meeting uses brand orange). Independent. Default off on create.

### 4. Gallery state in `CardsView`; filters and tiles stay presentational

```
views/cards/CardsView.vue          # owns filters, page, fetch
components/Card/CardListFilters.vue
components/Card/CardTile.vue
```

Do **not** reuse `CardProjectSelect` for the list. That control means “project to save” (projects + none). The list needs **Todos** + each project + **Sin proyecto**. A list-only dropdown keeps the two meanings apart (KISS).

`CardsView` loads projects if the store is empty (same as the form). Default filter: Todos, empty search, both pills off, page 1.

Search: existing `debounce` at **300ms**. Project and pills refetch immediately. Any filter/`q` change resets `page` to 1.

Click tile → `{ name: 'editCard', params: { id } }`. A compact “Nueva” control → `{ name: 'newCard' }`.

Tiles: card `color` as fill/border like `CardProjectSelect` (`${color}33` / `${color}99`). Title visible. Prompt / Meeting badges only when that flag is true. Empty result: short empty state, no fake tiles.

Pager: left/right arrows. Disable prev on page 1; disable next when `page * limit >= total`. If a fetch returns `items: []` and `page > 1`, snap to page 1 and refetch.

Replace the `/cards` route component (`LogsView` → `CardsView`). `/cards/new` stays declared first.

### 5. Visual language stays on the current system

Follow the attached wireframe for **layout** (project chip + wide search, then a 3-column grid, arrows). Palette stays mission-log: rounded pills, dark-mode borders, card color on the tile, Prompt emerald, Meeting orange, idle chips muted (`border-black/10` / `dark:border-white/15`). Wrap the filter row on small screens; grid can drop to 1–2 columns.

## Risks / Trade-offs

- **[Risk]** `ILIKE '%term%'` will not use a btree on `name`/`description` → **Mitigation**: owner + equality + `limit` keep the scan small; `pg_trgm` later if needed.
- **[Risk]** `jsonb_array_elements` per row on search → **Mitigation**: only when `q` is set; sections stay small JSON. A generated search column is a later optimization.
- **[Risk]** `projectId=null` as a query string is easy to get wrong → **Mitigation**: Zod literal `'null'` only; omit means “all”.
- **[Risk]** Both flag pills AND can hide cards the user expected (OR) → **Mitigation**: documented as narrow-further; default both off.
- **[Risk]** `GET /` vs `GET /:id` order → **Mitigation**: register list first.
- **[Risk]** Planning home is `mission-log` but work includes `logger-brain` → **Mitigation**: implement both trees, same as the previous card change.

## Migration Plan

1. Deploy `logger-brain`: add `fl_meeting` + index, list route, accept `flMeeting` on write. Existing rows default `false`.
2. Deploy `mission-log`: form toggle + `/cards` gallery.
3. Rollback: drop the list route and UI; leave the column (safe default).

## Open Questions

None — list query, debounce, flag semantics, and gallery layout are decided above.
