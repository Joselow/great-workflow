## ADDED Requirements

### Requirement: Writer panel toggles from the keyboard
On an authenticated route, Shift+W SHALL flip the Writer panel's expanded state the same way as activating the Writer tab: expand it when it is collapsed, and collapse it when it is expanded, whether or not the panel has content. The shortcut MUST NOT change the writer text. It MUST NOT run while focus is in a text field, and MUST NOT run while the shortcuts help is open. Click and double-click on the Writer tab SHALL keep toggling the same state.

#### Scenario: Open from the keyboard
- **WHEN** the Writer panel is collapsed and the user presses Shift+W outside a text field
- **THEN** the panel SHALL expand
- **AND** the writer text SHALL remain unchanged

#### Scenario: Close from the keyboard
- **WHEN** the Writer panel is expanded and the user presses Shift+W outside a text field
- **THEN** the panel SHALL collapse
- **AND** the writer text SHALL remain unchanged

#### Scenario: Typing a capital W
- **WHEN** focus is in a text field and the user presses Shift+W
- **THEN** the expanded state SHALL NOT change

#### Scenario: Help is open
- **WHEN** the shortcuts help is open and the user presses Shift+W outside a text field
- **THEN** the expanded state SHALL NOT change
