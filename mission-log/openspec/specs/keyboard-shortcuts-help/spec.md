## Purpose

A documentation modal that lists every registered keyboard command in Spanish, so navigation is discoverable without a second shortcut list.

## Requirements

### Requirement: Help is a lazy modal on the current page
The shortcuts help SHALL be a modal over the authenticated shell. It MUST NOT be its own route. The help UI MUST NOT load until the first time the user opens it. Opening it MUST leave the current route unchanged.

#### Scenario: First open
- **WHEN** the user opens the shortcuts help for the first time
- **THEN** the modal SHALL appear over the current page
- **AND** the route SHALL stay the same

#### Scenario: Open again
- **WHEN** the user opens the shortcuts help after it has been opened once
- **THEN** the same modal SHALL appear without changing the route

### Requirement: Shift and slash toggles the modal
Shift together with the `/` character SHALL open the modal when it is closed and close it when it is open. Escape SHALL close it. Activating the backdrop SHALL close it. The `?` character MUST NOT open or close it.

#### Scenario: Open with slash
- **WHEN** the modal is closed and the user presses Shift and the key produces `/` outside a text field
- **THEN** the modal SHALL open

#### Scenario: Close with slash
- **WHEN** the modal is open and the user presses Shift and the key produces `/`
- **THEN** the modal SHALL close

#### Scenario: Close with Escape
- **WHEN** the modal is open and the user presses Escape
- **THEN** the modal SHALL close

#### Scenario: Question mark does nothing
- **WHEN** the user presses a key that produces `?`
- **THEN** the modal SHALL NOT open or close because of that character

### Requirement: The modal is Spanish documentation from the registry
The modal SHALL list every registered command in Spanish, grouped by purpose: navigation, panels, Logs, and this help view. Each row MUST show the description and the key combination, with Shift labeled **Mayús**. The `+` row MUST show that it applies on Logs. There MUST be no search field. Activating a row MUST NOT run the command. Visible copy in the modal MUST be Spanish.

#### Scenario: Plain directory
- **WHEN** the user opens the shortcuts help
- **THEN** the modal SHALL show the registered commands as readable text
- **AND** SHALL NOT show a search field

#### Scenario: Row does not run the command
- **WHEN** the user activates a command row
- **THEN** the app SHALL NOT navigate or toggle a panel from that activation
- **AND** the modal SHALL stay open

#### Scenario: Logs scope is visible
- **WHEN** the user opens the shortcuts help from a view other than Logs
- **THEN** the `+` command SHALL still be listed
- **AND** the row SHALL show that it applies on Logs

### Requirement: The header can open the same modal
The authenticated header SHALL include a control named **Atajos de teclado** that opens this modal. It MUST open the same modal as Shift+/.

#### Scenario: Open from the header
- **WHEN** the user activates **Atajos de teclado** in the header
- **THEN** the shortcuts help SHALL open over the current page

### Requirement: The modal stays usable on a small screen
On a narrow viewport the modal SHALL fit the screen and its command list SHALL scroll when the content is taller than the viewport. The page underneath MUST NOT be required to scroll in order to read the list.

#### Scenario: Narrow viewport
- **WHEN** the viewport is below the medium breakpoint and the user opens the shortcuts help
- **THEN** the modal SHALL remain on screen
- **AND** the command list SHALL scroll inside the modal
