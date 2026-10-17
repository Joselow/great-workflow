## Context

See proposal.md for why. There is no `requirements` or `tasks` table. `logger-brain/src/db/schemas/` is one file per table, ids come from `genUUIDv7`, timestamps come from `commons.ts`, and columns do not use `.references()`. Drizzle Kit already globs `./src/db/schemas/*`. Protected routes mount on `/app` from `routes/protected/index.ts`. Controllers in this API return the row or the array with `simpleSuccess` (logs, meetings, cards, projects). `assertOwnedProject` throws `400`. A missing or foreign meeting id on `GET/PUT/DELETE /meeting/:id` throws `404`.

`syncIssues` deletes every issue for a meeting and inserts new ones, so issue ids are not stable. `deleteMeeting` already deletes that meeting's issues, `card_meetings`, and `log_meetings`, then the meeting. `deleteProject` deletes the project row and nothing else. `meetings.project_id` is nullable.

On the frontend, `CardForm.vue` is `defineModel` plus an emitted `save`, and the view calls HTTP. `LogForm.vue` still calls the API itself; new forms do not follow it. Views are lazy in `router/index.ts`. `MeetingQualificationModal` is loaded with `defineAsyncComponent`. `useKeyboardCommands.ts` is already the only shell shortcut list, and `App.vue` already listens with `keyboardCommands.handleKeydown`. The help modal renders that same array. The header's center slot is the active project (`HeaderProjectSlot`). The writer is the shell's `SideBarText`.

## Goals / Non-Goals

**Goals:**

- Add the two resources in the existing request flow: router, Zod request form, `catchErrors`, service, schema.
- Keep one task form and one task list, and use them on `/tasks`, under a selected requirement, and on a saved meeting.
- Register **Mayús+R** and **Mayús+T** on the registry that already exists.

**Non-Goals:**

- `issue_id`, `log_id`, a requirement description, status, color, due dates, or a junction table.
- Rewriting requirements or tasks when a meeting later changes project. See the list rules in the requirements and tasks specs.
- Changing `deleteProject`, the agenda, issues, next steps, qualification, cards, or the writer layout.
- A second `window` keydown listener, a Pinia store for these two resources, or pagination.

## Decisions

### 1. Tables, with no SQL foreign keys

Add `logger-brain/src/db/schemas/requirements.ts` (`requirements`) and `tasks.ts` (`tasks`).

Both: `id` uuid primary key default `genUUIDv7`, `user_id` integer not null, `project_id` uuid not null, `meeting_id` uuid null, `name` varchar(255) not null, plus `timestamps` from `commons.ts`.

Tasks also: `requirement_id` uuid null, `description` text not null default `''`, `completed` boolean not null default `false`.

Do not call `.references()`. Do not add a relations block, and do not edit `meetings.ts` or `projects.ts` to point back. Services filter with `where`. That avoids a new import cycle; `meetings.ts` and `issues.ts` already import each other, and these queries do not need the relational API.

Alternative considered: a serial task id, as in the sketch line `id id pk`. The id is a UUID like every other primary entity.

### 2. Controllers return the body the other resources return

Use `simpleSuccess`, not `success()`. `success()` spreads an object into `{ success: true, ...data }`, and the list endpoints return an array the way `GET /log` does. Create is `201` and the row. Update, patch, and get are `200` and the row. Delete is `200` and `{ message }`.

`userId` is `getUserPayload(req).id` inside the controller. It is not a Zod field. Zod strips it if a client sends it.

Alternative considered: wrap lists in `{ items, total }`. Meetings do that because they are paginated. These lists are the whole project, newest `created_at` first, with no `page` or `limit`.

### 3. Zod checks shape. The service checks ownership and copying

`validations/requirementValidation.ts` and `taskValidation.ts`. Request forms live in `middlewares/requestForm/requirementRequestForm.ts` and `taskRequestForm.ts`, throw `BadRequestError400` with `formatValidationErrors`, and reject a body that contains `issueId` or `logId` the way log create rejects `meetingId`.

Requirement create: `name` trimmed, 1–255; `projectId` optional uuid v7; `meetingId` optional uuid v7. The service requires one origin. With `meetingId`, load the meeting for this user or throw `400` (do not reuse `getMeetingByIdForUser`, which throws `404`). No project on the meeting is `400`. A sent `projectId` that differs is `400`. Otherwise store the meeting's project. With no meeting, `projectId` is required and goes through `assertOwnedProject`, and `meetingId` is stored null.

Requirement update accepts only `name`. The request form returns `400` if `projectId` or `meetingId` is present. The service does not change those columns. That is what keeps linked tasks valid without a cascade.

