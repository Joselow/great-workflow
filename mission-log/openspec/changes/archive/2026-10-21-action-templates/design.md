## Context

See proposal.md for why. Owner resources already follow `routes → requestForm → controller → service → db/schemas`, with `user_id` taken from the token and no SQL foreign keys. Cards already expose `GET /card` with `isPrompt`, `q`, and pagination, and the shell nav is the five links in `Header.vue`. `ColorPicker`, `ModalBase`, and `ConfirmModal` already exist. `entities.md` spells the new table with `action` (optional), `template`, `color`, `is_active`, a nullable `card_id`, and module values that include `all`.

## Goals / Non-Goals

**Goals:**

- Persist one template per row, owned by the user, on exactly one of `all | log | meeting | requirement | task`.
- Keep the body exclusive: plain text, or a link to one prompt card, with the list showing a link icon and the card name.
- Configure them on one board. Create and edit use one modal. Picking the card uses a second modal that does not call the API itself.
- Deleting a template removes that row only. The linked card record stays.

**Non-Goals:**

- Inserting a template into another module, a Cards section, a keyboard shortcut, or a project id on the row.
- Editing or deleting the card body from the action modal or from the template delete action.
- A radio that marks a single active template. `is_active` is a flag; several templates in one module may be active.

## Decisions

### 1. Table matches the note, with owner and normalized module names

`action_templates` lives in `db/schemas/actionTemplates.ts`. Serial `id`. `user_id` integer, not null, set from the token — the note omits it, and every other owner table has it. No `project_id`: these are the user's templates across projects. `card_id` uuid, nullable, no `.references()`. `module` varchar, one of `all`, `log`, `meeting`, `requirement`, `task` (the note's `requeriments` / `taks` are not stored). `name` varchar 255. `action` text, nullable. `template` text, not null, default `''`. `color` varchar 7. `is_active` boolean, not null, default true. Timestamps from `commons.ts`.

Index `(user_id, module)`.

Alternative considered: uuid primary key, like requirements. The note says `id int pk`, and issues and tags already use `serial`, so the route param is an integer, not `uuidRequestForm`.

### 2. Card mode clears the text; text mode clears the card

Create and update take `module`, `name`, `color`, optional `action`, optional `isActive`, optional `cardId`, optional `template`.

When `cardId` is a uuid, the service checks that card belongs to the user and `is_prompt` is true, stores that id, and stores `template` as `''`. Any template text in the body is ignored. When `cardId` is null or omitted, `template` must be non-empty after trim and `card_id` is stored null.

`action` blank becomes null. `name`, `action`, and text-mode `template` are trimmed. Color is `#` plus six hex digits, the same rule as cards. Omitted `isActive` on create defaults to true.

A read adds `card: { id, name, color, description } | null`. The summary is present only when that card still belongs to the user and is still a prompt. The JSON does not include `userId`. List is a JSON array (same `simpleSuccess` shape as requirements), oldest `createdAt` first, optional `module` query. No pagination.

Alternative considered: reject the body when both `cardId` and template text are sent. Ignoring the text avoids a failed save when the form still holds the previous textarea.

### 3. Delete of a template never deletes the card

`deleteActionTemplate` deletes one `action_templates` row for that user. It does not call `deleteCard`, and it does not update the card. `card_id` is only a pointer. **Quitar** in the form is not a delete: it clears the pointer on the next save and also leaves the card in place.

The other direction stays separate. `deleteCard`, and the branch of `updateCard` that sets `is_prompt` to false, run in a transaction that sets `card_id` null on that user's templates pointing at the card. Those template rows are not deleted. `actionTemplateService` owns that nullify. `cardService` calls it. The template service does not import `cardService`.

There is no SQL foreign key, so deleting the action cannot cascade into `cards`.

### 4. The page is a board; the sketch's center form and cards column become modals

Route `/action-templates`, lazy view `views/actionTemplates/ActionTemplatesView.vue`, nav label **Acciones** after **Cards**. No command in `useKeyboardCommands.ts`.

The view loads every template once and does not pass `projectId`. Changing the active project does not refetch.

Layout, inside `max-w-5xl`: from `lg`, a two-column grid. **Todos** spans both columns. Then **Logs** | **Reuniones**, then **Requerimientos** | **Tareas**. Below `lg`, one column in that order. Each section is a flat panel (thin border, small radius). The `+` of a section opens create with that module selected.

Rows: color swatch, name, and, only when `card` is non-null, a link icon plus the card name. Inactive rows are dimmed. Pencil opens edit. X opens `ConfirmModal`, whose copy says the action is removed and the card is not. No radio.

`ActionTemplateFormModal` and `ActionTemplateSection` are presentational. The view calls `useActionTemplate` and `useCard`. Fields: **Nombre**, `ColorPicker` `variant="button"` default `#f5f5f4`, optional **Acción**, **Activa** (default on), module select among the five values, and **Texto** | **Card**.

**Texto** shows the **Plantilla** textarea and sends `cardId: null`. **Card** hides the textarea, shows **Asociar card**, and when a card is chosen shows its name, a clamped read-only description, **Quitar**, and **Editar card** (`router.push` to `editCard`). Save in card mode sends that `cardId`.

### 5. Associate-card modal is a presentational picker

`components/Card/AssociateCardModal.vue` receives the page of cards, loading, query, page, and total. It emits search, page change, select, and close. It does not import `useCard` or the router. The view requests `getCards({ isPrompt: true, q, page, limit: 12 })` while the picker is open, and resets to page 1 when the query changes. Choosing a card closes the picker and fills the form. The picker does not create or delete a card.

This change mounts it only from the action-template view. Another screen can pass the same props later.

## Risks / Trade-offs

- [A prompt card deleted or turned off leaves an empty template] → The row keeps its name and loses the chip. The next save must be text or a new card. The modal stays open on `400`.
- [The picker is one page of prompt cards] → Search and page controls use the existing card list, so a card off-page is still reachable.
- [Six nav labels wrap on a phone] → The section-nav wrap rule already covers that. No new shortcut, so the registry stays as it is.
- [`ModalBase` uses a shadow] → Reuse it for both modals.
- [Confirm delete could be read as deleting the card too] → The confirm text names the action and says the card stays. The service deletes only `action_templates`.

## Migration Plan

Add the table with `pnpm db:generate` and apply it with `pnpm db:migrate` (or `pnpm db:push` in dev). No backfill. Rollback is dropping `action_templates` and removing the router. Card delete and the prompt-off update gain a nullify step; the card row itself is unchanged. Template delete does not touch `cards`.

## Open Questions

None.
