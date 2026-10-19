## Why

Requerimientos is a short list: name a requirement, rename it, or delete it. Its tasks are a second workspace, the same one `/tasks` already uses, and they belong to that one requirement. Opening them under the list mixes the two jobs and hides the two-column task layout.

## What Changes

- On `/requirements` only, the **Tareas** button of a row opens a modal. `/tasks` stays its own page. The meeting page does not gain this modal.
- Inside the modal, the layout matches the tasks page: the form on the left, the task table on the right, and the same status filters (**Todos**, **Pendientes**, **Completadas**).
- The list is the tasks of the active project that belong to the requirement of that button. A task saved in the modal is stored on that requirement. There is no second requirement picker, because the row already chose it.
- Closing the modal returns to the requirement list. Switching the active project closes the modal.

## Capabilities

### New Capabilities

### Modified Capabilities

- `requirements-view`: **Tareas** on a requirement row opens the tasks workspace in a modal that exists only on this page. The list is that requirement's tasks for the active project.

## Impact

- `mission-log`: `RequirementsView`, `RequirementList`, and a modal that reuses `ModalBase`, `TaskForm`, and `TaskList`. Task reads and writes stay on the existing `/task` API with `projectId` and `requirementId`. No schema, route, or new dependency.
