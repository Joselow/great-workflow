## ADDED Requirements

### Requirement: Project drawer lists user projects
The application SHALL provide a left-side panel that lists all projects belonging to the authenticated user, each showing its name and color.

#### Scenario: Open drawer
- **WHEN** the user opens the project panel from the Header
- **THEN** the panel SHALL display the list of projects
- **AND** SHALL remain open until explicitly closed or after selecting a project

#### Scenario: Empty project list
- **WHEN** the user has no projects
- **THEN** the panel SHALL show an empty state with an option to create a project

### Requirement: Project create and edit use dedicated routes
Creating or editing a project SHALL happen in a dedicated main view route, not inside the left panel.

#### Scenario: Start new project
- **WHEN** the user clicks the create button in the left panel
- **THEN** the application SHALL navigate to a new project form view
- **AND** the left panel SHALL remain visible listing projects

#### Scenario: Edit existing project
- **WHEN** the user clicks a project in the left panel
- **THEN** the application SHALL navigate to that project's edit form view
- **AND** the selected project SHALL be highlighted in the left panel

#### Scenario: New project title preview while creating
- **WHEN** the user types a project name in the create form view
- **THEN** the left panel list SHALL reflect the current title in real time
- **AND** this live title preview SHALL apply only during project creation, not during edit

### Requirement: Project fields auto-save
Project name, optional description, and color SHALL be saved automatically as the user edits them in the form view.

#### Scenario: Auto-save name
- **WHEN** the user changes the project name in the form view
- **THEN** the change SHALL be persisted to the backend after a short debounce without requiring a manual save button

#### Scenario: Auto-save description and color
- **WHEN** the user changes the description or color in the form view
- **THEN** the change SHALL be persisted to the backend after a short debounce

#### Scenario: Default color on create
- **WHEN** a new project is created
- **THEN** it SHALL start with a neutral default color until the user selects another

### Requirement: Closing the project panel does not navigate away
Closing the left project panel SHALL only hide the panel and SHALL NOT change the current route or clear the in-progress form.

#### Scenario: Close panel while editing
- **WHEN** the user closes the project panel with the close control
- **THEN** the panel SHALL hide
- **AND** the current route and form content SHALL remain unchanged

### Requirement: Select project returns to previous context
The project form view SHALL provide a "Seleccionar proyecto" action that sets the active project, closes the left panel, and navigates back.

#### Scenario: Confirm selection
- **WHEN** the user clicks "Seleccionar proyecto"
- **THEN** the edited project SHALL become the active global project
- **AND** the left panel SHALL close
- **AND** the user SHALL return to the route they were on before opening the panel

### Requirement: Project auto-save does not loop
Saving a project draft SHALL persist changes only when the draft values actually changed since the last successful save.

#### Scenario: No duplicate save after successful update
- **WHEN** a project save completes successfully with the same values still in the form
- **THEN** the application SHALL NOT send another save request for those unchanged values
