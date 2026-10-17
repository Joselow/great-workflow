## ADDED Requirements

### Requirement: Requerimientos and Tareas are registered navigation commands
The existing command registry SHALL include a command that goes to Requerimientos on Shift+R and a command that goes to Tareas on Shift+T. Each command MUST use that same registry, including its Spanish label, its keys, and its action. The application MUST NOT add a second global key listener for these two shortcuts. They MUST follow the registry rules that already ignore typing targets, Ctrl, Alt, and Meta, guest routes, and every command other than help while the shortcuts help is open.

#### Scenario: Go to Requerimientos
- **WHEN** the user presses Shift+R outside a text field on an authenticated route
- **THEN** the app SHALL show `/requirements`

#### Scenario: Go to Tareas
- **WHEN** the user presses Shift+T outside a text field on an authenticated route
- **THEN** the app SHALL show `/tasks`

#### Scenario: Typing blocks both
- **WHEN** focus is in an input, textarea, select, or editable element and the user presses Shift+R or Shift+T
- **THEN** the app SHALL stay on the current view
- **AND** the key SHALL reach the field

#### Scenario: Help lists both
- **WHEN** the user opens the shortcuts help
- **THEN** the list SHALL include the Requerimientos command and the Tareas command
- **AND** SHALL show **Mayús** with **R** and **Mayús** with **T**
