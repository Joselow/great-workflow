## Why

Reusable actions (a mail summary, a WhatsApp note, a prompt) are still typed by hand on each module. Action templates give each module a named, colored text — or a link to one prompt card — that can be configured in one place before any module starts inserting them.

## What Changes

- Add an owner-scoped `action_templates` table and CRUD. A template belongs to one module: `all` (Todos), `log`, `meeting`, `requirement`, or `task`. Cards is not a module in this change.
- Each template has a name, an optional `action` (what the action is for), a color, and `is_active`. The body is one of two modes: required template text, or a link to one prompt card the owner already has (`card_id`). Linking does not copy the card body into the template.
- Deleting a template deletes only that action row. If it points at a card, the card stays in Cards with its content unchanged. The other direction is the same idea: deleting a card does not delete templates; it only clears their `card_id`.
- Add `/action-templates`. The page is a board of five sections — **Todos**, **Logs**, **Reuniones**, **Requerimientos**, **Tareas** — not the sketch's side-by-side editor. Each section lists that module's templates and can add one.
- Create and edit happen in one modal: name, the existing color picker, optional action, and a **Texto** / **Card** choice. **Card** opens a reusable associate-card modal that lists only prompt cards and returns the chosen card. The row then shows a link icon and the card name.
- Add **Acciones** to the shell nav, after **Cards**, pointing at this view.

Out of scope: inserting a template into a log, meeting, requirement, or task; a Cards section; editing the linked card's body inside this modal; a keyboard shortcut; scoping templates to the active project.

## Capabilities

### New Capabilities

- `action-template-api`: Owner-scoped persistence and CRUD. One module per template. Text body or a prompt-card link, never both.
- `action-templates-view`: `/action-templates` board, per-module sections, and the create/edit modal.
- `associate-card-modal`: Reusable modal that picks one of the owner's prompt cards. This change opens it only from the action-template modal.

### Modified Capabilities

- `section-nav`: The shell nav adds **Acciones** after **Cards**. **Acciones** opens `/action-templates` and is the current link on that route.

## Impact

- `logger-brain`: new `action_templates` schema (serial id, `user_id` from the token, nullable `card_id`, no SQL foreign keys), Zod request form, controller, service, and a protected `/action-template` router. Delete of a template does not delete the linked card. Delete of a card only clears `card_id` on that owner's templates. No new dependency.
- `mission-log`: lazy route, view, composable, interface, section list, form modal, and `AssociateCardModal`. Reuse `ColorPicker`, `ModalBase`, `ConfirmModal`, and `GET /card?isPrompt=true`. One new nav label in the header.
- Not **BREAKING**. Logs, meetings, requirements, tasks, and the cards gallery stay as they are.
