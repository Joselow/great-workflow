## Purpose

One registry of keyboard commands so navigation and panel toggles stay in a single list, and the help view cannot drift from what the app actually runs.

## ADDED Requirements

### Requirement: One registry is the source of shortcuts
The application SHALL keep a single registry of keyboard commands. Each command MUST include a stable id, a Spanish description, the keys shown to the user, where it applies, and the action it performs. The listener and the shortcuts help MUST read this registry. A command that is not in the registry MUST NOT run. The application MUST NOT keep a second hardcoded list of the same shortcuts.

#### Scenario: Help and listener share the registry
- **WHEN** the user opens the shortcuts help
- **THEN** the modal SHALL list every command the listener can run
- **AND** SHALL NOT list a shortcut that the listener does not know

### Requirement: Shortcuts run only on the authenticated shell
Registered shortcuts SHALL run from one listener while the user is on an authenticated route. Login, register, and other routes that do not require authentication MUST NOT run them.

#### Scenario: Authenticated route
- **WHEN** the user is on an authenticated route and presses a registered shortcut outside a text field
- **THEN** the matching command SHALL run

#### Scenario: Guest route
- **WHEN** the user is on login, register, or a public page
- **THEN** registered shortcuts SHALL NOT navigate or toggle panels

### Requirement: Typing and extra modifiers do not trigger commands
The listener SHALL ignore a shortcut when focus is in an input, textarea, select, or editable element. The listener SHALL ignore a shortcut when Ctrl, Alt, or Meta is held. Letter commands MUST require Shift.

#### Scenario: Focus is in a field
- **WHEN** focus is in an input, textarea, select, or editable element and the user presses a registered shortcut
- **THEN** the command SHALL NOT run
- **AND** the key SHALL reach the field

#### Scenario: Extra modifier
- **WHEN** the user holds Ctrl, Alt, or Meta together with a registered shortcut
- **THEN** the command SHALL NOT run

### Requirement: Navigation and panel commands
The registry SHALL include these commands, and the listener SHALL perform them outside a text field on an authenticated route:

- Shift+C goes to Cards
- Shift+M goes to Meetings
- Shift+L goes to Logs
- Shift+P opens the project drawer when it is closed and closes it when it is open
- Shift+W toggles the Writer panel as specified for the writer
- Shift together with the `/` character toggles the shortcuts help

The `?` character MUST NOT match the help command.

#### Scenario: Go to Cards
- **WHEN** the user presses Shift+C outside a text field
- **THEN** the app SHALL show the Cards view

#### Scenario: Go to Meetings
- **WHEN** the user presses Shift+M outside a text field
- **THEN** the app SHALL show the Meetings view

#### Scenario: Go to Logs
- **WHEN** the user presses Shift+L outside a text field
- **THEN** the app SHALL show the Logs view

#### Scenario: Toggle the project drawer
- **WHEN** the user presses Shift+P outside a text field
- **THEN** the project drawer SHALL open if it is closed
- **AND** SHALL close if it is open

#### Scenario: Slash opens help
- **WHEN** the user presses Shift and the key produces `/`
- **THEN** the shortcuts help SHALL toggle

#### Scenario: Question mark is not the shortcut
- **WHEN** the user presses a key that produces `?`
- **THEN** the shortcuts help SHALL NOT toggle because of that character

### Requirement: The Logs plus command stays registered once
The registry SHALL include the existing Logs `+` command. It MUST remain the only listener for that action. Its effect MUST stay the one already required for the plus key on the log form: clear the selected log, move focus to the description field, leave the writer content unchanged, and do nothing while the user is typing in a field. The help view SHALL still list it when the user is on another authenticated view, and SHALL show that it applies on Logs.

#### Scenario: Plus on Logs with a log selected
- **WHEN** the log form is mounted, a log is selected, and the user presses `+` outside a text field
- **THEN** the selected log SHALL be cleared
- **AND** focus SHALL move to the description field
- **AND** the writer content SHALL remain unchanged

#### Scenario: Plus on another view
- **WHEN** the user is not on Logs and presses `+` outside a text field
- **THEN** the selected log SHALL NOT be cleared

### Requirement: Other commands wait while help is open
While the shortcuts help is open, the listener SHALL run only the help toggle and SHALL let Escape close the modal. Every other registered command MUST wait.

#### Scenario: Navigation while help is open
- **WHEN** the shortcuts help is open and the user presses Shift+C outside a text field
- **THEN** the app SHALL stay on the current view
- **AND** the help modal SHALL stay open
