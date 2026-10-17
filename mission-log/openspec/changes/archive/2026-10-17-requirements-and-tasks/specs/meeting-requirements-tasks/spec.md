## Purpose

On a saved meeting that already has a project, the owner can add requirements and tasks for that meeting. The agenda, issues, next steps, qualification, and cards stay as they are.

## ADDED Requirements

### Requirement: The blocks appear only for a saved meeting with a project
When the meeting form is editing a meeting that already has an id and a project, the form SHALL show a requirements block and a tasks block for that meeting. When the meeting has not been saved yet, those blocks MUST NOT be shown. When the saved meeting has no project, those blocks MUST NOT be shown and the form MUST NOT offer a way to create a requirement or a task from it. Create SHALL use that meeting's id and that meeting's project id. Those two values MUST NOT be a second editable control.

#### Scenario: Saved meeting with a project
- **WHEN** the owner opens a saved meeting that has a project
- **THEN** the form SHALL show the requirements of that meeting
- **AND** SHALL show the tasks of that meeting

#### Scenario: New meeting
- **WHEN** the owner is on the create-meeting form and the meeting has no id yet
- **THEN** the form SHALL NOT show the requirements block
- **AND** SHALL NOT show the tasks block

#### Scenario: Saved meeting without a project
- **WHEN** the owner opens a saved meeting whose project is empty
- **THEN** the form SHALL NOT offer **Requerimientos** or **Tareas** for that meeting

### Requirement: Requirements of this meeting use the shared form
The requirements block SHALL list requirements that have this meeting's id and this meeting's current project id, newest first. A requirement that kept an older project id after the meeting moved stays on that project's requirements page and is not shown here. The shared requirement form SHALL create and rename them with this meeting's id and this meeting's project id. Selecting a requirement SHALL show its tasks with the shared task list, and the task form SHALL hide the requirement selector and SHALL save tasks for that requirement. An empty list SHALL show an empty state in Spanish.

#### Scenario: Add a requirement on the meeting
- **WHEN** the owner saves a name from the meeting's requirement form
- **THEN** the new requirement SHALL belong to this meeting and this meeting's project
- **AND** SHALL appear in the meeting's requirement list

#### Scenario: Add a task under that requirement
- **WHEN** the owner selects that requirement and saves a task
- **THEN** the task form SHALL NOT show a requirement selector
- **AND** the task SHALL be stored with that requirement
- **AND** its meeting id SHALL be this meeting

### Requirement: Meeting tasks are the tasks of this meeting
The tasks block SHALL list tasks that have this meeting's id and this meeting's current project id, newest first. A task that kept an older project id after the meeting moved stays on that project's tasks page and is not shown here. The shared task form SHALL create a task for this meeting. Its requirement selector SHALL be optional and SHALL list only requirements of this meeting, plus an empty choice. It MUST NOT list a requirement from another meeting or a requirement with no meeting. Choosing empty SHALL store a null requirement id and SHALL keep this meeting id. An empty list SHALL show an empty state in Spanish.

#### Scenario: Task with no requirement
- **WHEN** the owner saves a task on the meeting with the empty requirement choice
- **THEN** the task's meeting id SHALL be this meeting
- **AND** the requirement id SHALL be null
- **AND** the project id SHALL be this meeting's project

#### Scenario: Selector stays inside the meeting
- **WHEN** the project also has a requirement that belongs to another meeting or to no meeting
- **THEN** the meeting's task form SHALL NOT offer that requirement

### Requirement: A change in one block is visible in the other
A task created, completed, edited, or deleted under a selected requirement SHALL show that same result in the meeting's task list, and the reverse SHALL hold. Both blocks SHALL refresh from the successful response without a second source of truth.

#### Scenario: Complete under the requirement
- **WHEN** the owner marks a task done under the selected requirement and that task belongs to this meeting
- **THEN** the meeting's task list SHALL show that task as done

### Requirement: The blocks sit outside the existing meeting columns
The requirements block and the tasks block SHALL render after the existing two-column meeting form. The left column SHALL keep this order: the title as text, the objective, the current status, the title as an input, the agenda, the next steps, the estimated time, the participants, and the date and time. Cards, summary, lessons, and the qualify action SHALL remain on the right. Saving the meeting MUST NOT send requirements or tasks inside the meeting payload. Those rows save only through their own forms.

#### Scenario: Meeting save ignores the new rows
- **WHEN** the owner saves the meeting after adding a requirement
- **THEN** the meeting request SHALL NOT include that requirement as an agenda item, an issue, or a next step
- **AND** the requirement SHALL still be stored from its own save

#### Scenario: Left column order
- **WHEN** the owner looks at the left column of a meeting that shows the new blocks
- **THEN** the date and time SHALL still sit below the participants
- **AND** the next steps SHALL still sit below the agenda

### Requirement: Agenda, issues, next steps, qualification, and cards stay
This change MUST NOT change the agenda editor, the issues list, the next-steps list, qualification, or the cards panel. Next steps SHALL remain logs. Issues SHALL NOT be linked to a requirement or a task. Deleting the meeting from this form SHALL still be the meeting delete, which detaches requirements and tasks instead of deleting them.

#### Scenario: Next steps are still logs
- **WHEN** the owner adds a next step and saves the meeting
- **THEN** that step SHALL still be stored as a log
- **AND** SHALL NOT be stored as a task

#### Scenario: Issues stay on the meeting
- **WHEN** the owner edits the agenda and the issues and saves
- **THEN** those controls SHALL behave as they did before this change
- **AND** the save SHALL NOT write an issue id onto a requirement or a task
