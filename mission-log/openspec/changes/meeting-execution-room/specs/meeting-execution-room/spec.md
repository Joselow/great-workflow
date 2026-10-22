## Purpose

A full-screen room for a saved meeting: walk the agenda, capture one notebook for the whole meeting, and record only the time that room stays open. A meeting that is already executed, or whose actual duration is already stored, shows that duration and does not count again.

## ADDED Requirements

### Requirement: Iniciar reunión opens the room
The meeting form SHALL show a button labeled **Iniciar reunión** directly under **Copiar resumen** when the meeting has an id. Activating it SHALL open the execution room for that meeting. The create form, before the meeting exists, SHALL NOT show the button. The button SHALL open the room whether or not the meeting is already executed or already has an actual duration.

#### Scenario: Saved meeting
- **WHEN** the owner is editing a saved meeting
- **THEN** the form SHALL show **Iniciar reunión** under **Copiar resumen**
- **AND** activating it SHALL open the execution room for that meeting

#### Scenario: Unsaved meeting
- **WHEN** the owner is creating a meeting that has no id yet
- **THEN** the form SHALL NOT show **Iniciar reunión**

#### Scenario: Already executed
- **WHEN** the owner activates **Iniciar reunión** on a meeting with `executed` true
- **THEN** the room SHALL open
- **AND** the clock SHALL NOT advance

### Requirement: The room is three acts
The room SHALL show three acts in order: context, development, and close. A control SHALL move to the previous act and another to the next act. The meeting title and the clock SHALL stay visible on every act. The context act SHALL show the current status, the objective, and the participants. The development act SHALL start on the issue list. The close act SHALL show the agenda, the notebook, the additional info, the next steps, and a thank-you line built from the participants. The thank-you line SHALL NOT be stored.

#### Scenario: Move between acts
- **WHEN** the owner opens the room and activates the next control
- **THEN** the room SHALL show the development act
- **AND** the meeting title and the clock SHALL still be visible

#### Scenario: Thank-you is not stored
- **WHEN** the close act renders
- **THEN** it SHALL show a thank-you that includes the meeting participants
- **AND** finishing the room SHALL NOT persist that thank-you as its own field

### Requirement: An issue is a frame, not a parent
The development act SHALL list the meeting's issues in agenda order. Double-clicking an issue SHALL show that issue's name as the frame and the meeting notebook under it. A single click SHALL leave the owner on the issue list. Returning to the list and double-clicking a different issue SHALL show that other issue's name and the same notebook. The room MUST NOT send an issue id when creating or updating a requirement or a task.

#### Scenario: Double click enters the frame
- **WHEN** the owner double-clicks an issue
- **THEN** the room SHALL show that issue's name
- **AND** SHALL show the meeting notebook under it

#### Scenario: Single click stays on the list
- **WHEN** the owner single-clicks an issue
- **THEN** the room SHALL remain on the issue list

#### Scenario: Same notebook in two issues
- **WHEN** the owner adds a requirement while the first issue is open, returns to the issue list, and double-clicks the second issue
- **THEN** the second issue SHALL show its own name
- **AND** SHALL list that requirement

#### Scenario: No issue link
- **WHEN** the owner creates a requirement or a task from an open issue
- **THEN** the stored requirement or task SHALL NOT have an issue id

### Requirement: The notebook stacks newest first
Inside an issue frame, the notebook SHALL show an empty requirement composer that stays above the saved requirements. Saving it SHALL create a requirement for this meeting and this meeting's project, and that requirement SHALL appear first among the saved requirements. Each requirement SHALL show its tasks indented under it, always visible, newest task first. A control on the requirement SHALL create a task of that requirement, and that task SHALL appear first under it. A control on a task SHALL create another task of the same requirement, also first under it. Loose tasks SHALL be listed apart from requirements, newest first, with a null requirement id and this meeting id. The room SHALL NOT collapse a requirement's tasks.

#### Scenario: New requirement goes first
- **WHEN** the owner saves a requirement and the meeting already has an older requirement
- **THEN** the new requirement SHALL appear above the older one
- **AND** the composer SHALL remain above both

#### Scenario: New task goes first under its requirement
- **WHEN** the owner adds a task to a requirement that already has a task
- **THEN** the new task SHALL appear directly under that requirement, above the older task
- **AND** SHALL be indented under that requirement

#### Scenario: Loose task
- **WHEN** the owner saves a loose task
- **THEN** the task SHALL be stored with this meeting id and a null requirement id
- **AND** SHALL appear in the loose-task list, not under a requirement