Task create: `name`, optional `description` (default `''`), optional `completed` (default `false`), optional `projectId`, `meetingId`, `requirementId`. The service applies one origin, in this order:

1. `requirementId` set: load the owner's requirement or `400`. Copy its `project_id` and `meeting_id`, including null. A sent `projectId` or `meetingId` that differs is `400`.
2. Else `meetingId` set: same meeting rules as a requirement. `requirement_id` stays null.
3. Else `projectId` owned, and both links stay null.
4. Else `400`.

Task update accepts `name`, `description`, `completed`, and `requirementId`, at least one. `requirementId: null` clears the link and does not touch project or meeting. A uuid copies that requirement onto the task. A body that includes `projectId` or `meetingId` is `400`. The client omits those two on update.

`PATCH /task/:id` accepts exactly `{ completed: boolean }`. Any other field is `400`. This is the first `PATCH` in the API; `PUT` stays the form save.

The resource id in the URL uses the existing `uuidRequestForm`. Missing or other-user requirement or task is `NotFoundError404`. A referenced project, meeting, or requirement that is missing or not owned is `400`.

List query: `projectId` required. Optional `meetingId`. Tasks also take `requirementId` as a uuid or the literal `null`, and `completed` as `true` or `false`, matching the log query strings. Both filters are AND. If `meetingId` is set, that meeting's current project must be the requested project. If `requirementId` is a uuid, that requirement must belong to the user and to that project.

Alternative considered: `404` for a bad meeting id on create, matching `GET /meeting/:id`. The spec uses `400` for a referenced parent so it matches `assertOwnedProject` and the card-link checks.

### 4. Deletes

Delete task: delete the row scoped by id and `userId`. `404` when no row returns.

Delete requirement: read it for this user (`404` otherwise), then one `db.transaction`: set `requirement_id` null on that user's tasks that point at it, then delete the requirement. Do not change those tasks' `project_id` or `meeting_id`.

`deleteMeeting`: before the existing issue, card, and log cleanup, set `meeting_id` null on requirements and on tasks where `meeting_id` is that meeting and `user_id` is the owner. Same sequential style as the deletes already there. Do not wrap the whole meeting delete in a new transaction. Do not delete the requirement or task rows. Do not edit `deleteProject`.

### 5. Routes

`routes/protected/requirementRouter.ts` and `taskRouter.ts`, mounted as `/requirement` and `/task` next to `/log` and `/meeting`.

- `GET /` list
- `POST /` create
- `GET /:id`
- `PUT /:id`
- `DELETE /:id`
- `PATCH /:id` on tasks only

### 6. Frontend HTTP stays in two composables

`src/composables/useRequirement.ts` and `useTask.ts` call `apiApp` the way `useMeeting` does. They own `loading` and the list ref. Toasts are Spanish (`Requerimiento guardado`, `Tarea actualizada`, and the same kind of line for delete). No new Pinia store. The active project stays in `projectStore`.

`src/interfaces/requirement.ts` and `task.ts` hold the API types and the drafts. The requirement draft is `{ name }`. The task draft is `{ name, description, completed, requirementId }`. The parent adds `projectId` or `meetingId` when it builds the create body. On update it does not send `projectId` or `meetingId`. When a task create has a `requirementId`, the body sends that id and not a project or meeting, so the service cannot see a conflicting pair.

### 7. Shared components, CardForm shape

- `src/components/Requirement/RequirementForm.vue`
- `src/components/Requirement/RequirementList.vue`
- `src/components/Task/TaskForm.vue`
- `src/components/Task/TaskList.vue`
- `src/components/Task/TaskRow.vue`

`defineModel` for the draft, `emit('save')`, no `apiApp` import. Enter on the name input emits save. Enter in the task description does not.

`TaskForm` takes the requirement options and a `locked` flag. Locked hides the select; the parent has already set `requirementId`. Unlocked shows an empty choice plus those options and does not fetch them.

`RequirementList` is included even though the request named the task list only. The meeting page and `/requirements` would otherwise each draw the rows. The list emits `select`. `TaskList` emits `complete`, `edit`, and `delete`. Both lists own `ConfirmModal`, matching `MeetingTable`, and emit delete only after confirm. Requirement confirm copy states that the tasks remain (`¿Eliminar este requerimiento?`). Task confirm is `¿Eliminar esta tarea?`.

Rows are a bordered stack (`rounded-xl border border-black/10`), not a wide table: the task description is a muted second line, and an empty description renders nothing. Icons are `material-symbols-outlined`. The primary button uses `bg-brand-orange`. Empty lists use `EmptyRecords`.

