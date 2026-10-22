## Context

See proposal.md for why. `/requirements` is a name form plus `RequirementList`. The row already has a **Tareas** button with no action. The task block under the list is commented out in `RequirementsView.vue`. `/tasks` is the workspace to copy: `TaskForm` on the left, status filters and `TaskList` on the right, one column below `md`. `ModalBase` already teleports, closes on Escape and on the backdrop, and accepts `maxWidth`. `GET /task` and task create already accept a requirement: when the body has `requirementId`, the API copies that requirement's project and meeting.

## Goals / Non-Goals

**Goals:**

- Open the task workspace from **Tareas**, scoped to that requirement and the active project.
- Reuse `TaskForm` (locked) and `TaskList`. Do not add a second task form or a second table.
- Leave rename and delete on the requirement list.

**Non-Goals:**

- Mounting this modal from `/tasks` or from the meeting page. It is imported only by `RequirementsView`.
- A requirement chip row inside the modal. The clicked row is the filter.
- Changing the tasks page or the meeting embed.
- A new API, table, or dependency.

## Decisions

### 1. One modal component owns the task workspace

Add `components/Requirement/RequirementTasksModal.vue` and import it only from `RequirementsView`. `RequirementList` emits `tasks` with the requirement. `RequirementsView` keeps that requirement in a ref and renders the modal. The modal calls `useTask` the way `MeetingRequirementsTasks` already does, so the view does not keep a second copy of create, complete, and delete. Remove the commented task block and the unused task state from `RequirementsView`.

`TaskForm` and `TaskList` still emit save, complete, edit, and delete. They do not call the API.

Alternative considered: leave the handlers in `RequirementsView` and make the modal presentational. That puts the tasks page logic back into the list page, which is what the commented block already was.

### 2. The modal is the tasks page with the requirement fixed

Use `ModalBase` with `maxWidth="xl"` so the two columns fit. The header is the requirement name.

Inside, match `TasksView`: form on the left, filters and table on the right, stacked below `md`. Status filters are **Todos**, **Pendientes**, and **Completadas**, the labels the tasks page renders now. **Todos** omits `completed`. **Pendientes** sends `completed: false`. **Completadas** sends `completed: true`. There is no requirement chip row.

Load with `getTasks({ projectId, requirementId })` when the modal opens and when the status filter changes. Pass `locked` and an empty requirements list to `TaskForm`, and set the draft `requirementId` to the open requirement. Create sends that id and does not also send `projectId`, so the API copies the requirement's project and meeting. Update, patch completed, and delete stay the row actions already on `TaskList`. Cancel, which the form emits while a task is being edited, clears the draft and leaves the modal open.

### 3. Closing does not touch the requirement list

`ModalBase` already closes on Escape and on the backdrop. A close control in the header does the same. Closing sets the open requirement to null. Changing `activeProject.id` does the same before the requirement list reloads. **Tareas** does not emit `select`, so the name field is unchanged.

## Risks / Trade-offs

- [The modal is wide on a phone] → Below `md` the form stacks above the table, and the table keeps its own horizontal scroll. The page behind stays `overflow-x-hidden`.
- [A requirement created from a meeting copies that meeting onto the new task] → That is the existing create rule. The modal does not offer a meeting control.
- [`ModalBase` uses a shadow] → Reuse it. Do not invent a second dialog.

## Migration Plan

Frontend only. Revert the modal and point **Tareas** at nothing if the workspace should return under the list.

## Open Questions

None.