#### Scenario: Empty agenda
- **WHEN** the meeting has no issues
- **THEN** the development act SHALL show an empty issue list
- **AND** SHALL NOT show the requirement composer

### Requirement: A meeting without a project cannot capture work
When the saved meeting has no project, the room SHALL still open and SHALL show context, the issue list, and close. It MUST NOT offer creating a requirement, a requirement task, or a loose task.

#### Scenario: No project
- **WHEN** the owner opens the room for a saved meeting with no project
- **THEN** the room SHALL show the context act
- **AND** SHALL NOT offer a requirement or task composer

### Requirement: Additional info is one meeting field
The issue frame and the close act SHALL show the same additional-info text. Committing an edit in either place SHALL update that one meeting field. A later open SHALL show the stored text. The edit SHALL NOT be written into `summary` or `lessons`. Blank text SHALL be stored as null.

#### Scenario: Edit in one issue, see it in another
- **WHEN** the owner commits additional info while one issue is open and then opens another issue
- **THEN** the other issue SHALL show the committed text

#### Scenario: Close shows the same text
- **WHEN** the owner opens the close act after committing additional info
- **THEN** the close act SHALL show that text
- **AND** `summary` and `lessons` SHALL be unchanged

### Requirement: The clock counts only while the room is open
While the room is open, the document is visible, and the meeting is not frozen, the clock SHALL advance. When the owner leaves the room, closes the page, or the document becomes hidden, the clock SHALL stop and SHALL keep the seconds accumulated while it was open. Time while stopped SHALL NOT be added. Opening the room again SHALL continue from those seconds. The clock SHALL be shown as hours, minutes, and seconds on every act.

#### Scenario: Leave and return
- **WHEN** the clock has been running, the owner leaves the room, waits, and opens the room again
- **THEN** the clock SHALL continue from the seconds accumulated before leaving
- **AND** SHALL NOT include the wait

#### Scenario: Hidden document
- **WHEN** the document becomes hidden while the clock is running and later becomes visible
- **THEN** the hidden interval SHALL NOT be added
- **AND** the clock SHALL continue from the seconds accumulated before it was hidden

### Requirement: Finalizar stores duration and stops the clock
**Finalizar** SHALL be available on the close act only when the meeting is not frozen. Activating it SHALL stop the clock and SHALL persist the accumulated open seconds as the meeting's `duration`. It MUST NOT set `executed`, `summary`, or `lessons`. After a successful finalize, the clock SHALL show that duration and SHALL NOT advance.

#### Scenario: Finish
- **WHEN** the owner activates **Finalizar** and the meeting is not frozen
- **THEN** the meeting's `duration` SHALL equal the accumulated open seconds
- **AND** `executed` SHALL stay false
- **AND** the clock SHALL show that duration and SHALL NOT advance

### Requirement: A finished or executed meeting only displays duration
The clock SHALL NOT start or advance when `executed` is true or when `duration` is already stored. The room SHALL show the stored `duration`. When `duration` is null, the room SHALL show zero seconds. **Finalizar** SHALL NOT be available. Opening the room MUST NOT add seconds.

#### Scenario: Executed meeting with a duration
- **WHEN** the owner opens the room for a meeting with `executed` true and a stored `duration`
- **THEN** the clock SHALL show that duration
- **AND** SHALL NOT advance
- **AND** **Finalizar** SHALL NOT be available

#### Scenario: Executed without a duration
- **WHEN** the owner opens the room for a meeting with `executed` true and a null `duration`
- **THEN** the clock SHALL show zero seconds
- **AND** SHALL NOT advance

#### Scenario: Already finalized
- **WHEN** the owner opens the room for a meeting whose `duration` is already stored and `executed` is false
- **THEN** the clock SHALL show that duration
- **AND** SHALL NOT advance
- **AND** **Finalizar** SHALL NOT be available

### Requirement: Next steps on close stay logs
The close act SHALL list the meeting's next steps. When the meeting has a project, the owner SHALL be able to add one. When the meeting has no project, the close act MUST NOT offer adding one. A next step SHALL be stored as a log born from the meeting, not as a task. Adding one SHALL keep the next steps already stored.

#### Scenario: Add a next step in the room
- **WHEN** the owner adds a next step on the close act of a meeting that has a project
- **THEN** that step SHALL be stored as a log whose join source is `meeting`
- **AND** SHALL NOT be stored as a task
- **AND** the next steps that were already stored SHALL remain

#### Scenario: No project
- **WHEN** the owner opens the close act of a meeting that has no project
- **THEN** the close act SHALL NOT offer a next-step composer
