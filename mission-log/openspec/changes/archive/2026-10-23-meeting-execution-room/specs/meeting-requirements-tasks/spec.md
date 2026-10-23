## REMOVED Requirements

### Requirement: The blocks appear only for a saved meeting with a project
**Reason**: The meeting form no longer embeds the requirements and tasks workspace. Capture happens in the execution room.
**Migration**: Open the room with **Iniciar reunión**. Creating a requirement or a task still requires a saved meeting that has a project, and still copies that meeting id and that project id. Those rules live on `meeting-execution-room`.

### Requirement: Requirements of this meeting use the shared form
**Reason**: The room lists every saved requirement with its tasks visible, newest first. It does not select a requirement to reveal a second form.
**Migration**: Add requirements and their tasks from the issue frame in the execution room. `/requirements` keeps its own form.

### Requirement: Meeting tasks are the tasks of this meeting
**Reason**: Loose tasks are captured in the execution room, not in a second block under the planning form.
**Migration**: Add a loose task from the issue frame. It still stores this meeting id and a null requirement id.

### Requirement: A change in one block is visible in the other
**Reason**: The planning form no longer has two blocks that must mirror each other.
**Migration**: The room has one notebook. `/requirements` and `/tasks` stay their own pages.

### Requirement: The blocks sit outside the existing meeting columns
**Reason**: Those blocks are removed from the planning form. The column order is already specified by `meeting-form-order`.
**Migration**: Do not render the requirements block or the tasks block on the meeting form. Saving the meeting still does not send requirements or tasks inside the meeting payload.
