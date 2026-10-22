## MODIFIED Requirements

### Requirement: Selecting a row edits the name
Selecting a requirement SHALL fill the name field with that requirement's name. Saving SHALL update that requirement's name and SHALL leave its project and meeting unchanged. The selected row SHALL show the new name after a successful save. Activating **Tareas** SHALL NOT fill the name field.

#### Scenario: Rename from the form
- **WHEN** the owner selects a row, changes the name, and saves
- **THEN** that row SHALL show the new name
- **AND** the requirement SHALL remain on the same project and meeting

#### Scenario: Tareas does not rename
- **WHEN** the owner activates **Tareas** on a requirement
- **THEN** the name field SHALL stay as it was

### Requirement: The selected requirement shows its tasks
Activating **Tareas** on a requirement SHALL open a modal for that requirement. This modal SHALL be available only on the requirements page. The tasks page SHALL remain its own page and SHALL NOT open this modal. The requirement list SHALL stay on the page and SHALL NOT render the task form or the task list outside the modal. The modal SHALL show that requirement's name. It SHALL show the shared task form and the shared task list, with the status filters **Todos**, **Pendientes**, and **Completadas**. **Todos** shows done and not done. **Pendientes** shows completed false. **Completadas** shows completed true. The modal SHALL NOT show a requirement filter or a requirement selector. A task saved there SHALL belong to that requirement and to the active project. Completing, editing, and deleting those tasks SHALL be available in the modal. From `md` up, the form SHALL sit beside the list. Below `md`, the form SHALL stack above the list inside the modal. Closing the modal SHALL leave the requirement in the list. Changing the active project SHALL close the modal.

#### Scenario: Open a requirement's tasks
- **WHEN** the owner activates **Tareas** on a requirement that has tasks
- **THEN** a modal SHALL open showing that requirement's name
- **AND** those tasks SHALL appear in the modal
- **AND** the task form SHALL NOT ask for a requirement
- **AND** the page behind the modal SHALL NOT show a task list

#### Scenario: Add a task here
- **WHEN** the owner saves a task from the modal
- **THEN** the task SHALL be stored with that requirement id
- **AND** SHALL belong to the active project
- **AND** SHALL appear in the modal list

#### Scenario: Only pending
- **WHEN** the owner chooses **Pendientes** in the modal
- **THEN** the list SHALL show tasks of that requirement that are not completed
- **AND** SHALL NOT show a completed task of that requirement

#### Scenario: Close the modal
- **WHEN** the owner closes the modal
- **THEN** the requirement SHALL remain in the list
- **AND** the task form and the task list SHALL NOT remain on the page

#### Scenario: Switch project
- **WHEN** the active project id changes while the modal is open
- **THEN** the modal SHALL close
- **AND** the list SHALL show the new project's requirements
