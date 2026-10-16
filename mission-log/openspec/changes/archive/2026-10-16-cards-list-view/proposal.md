## Why

`/cards` still mounts the logs placeholder. Cards already persist (form + public view) but there is no owner gallery to find them. A list with project, text search, and prompt/meeting filters — applied in SQL — is the missing entry point now that create/edit exists.

## What Changes

- Add `fl_meeting` on `cards`. The create/edit form can mark it (same pill style as Prompt). It is independent of `meeting_id` (still unused).
- Add owner `GET /card` with query filters: project (uuid, or null-only), `q` (ILIKE on title, description, section title, section description), `isPrompt`, `flMeeting`, plus page/limit.
- Replace `/cards` with a gallery: project dropdown (all projects + “sin proyecto”), debounced search, Prompt and Meeting toggle pills, tiles tinted with each card’s color, prev/next arrows.
- Search runs on the server after a short debounce. Do not filter the full set in the client.

## Capabilities

### New Capabilities
- `card-list-query`: Owner list endpoint. Filters in the database (project including null-only, ILIKE across card + section text, prompt/meeting flags) and returns a paginated page.
- `card-list-view`: Authenticated `/cards` gallery — filter bar, debounced search, colored tiles with Prompt/Meeting badges, pager arrows, navigate to edit.
- `card-meeting-flag`: Persist `fl_meeting`, accept it on create/update, and expose a form toggle next to Prompt.

### Modified Capabilities
- None — `openspec/specs/` has no main specs yet. This builds on the in-flight `cards-form-and-public-view` API and form.

## Impact

- Backend (`logger-brain`): `cards` column + migration, list in `cardService`/`cardController`/`cardRouter`, query Zod + GET request-form. Create/update accept `flMeeting`.
- Frontend (`mission-log`): `CardsView` on `/cards`, small filter/tile components, `useCard` list + debounce, form toggle for `flMeeting`. Reuse `CardProjectSelect` / project store / card color language.
- API: additive `GET /api/v1/app/card`. Create/update body gains `flMeeting`. Not **BREAKING**.
- No new runtime dependencies.
