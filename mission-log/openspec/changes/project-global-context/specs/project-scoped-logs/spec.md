## ADDED Requirements

### Requirement: Logs are listed for the active project only
The application SHALL fetch and display logs belonging only to the currently active project.

#### Scenario: Load logs with active project
- **WHEN** an active project is set and the logs view loads
- **THEN** the application SHALL request logs filtered by that project's id
- **AND** SHALL display only those logs

#### Scenario: Reload on project change
- **WHEN** the user selects a different active project
- **THEN** the logs list SHALL reload for the new project
- **AND** any selected log in the form SHALL be cleared

### Requirement: New logs belong to the active project
Creating a log SHALL associate it with the active project's id.

#### Scenario: Create log
- **WHEN** the user creates a log and an active project is set
- **THEN** the create request SHALL include the active project's id
- **AND** the new log SHALL appear in the current project's list

### Requirement: Logs require an active project for creation
Creating a log SHALL require an active project, but listing logs SHALL remain available without one.

#### Scenario: No active project
- **WHEN** no active project is selected
- **THEN** the application SHALL still fetch and display logs
- **AND** SHALL show a prompt when the user attempts to create a log
- **AND** SHALL direct the user to select or create a project
