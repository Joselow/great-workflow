## ADDED Requirements

### Requirement: Execution room changes act with the arrow keys
The registry SHALL include one command for ArrowLeft and one command for ArrowRight. Each command MUST include a stable id, a Spanish description, the key shown to the user, a scope limited to the meeting execution room, and the action it performs. Outside that room these commands MUST NOT change the route and MUST NOT change an act. Inside the room, ArrowLeft SHALL move to the previous act and ArrowRight SHALL move to the next act, the same acts the on-screen arrows already reach. On the first act, ArrowLeft SHALL leave the act unchanged. On the last act, ArrowRight SHALL leave the act unchanged. These commands MUST follow the existing rules that ignore a shortcut while focus is in an input, textarea, select, or editable element, while Ctrl, Alt, or Meta is held, on a guest route, and for every command other than the help toggle while the shortcuts help is open. While a dialog is open they MUST NOT change the act.

#### Scenario: Next act
- **WHEN** the owner is in the execution room on the first act, focus is not in a field, and presses ArrowRight
- **THEN** the room SHALL show the development act

#### Scenario: Previous act
- **WHEN** the owner is in the execution room on the close act, focus is not in a field, and presses ArrowLeft
- **THEN** the room SHALL show the development act

#### Scenario: First act has no previous act
- **WHEN** the owner is on the first act and presses ArrowLeft outside a field
- **THEN** the room SHALL stay on the first act

#### Scenario: Typing in a field
- **WHEN** focus is in an input or textarea in the execution room and the owner presses ArrowLeft or ArrowRight
- **THEN** the act SHALL NOT change
- **AND** the key SHALL reach the field

#### Scenario: Another authenticated page
- **WHEN** the owner is on an authenticated page other than the execution room and presses ArrowLeft or ArrowRight
- **THEN** the command SHALL NOT navigate

#### Scenario: Shortcuts help is open
- **WHEN** the shortcuts help is open and the owner presses ArrowRight
- **THEN** the execution room act SHALL NOT change
