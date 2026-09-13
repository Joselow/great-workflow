## 1. Backend schema (`logger-brain`)

- [x] 1.1 Add `src/db/schemas/cards.ts` (uuid v7 id, userId, nullable projectId, nullable meetingId, name, description text, color, isPrompt, sections jsonb default `[]`, timestamps) and export types; verify it matches the design field table
- [x] 1.2 Generate and apply the Drizzle migration; verify `\d cards` (or Studio) shows the new table

## 2. Backend write API (`logger-brain`)

- [x] 2.1 Add Zod create/update schemas (`name`, optional `description`, hex `color`, `isPrompt`, nullable `projectId`, `sections[{ title, description }]`) and request-form middleware; verify invalid bodies return 400
- [x] 2.2 Add `cardService` create/getById/update: owner `userId` from JWT, `meetingId` always left null, `isPrompt` forces `sections: []`, `projectId` must be the user's project or null; verify a foreign project is rejected
- [x] 2.3 Add controller + `cardRouter` (`POST /`, `GET /:id`, `PUT /:id` with `uuidRequestForm`) and mount under protected `/app/card`; verify create/get/update as owner, 401 without token, 404 for another user's card

## 3. Backend public API (`logger-brain`)

- [x] 3.1 Add `GET /api/v1/public/card/:id` outside `requireAuth`; return `{ id, name, description, color, isPrompt, sections, project: { name, color } | null }` and never `userId`/`meetingId`; verify no token works, missing id is 404, missing project serializes as null

## 4. Frontend types and client (`mission-log`)

- [x] 4.1 Add `interfaces/card.ts` and `useCard` (`create`, `getById`, `update`, `getPublic`); verify owner calls hit `/app/card` and public hits `/public/card/:id`
- [x] 4.2 Ensure `getProjects` is available in the form (load if the store is empty); verify the selector can list the user's projects

## 5. Card form UI (`mission-log`)

- [x] 5.1 Add `CardProjectSelect.vue` (projects + “Ningún proyecto”); verify it does not change `activeProject`
- [x] 5.2 Add `CardSectionList.vue` (add, remove, up/down); verify order in the draft matches the visible list
- [x] 5.3 Add `CardFormView.vue`: create defaults `projectId` to `activeProject` or null, reuse `ColorPicker` and `ConfirmModal`, prompt toggle hides and clears sections; verify cancel does not persist and confirm creates or updates
- [x] 5.4 Register `/cards/new` and `/cards/:id` (new before `:id`); after create, replace to edit; verify both routes load the same view and edit shows persisted data

## 6. Public view (`mission-log`)

- [x] 6.1 Add `CardPublicView.vue` at `/c/:id` with `requiresAuth: false`; show title, description, color, optional project label, sections only when not a prompt; verify logged-out users see it without header/drawer/writer and unknown id shows not-found

## 7. End-to-end checks

- [x] 7.1 Create a regular card with two sections, confirm save, reload edit, then convert to prompt and confirm; verify sections are gone in API and UI
- [x] 7.2 Create a free card (no project) and one tied to a non-active project; verify public `/c/:id` shows the right label or none, and `meetingId` stays null
