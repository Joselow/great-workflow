## Why

Cards are the next knowledge surface of Flow Work Logger: reusable notes (and later, prompts) that belong to a project or stand alone. There is no persistence, no form, and no shareable read-only view — `/cards` is still a placeholder. Shipping create/edit plus a public link now gives the entity a closed loop before meetings or card-usage flows are wired.

## What Changes

- Add a `cards` table and owner-scoped API: create, get, update. `meeting_id` is stored as nullable and is **not** set or edited in this change.
- Persist optional ordered **sections** on the card. `is_prompt` cards keep only title + description; turning prompt on clears sections before save.
- `project_id` is optional. The form defaults to the active project, can switch to another of the user's projects, or to none (free card).
- Same authenticated view for create (`/cards/new`) and edit (`/cards/:id`): project selector, color, prompt toggle, title, description, sections, save with confirm.
- Public, unauthenticated view at `/c/:id` that shows the card (no edit). Anyone with the id can read it.
- No card list UI, no delete, no meeting link, no “use this card” actions.

## Capabilities

### New Capabilities
- `card-api`: Persist cards and expose owner create/get/update plus an unauthenticated public get by id.
- `card-form`: Authenticated create/edit form — project picker, color, prompt mode, sections, confirm-before-save.
- `card-public-view`: Read-only public page for a card id, styled like the form but not editable.

### Modified Capabilities
- None — `openspec/specs/` has no main specs yet.

## Impact

- Backend (`logger-brain`): new `db/schemas/cards.ts`, Drizzle migration, `card` validation/middleware/controller/service/router. Protected routes under `/api/v1/app/card`. Public `GET /api/v1/public/card/:id` outside `requireAuth`.
- Frontend (`mission-log`): `CardFormView`, small presentational pieces (project select, section list), `useCard`, public `CardPublicView`, routes. Reuse `ColorPicker`, `ConfirmModal`, `projectStore` / `useProject`.
- API: new resource. Not **BREAKING**.
- No new runtime dependencies. Sections live as JSON on the card (no extra table).
