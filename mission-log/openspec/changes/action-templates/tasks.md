## 1. Schema

- [x] 1.1 Add `logger-brain/src/db/schemas/actionTemplates.ts` with serial `id`, `user_id`, nullable `card_id`, `module`, `name`, nullable `action`, `template` default `''`, `color`, `is_active` default true, and `commons` timestamps, and verify the file exports the table plus select and insert types
- [x] 1.2 Add an index on `(user_id, module)` and verify `card_id` has no SQL foreign key
- [x] 1.3 Generate the Drizzle migration and verify the SQL creates `action_templates` and does not alter or drop `cards`

## 2. API

- [x] 2.1 Add Zod create/update and list-query schemas for module `all | log | meeting | requirement | task`, trimmed name, optional action, `#` plus six hex digits, optional `isActive`, optional `cardId`, and optional `template`, and verify `card` and `cards` as a module fail validation
- [x] 2.2 Add an integer id param check, not `uuidRequestForm`, and verify a non-integer id is `400` before the service runs
- [x] 2.3 Implement create, list, get, and update in `actionTemplateService` with `user_id` from the token: text mode stores trimmed template and null `card_id`; card mode stores the owned prompt card and `template` `''`, and verify a non-prompt card and another user's card return `400` without inserting a row
- [x] 2.4 Return list as a JSON array, oldest `createdAt` first, with optional `module`, and verify each item includes `card: { id, name, color, description }` only for an owned prompt card and omits `userId`
- [x] 2.5 Implement delete so it removes only that user's `action_templates` row, and verify a linked card is still returned by the card read with the same name and description
- [x] 2.6 Wire request form, controller, and `actionTemplateRouter` under protected `/action-template`, and verify missing token is `401` and another user's id is `404` on get and delete
- [x] 2.7 On card delete, and when a card update sets `is_prompt` to false, set `card_id` null on that user's templates in the same transaction, and verify those template rows still exist and a template pointing at a different card is unchanged

## 3. Board

- [x] 3.1 Add the action-template interface and `useActionTemplate` for list, create, update, and delete, and verify the composable talks to `/action-template` and does not call the card delete endpoint
- [x] 3.2 Add lazy route `/action-templates` and `ActionTemplatesView` that loads the owner's templates with no `projectId`, and verify changing the active project leaves the same rows on screen
- [x] 3.3 Render five sections — **Todos**, **Logs**, **Reuniones**, **Requerimientos**, **Tareas** — full-width **Todos** and two columns from `lg`, stacked below `lg`, and verify there is no Cards section and the page does not overflow the viewport
- [x] 3.4 Show color, name, and a link icon plus card name only when `card` is present; dim inactive rows; offer pencil and X; no radio, and verify a text template has no chip
- [x] 3.5 Open one create/edit modal from **+** and from pencil, with **Nombre**, `ColorPicker`, optional **Acción**, **Activa**, the five-module select, and **Texto** / **Card**, and verify **+** on **Reuniones** starts on meeting and **Texto**
- [x] 3.6 In **Card** mode, hide the textarea, open the associate-card modal, and after a choice show the link icon, name, read-only description, **Quitar**, and **Editar card**, and verify **Quitar** returns to **Texto** without deleting the card and **Editar card** opens that card's edit route
- [x] 3.7 Save text with `cardId` null and save a card link with that card id, and verify a card-mode save with no card does not call the API and leaves the modal open
- [x] 3.8 Confirm delete with copy that the action is removed and the card is not, and verify confirming removes only the row while the card remains on `/cards`, and cancelling keeps both

## 4. Associate card modal

- [x] 4.1 Add presentational `AssociateCardModal` that lists color, name, and description, and verify it does not import `useCard`, the router, or a create/delete control
- [x] 4.2 While it is open, request `isPrompt=true` with search and pages of 12, reset to page 1 on a new query, and verify choosing a row returns that card and closes the modal without navigating or changing the active project

## 5. Nav

- [x] 5.1 Add **Acciones** after **Cards** in the shell nav to `/action-templates`, mark it current only on that route, and verify the other five links still open their current pages and the links wrap below `md`

## 6. Check

- [x] 6.1 Run `pnpm typecheck` in `logger-brain` and `pnpm exec vue-tsc --noEmit` in `mission-log` and verify both exit 0
