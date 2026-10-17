## Why

Flow Work Logger is supposed to carry requirements and tasks through the closed loop, but nothing durable exists for them yet. Meeting issues are not that store: `syncIssues` deletes every issue for a meeting and inserts new rows, so their ids do not survive a save. Next steps already become logs and must stay logs. Requirements and tasks need their own records, creatable from a project or from a meeting, without waiting on a redesign of the meeting agenda.

## What Changes

- Add owner-scoped requirements. Each one has a required project and at most one meeting (`meeting_id` nullable). Created from a project, `meeting_id` is null. Created from a meeting, `project_id` is copied from that meeting. A meeting with no project cannot produce a requirement (the form does not offer it; the API rejects it).
- Add owner-scoped tasks. A task is created from a project only, from a meeting only, or from a requirement. It has one nullable meeting and one nullable requirement, not junction tables. `completed` defaults to false. A description is optional text.
- When a task is linked to a requirement, the service copies that requirement's `project_id` and `meeting_id` (null matches null). The client cannot send a conflicting pair. Unlinking keeps the task's current project and meeting.
- A requirement's project and meeting are fixed at creation. Later edits change the name only, so linked tasks do not need a cascade.
- Delete a task by deleting the row. Delete a requirement by keeping its tasks and clearing their `requirement_id`. Delete a meeting by leaving requirements and tasks in place and setting their `meeting_id` to null. Do not change project deletion.
- Add `/requirements` and `/tasks` for the active project, reusing one form and one task list. The same components appear on an already saved meeting that has a project. Agenda, issues, next steps, qualification, and cards stay as they are.
- Add a slim text nav — Logs, Reuniones, Requerimientos, Tareas, Cards — and register **Mayús+R** and **Mayús+T** on the existing command registry.

Out of scope: `issue_id`, `log_id`, a requirement description, status enums, color, due dates, linking tasks to issues, replacing next steps, and a second keyboard listener.

## Capabilities

### New Capabilities

- `requirements`: Stored requirement, ownership, the project/meeting pair, and what create, rename, and delete do.
- `tasks`: Stored task, the three creation origins, the requirement invariant, completion, and delete.
- `requirements-view`: `/requirements` for the active project: fast name entry, list, edit, delete, and the tasks of the selected requirement.
- `tasks-view`: `/tasks` for the active project: create, edit, complete, delete, and the status and requirement filters.
- `requirement-task-forms`: Shared requirement and task forms and the task list/row. Parents own HTTP. Components do not.
- `meeting-requirements-tasks`: On a saved meeting that has a project, create and manage that meeting's requirements and tasks with the shared components. Agenda, issues, next steps, qualification, and cards do not change.
- `section-nav`: Slim text navigation in the shell. The header project slot stays the active project.

### Modified Capabilities

- `keyboard-commands`: The registry also navigates to Requerimientos with **Mayús+R** and to Tareas with **Mayús+T**, through the listener that already exists.
- `meeting-api`: Deleting a meeting still removes the meeting and its card and log links, and still does not delete cards or logs. It also clears `meeting_id` on requirements and tasks that pointed at that meeting, without deleting those rows.

## Impact

- `logger-brain`: new `requirements` and `tasks` tables (UUID v7, no SQL foreign keys), Zod request forms, controllers, services, and protected routers. `deleteMeeting` nullifies `meeting_id` before the cleanup it already does. `deleteProject` is untouched. No new dependency.
- `mission-log`: lazy routes, views, composables, and interfaces; shared components used by those views and by the meeting form; two commands added to `useKeyboardCommands.ts`; a text nav in the header. The writer rail stays as it is. `SideBarText` is not redesigned.
- Lists are the whole project, newest first, with no pagination in v1.
