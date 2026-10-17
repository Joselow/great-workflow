# requirements-view Specification

## Purpose
The requirements page for the active project: a name field that saves on Enter, a list under it, and the tasks of the requirement the owner selects.

## Requirements

### Requirement: The page lists the active project's requirements
The authenticated route `/requirements` SHALL show a create form above the list of the active project's requirements, newest first. The list SHALL load when the page opens and SHALL load again when the active project id changes. A loader SHALL be visible while that fetch is in flight. When the project has no requirements, the page SHALL show an empty state. When no active project is selected, the page SHALL NOT submit a create and SHALL NOT request a list without a project.

#### Scenario: Open with a project
- **WHEN** the owner opens **Requerimientos** with an active project that has requirements
- **THEN** the form SHALL sit above the rows
- **AND** the rows SHALL be that project's requirements, newest first

#### Scenario: Switch project
- **WHEN** the active project id changes while the page is open
- **THEN** the list SHALL show the new project's requirements
- **AND** SHALL NOT keep rows from the previous project

#### Scenario: Nothing saved yet
- **WHEN** the active project has no requirements
- **THEN** the page SHALL show an empty state in Spanish

### Requirement: Enter saves a name for the active project
The form SHALL offer a name field and nothing else for the requirement. Pressing Enter in that field SHALL save. The new requirement SHALL use the active project and a null meeting. A blank name MUST NOT be submitted. While the save is in flight, a loader SHALL be visible and a second submit MUST NOT start. After a successful create, the new row SHALL appear and the name field SHALL be cleared.

#### Scenario: Save with Enter
- **WHEN** the owner types a name and presses Enter
- **THEN** the page SHALL create the requirement on the active project
- **AND** the new row SHALL appear in the list
- **AND** the name field SHALL be empty

#### Scenario: Enter on an empty name
- **WHEN** the name is empty or only whitespace and the owner presses Enter
- **THEN** the page SHALL NOT create a requirement

### Requirement: Selecting a row edits the name
Selecting a requirement SHALL fill the name field with that requirement's name. Saving SHALL update that requirement's name and SHALL leave its project and meeting unchanged. The selected row SHALL show the new name after a successful save.

#### Scenario: Rename from the form
- **WHEN** the owner selects a row, changes the name, and saves
- **THEN** that row SHALL show the new name
- **AND** the requirement SHALL remain on the same project and meeting

### Requirement: Delete asks first and keeps the tasks
Delete SHALL open a confirm dialog before removing the requirement. The dialog SHALL tell the owner that the tasks are kept. Confirming SHALL remove the requirement from the list. Cancelling SHALL leave the requirement in the list.

#### Scenario: Confirm delete
- **WHEN** the owner confirms **¿Eliminar este requerimiento?**
- **THEN** that requirement SHALL disappear from the list
- **AND** the dialog SHALL have stated that the tasks remain

#### Scenario: Cancel delete
- **WHEN** the owner cancels the dialog
- **THEN** the requirement SHALL remain in the list

### Requirement: The selected requirement shows its tasks
While a requirement is selected, the page SHALL show that requirement's tasks with the shared task list and task form. The task form SHALL NOT show a requirement selector. A task saved there SHALL belong to the selected requirement. Completing, editing, and deleting those tasks SHALL be available there. When no requirement is selected, that task block SHALL NOT be shown.

#### Scenario: Open a requirement's tasks
- **WHEN** the owner selects a requirement that has tasks
- **THEN** those tasks SHALL appear on the page
- **AND** the task form SHALL NOT ask for a requirement

#### Scenario: Add a task here
- **WHEN** the owner saves a task from the selected requirement
- **THEN** the task SHALL be stored with that requirement id
- **AND** SHALL appear in the task list under it

### Requirement: Below the medium breakpoint the page is one column
Below the `md` breakpoint the form SHALL stack above the list, and row actions SHALL wrap instead of overflowing the viewport. The closed writer SHALL NOT cover the page and SHALL NOT make the page wider than the viewport. The page SHALL use a flat surface, a thin border, a small radius, material icons, and a brand-orange primary action, in the same family as meetings and cards.

#### Scenario: Narrow viewport
- **WHEN** the viewport is below `md`
- **THEN** the form SHALL be above the list in a single column
- **AND** the row actions SHALL wrap
- **AND** a closed writer SHALL leave the list usable