`/requirements` and `/tasks` use `CommonLoader` for the fetch and for a form save, and they disable submit while `loading` is true. The complete control uses a per-row flag so the rest of the list stays visible. That flag calls `PATCH` and then replaces the row.

Views watch `activeProject.id` (immediate) to reload and to clear the selection. Filling the form happens in the select handler. Do not deep-watch the draft.

`/tasks` filters: **Todas** / **Pendientes** / **Hechas**, and **Todos** / **Sin requerimiento** / each requirement loaded for the active project. The requirement options on this page are that same project list.

Below `md`, the view is `flex flex-col`: form, then filters, then rows. Actions use `flex-wrap`.

### 8. Meeting embed is a lazy block under the form

`src/components/Meeting/MeetingRequirementsTasks.vue`, loaded from `MeetingFormView.vue` with `defineAsyncComponent`, same as `MeetingQualificationModal`.

Render it only when the meeting already has an id and the last project id returned by the server is non-null. Keep that persisted project id in a ref updated from get, create, and update. Do not pass the project selector's unsaved value. Place the block after the meeting card (after **Guardar**) and before `DangerZone`, so the left column and the right column stay in the order `meeting-form-order` already requires.

The block receives `meetingId` and `projectId`. It loads both lists. Requirements use the shared form and list; selecting one shows `TaskList` with `TaskForm` locked. The meeting task form's options are only the requirements loaded for this meeting and project, plus empty. Empty sends `meetingId` and `projectId` and no requirement. A chosen requirement sends `requirementId` only.

A local loader inside the block, not `FullScreenLoader`. Do not import the issue list, next steps, cards, or qualification into this component, and do not add requirements to the meeting save payload.

### 9. Nav and the existing shortcut registry

Add `/requirements` (`name: 'requirements'`) and `/tasks` (`name: 'tasks'`) as lazy routes with `requiresAuth: true`.

In `Header.vue`, under the current row and without moving `HeaderProjectSlot`, add a wrapping text nav: **Logs** (`logger`), **Reuniones** (`meetings`), **Requerimientos**, **Tareas**, **Cards** (`cards`). The current link is `font-semibold` and `text-brand-orange`. **Logs** is current for `home` and `logger`. **Reuniones** is current when the path starts with `/meetings`. **Cards** is current when the path starts with `/cards`. Below `md` the row is `flex-wrap` and does not scroll over the page.

Add two objects to the `commands` array in `useKeyboardCommands.ts`, group `navigate`:

- `go-requirements`, label `Ir a Requerimientos`, icon `assignment`, keys `Mayús` + `R`, `isShiftLetter(event, 'r')`, `router.push({ name: 'requirements' })`
- `go-tasks`, label `Ir a Tareas`, icon `task_alt`, keys `Mayús` + `T`, `isShiftLetter(event, 't')`, `router.push({ name: 'tasks' })`

Do not edit `App.vue`'s listener and do not edit `KeyboardShortcutsModal.vue`. The **Navegar** group already prints whatever is in the registry.

## Risks / Trade-offs

- [A meeting later moves to another project, and its old requirements keep the old project] → The meeting screen lists `projectId` AND `meetingId`, so those rows stay on the old project's page. The meeting save does not rewrite them. Documented in the specs.
- [`deleteProject` can leave requirements and tasks whose project no longer exists, because there is no FK] → Out of scope. Do not add cleanup inside `deleteProject` in this change.
- [`deleteMeeting` can stop between statements, as it can today] → The new updates run first and use the same sequential style. Requirement delete is the one that uses a transaction, because it is new and has two writes that must agree.
- [On the meeting page a task can show under its requirement and in the meeting task list] → Both lists reload from the composable after create, patch, update, and delete.
- [`writer-panel-responsive` is still an open change around the shell] → This change does not edit `SideBarText.vue` or the shell's writer classes. The new pages only have to stack in one column below `md`.
- [A client that already sent `issueId` gets `400`] → There is no current client. Rejecting is louder than dropping the field.

## Migration Plan

From `logger-brain`, generate the migration with `pnpm db:generate` and apply it with `pnpm db:migrate` (dev can use `pnpm db:push`). No backfill. Deploy the migration before the API process that calls the new tables inside `deleteMeeting`. The UI can ship with or after that API. Rolling back the UI leaves the tables unused. Rolling back the API after the migration leaves empty tables; dropping them is safe only while no owner data has been written. Existing meeting, log, card, and issue behavior is unchanged apart from the nullify on meeting delete.
