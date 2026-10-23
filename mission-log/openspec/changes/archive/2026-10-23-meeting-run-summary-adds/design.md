## Context

See proposal.md for why. The close act already edits and deletes requirements, tasks, and next steps, and it passes `hide-add` into the shared notebook, so every add control is hidden there. The development act uses that same notebook with add controls on. Act changes already exist as the on-screen chevrons in `MeetingRunView`. Keyboard shortcuts live in one registry (`useKeyboardCommands`); the listener ignores fields, modifiers, guest routes, and every command except help while the help flag is open. The execution room is a bare authenticated route, so that listener already runs there. Creating a requirement, a task, or a next step does not need a new API.

## Goals / Non-Goals

**Goals:**

- Turn add back on in the summary, with the plus on the row, and keep the development act's add controls as they are.
- Append new requirements, requirement tasks, loose tasks, and next steps.
- Drive the existing act change from ArrowLeft and ArrowRight through the keyboard registry.

**Non-Goals:**

- Rewriting the summary copy, numbering, **Actualizar**, or the handshake icon.
- Changing how the development act lays out its add controls.
- A new endpoint, column, or dependency.
- Mounting the shortcuts-help modal on the bare route.

## Decisions

### The summary plus sits inside the row

The summary keeps using `MeetingRunNotebook`. It stops passing `hide-add` when the meeting has a project, and it passes a flag that draws the plus inside the row, immediately before edit and delete. That plus on a requirement row, and the same plus on each of its task rows, opens the task composer under that requirement. A plus for a new requirement stays with the requirements list and, when the list is empty, is still shown under **Requerimientos**. Loose tasks use a plus on each row; when there are none, the plus under **Tareas** opens the composer. The development act does not pass that flag, so its **Agregar tarea** button and bottom composer stay.

Alternative: remove `hide-add` and reuse the development layout in the summary. Rejected because the summary marks the plus inside the row, and the development layout is explicitly left alone.

### Next steps reuse the full-list save

One plus under **Próximos pasos** reveals an input. Confirming it sends the existing steps plus the new description through the save the close act already uses. The description must be at least 2 characters; shorter input shows the current error and does not replace the list. The new step is last. No project: the plus is not rendered. Edit, delete, and **Actualizar** stay.

### Arrow keys are two registry commands

Add `room-act-prev` and `room-act-next` to the existing command list. `MeetingRunView` registers and clears the callbacks the same way Logs registers clearing the selected log. `when` is true only while the route is the execution room and the room says arrows are enabled. The view disables them while the finish dialog is open. `run` calls the same previous and next act functions as the chevrons, including their edges: left on the first act and right on the last act do nothing. There is no second `keydown` listener in the room.

Alternative: listen for arrows inside `MeetingRunView`. Rejected because a command outside the registry is not allowed, and a second listener would race the global one.

## Risks / Trade-offs

- [ArrowLeft and ArrowRight call `preventDefault` when they match] → They only match in the room, outside a field, so typing and other pages keep the keys.
- [Shift+/ on the bare route can set the help flag while the help modal is not mounted, which then blocks arrows] → Same guard the registry already has. This change does not mount that modal.
- [A fast double-add can send two creates] → The notebook already ignores a create while one is saving. The next-step plus does the same.
