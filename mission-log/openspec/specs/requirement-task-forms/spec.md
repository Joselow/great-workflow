# requirement-task-forms Specification

## Purpose
One requirement form, one task form, and one task list, shared by the project pages and the meeting page, so those screens do not each grow their own fields or their own HTTP calls.

## Requirements

### Requirement: The requirement form edits a name and does not call the API
The requirement form SHALL bind its draft to the parent and SHALL emit save. It MUST NOT perform an HTTP request. It SHALL show a name field and SHALL NOT show a project control or a meeting control. The parent supplies the project and meeting context. Pressing Enter in the name field SHALL emit save.

#### Scenario: Enter emits save
- **WHEN** the parent renders the requirement form and the owner presses Enter in the name field
- **THEN** the form SHALL emit save
- **AND** the form SHALL NOT have called the API

#### Scenario: No project picker
- **WHEN** the requirement form is visible
- **THEN** it SHALL show the name
- **AND** SHALL NOT show a control that edits the project or the meeting

### Requirement: The task form edits name, description, and completed, and does not call the API
The task form SHALL bind its draft to the parent and SHALL emit save. It MUST NOT perform an HTTP request. It SHALL show the name, the description, and the completed flag. Pressing Enter in the name field SHALL emit save. Pressing Enter in the description SHALL NOT emit save.

#### Scenario: Enter on the name
- **WHEN** the owner presses Enter in the task name
- **THEN** the form SHALL emit save
- **AND** the form SHALL NOT have called the API

#### Scenario: Enter in the description
- **WHEN** the owner presses Enter in the description
- **THEN** the form SHALL NOT emit save

### Requirement: A locked requirement hides the selector
When the parent marks the requirement as locked, the task form SHALL hide the requirement selector. The parent MUST supply the requirement id. The form MUST NOT offer a way to pick a different requirement.

#### Scenario: Opened under a requirement
- **WHEN** the parent passes a locked requirement
- **THEN** the task form SHALL NOT show a requirement selector
- **AND** the draft requirement id SHALL be the one the parent supplied

### Requirement: An unlocked selector is optional and uses the parent's list
When the parent does not lock the requirement, the task form SHALL show an optional requirement selector. The options SHALL be exactly the requirements the parent passed, plus an empty choice. The form MUST NOT fetch that list itself.

#### Scenario: Opened from tasks
- **WHEN** the parent passes the active project's requirements and does not lock one
- **THEN** the selector SHALL list those requirements and an empty choice
- **AND** SHALL NOT list a requirement the parent did not pass

#### Scenario: Empty choice
- **WHEN** the owner leaves the empty choice selected and the parent saves
- **THEN** the draft requirement id SHALL be null

### Requirement: The task list emits complete, edit, and delete
The task list and each row SHALL render the tasks the parent passed. A row SHALL emit complete, edit, and delete. Complete MUST NOT open the form. The list MUST NOT perform an HTTP request. The parent performs the save, the completed update, and the delete.

#### Scenario: Complete stays on the row
- **WHEN** the owner activates complete on a row
- **THEN** the list SHALL emit complete for that task
- **AND** SHALL NOT open the form
- **AND** SHALL NOT have called the API

#### Scenario: Edit and delete go upward
- **WHEN** the owner activates edit or delete on a row
- **THEN** the list SHALL emit that action for that task
- **AND** SHALL NOT have called the API

### Requirement: The project pages and the meeting page use these components
The requirements page, the tasks page, and the meeting embed SHALL use this requirement form, this task form, and this task list for creating, editing, completing, and deleting. They MUST NOT keep a second copy of those fields or of the row actions.

#### Scenario: Same fields on the meeting
- **WHEN** the owner creates a requirement or a task on the meeting page
- **THEN** the fields SHALL be the shared form
- **AND** the page SHALL NOT show a separate requirement name field of its own
