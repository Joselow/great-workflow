## ADDED Requirements

### Requirement: Active project is stored globally
The application SHALL maintain a single globally accessible active project identifier that any authenticated view can read.

#### Scenario: Store exposes active project
- **WHEN** a component reads the project store
- **THEN** it SHALL receive the current active project id or null if none is selected

### Requirement: Active project persists across sessions
The application SHALL persist the active project id in browser localStorage and restore it on the next authenticated session.

#### Scenario: Restore on app load
- **WHEN** the user reloads the app and had a previously selected project that still exists on the server
- **THEN** that project SHALL become the active project automatically

#### Scenario: Stale persisted id
- **WHEN** the persisted project id no longer exists on the server
- **THEN** the active project SHALL be cleared
- **AND** the invalid id SHALL be removed from localStorage

### Requirement: Header displays active project context
The Header SHALL include a central slot that shows the active project's name and color, or a call-to-action when no project is selected.

#### Scenario: Project is active
- **WHEN** an active project exists
- **THEN** the Header SHALL display the project name
- **AND** SHALL visually indicate the project's selected color

#### Scenario: No project is active
- **WHEN** no active project is selected
- **THEN** the Header SHALL display clickable text inviting the user to select or create a project

#### Scenario: Open project panel from header
- **WHEN** the user clicks the header project slot
- **THEN** the project drawer SHALL open

### Requirement: Selecting a project updates global context
The application SHALL allow setting the active project from the project drawer.

#### Scenario: Select project
- **WHEN** the user confirms "Seleccionar proyecto" for a project
- **THEN** that project SHALL become the active project
- **AND** its id SHALL be saved to localStorage
