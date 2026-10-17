# tasks-view Specification

## Purpose
The tasks page for the active project: create, edit, complete, and delete tasks, and narrow them by done state and by requirement.

## Requirements

### Requirement: The page lists the active project's tasks
The authenticated route `/tasks` SHALL show a create form above the list of the active project's tasks, newest first. The list SHALL load when the page opens and SHALL load again when the active project id changes. A loader SHALL be visible while that fetch is in flight. When the current filters match nothing, the page SHALL show an empty state. When no active project is selected, the page SHALL NOT submit a create and SHALL NOT request a list without a project.

#### Scenario: Open with a project
- **WHEN** the owner opens **Tareas** with an active project that has tasks
- **THEN** the form SHALL sit above the rows
- **AND** the rows SHALL be that project's tasks, newest first

#### Scenario: Switch project
- **WHEN** the active project id changes while the page is open
- **THEN** the list SHALL show the new project's tasks
- **AND** the requirement filter choices SHALL be that project's requirements

#### Scenario: Nothing matches
- **WHEN** the active project has no tasks for the current filters
- **THEN** the page SHALL show an empty state in Spanish

### Requirement: Filters are status and requirement
The page SHALL offer a status filter with the labels **Todas**, **Pendientes**, and **Hechas**, and a requirement filter with **Todos**, **Sin requerimiento**, and one entry for each requirement of the active project. **Todas** shows done and not done. **Pendientes** shows completed false. **Hechas** shows completed true. **Todos** does not filter by requirement. **Sin requerimiento** shows only tasks with no requirement. Choosing one requirement shows only that requirement's tasks. Changing a filter SHALL update the list to that set.

#### Scenario: Only pending
- **WHEN** the owner chooses **Pendientes**
- **THEN** the list SHALL show tasks that are not completed
- **AND** SHALL NOT show a completed task

#### Scenario: Only done
- **WHEN** the owner chooses **Hechas**
- **THEN** every visible task SHALL be completed

#### Scenario: Without a requirement
- **WHEN** the owner chooses **Sin requerimiento**
- **THEN** every visible task SHALL have no requirement
- **AND** a task linked to a requirement SHALL NOT be visible

#### Scenario: One requirement
- **WHEN** the owner chooses one requirement by its name
- **THEN** every visible task SHALL belong to that requirement

### Requirement: The description is a muted second line
The form SHALL include the description. On each row the description SHALL appear as a muted second line under the name, not as its own wide column. An empty description SHALL NOT add that line.

#### Scenario: Row with a description
- **WHEN** a task has a description
- **THEN** the row SHALL show the name
- **AND** SHALL show the description in muted text under the name

#### Scenario: Row without a description
- **WHEN** a task's description is empty
- **THEN** the row SHALL show the name
- **AND** SHALL NOT show an empty description line

### Requirement: The row completes the task without opening the form
Each row SHALL offer a control that flips `completed`. That action SHALL send the new value without opening the form. The row SHALL show the new state after success. A loading state SHALL be visible on that action until the request finishes, and a second toggle on that row MUST NOT start while it is in flight.

#### Scenario: Mark a pending task done
- **WHEN** the owner activates the complete control on a task that is not completed
- **THEN** the form SHALL stay closed
- **AND** the row SHALL show the task as done after the request succeeds

#### Scenario: Mark a done task pending
- **WHEN** the owner activates the complete control on a completed task
- **THEN** the row SHALL show the task as not done after the request succeeds

### Requirement: Create and edit use the active project
A new task SHALL use the active project. The requirement selector SHALL be optional and SHALL list only the active project's requirements. Pressing Enter in the name field SHALL save when the name is not blank. Pressing Enter in the description SHALL insert a newline and MUST NOT save. A blank name MUST NOT be submitted. Selecting a row SHALL fill the form with that task's name, description, completed flag, and requirement. Saving SHALL update that task. A loader SHALL be visible while a save is in flight, and a second submit MUST NOT start.

#### Scenario: Create with Enter on the name
- **WHEN** the owner types a name and presses Enter in the name field
- **THEN** the page SHALL create the task on the active project
- **AND** the new row SHALL appear

#### Scenario: Enter in the description
- **WHEN** the owner presses Enter in the description
- **THEN** the page SHALL NOT save
- **AND** the description SHALL keep a new line

#### Scenario: Leave the requirement empty
- **WHEN** the owner saves a task with no requirement selected
- **THEN** the stored requirement id SHALL be null

#### Scenario: Pick a requirement
- **WHEN** the owner saves a task with one of the active project's requirements selected
- **THEN** the task SHALL be stored with that requirement
- **AND** its project and meeting SHALL follow that requirement

### Requirement: Delete asks first
Delete SHALL open a confirm dialog before removing the task. Confirming SHALL remove the row. Cancelling SHALL leave the row.

#### Scenario: Confirm delete
- **WHEN** the owner confirms **¿Eliminar esta tarea?**
- **THEN** that task SHALL disappear from the list

#### Scenario: Cancel delete
- **WHEN** the owner cancels the dialog
- **THEN** the task SHALL remain in the list

### Requirement: Below the medium breakpoint the page is one column
Below the `md` breakpoint the form SHALL stack above the list, filters and row actions SHALL wrap, and a closed writer SHALL NOT cover the page or make it wider than the viewport. The page SHALL use a flat surface, a thin border, a small radius, material icons, and a brand-orange primary action.

#### Scenario: Narrow viewport
- **WHEN** the viewport is below `md`
- **THEN** the form SHALL be above the list in a single column
- **AND** the filters SHALL wrap
- **AND** a closed writer SHALL leave the list usable
