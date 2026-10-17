## Purpose

TBD

## Requirements

### Requirement: Writer text is bound directly to the shared store
`SideBarText` SHALL bind its textarea directly to the shared writer store's value via `v-model`, without an intermediate local copy or a prop-based synchronization mechanism.

#### Scenario: Typing updates the global store immediately
- **WHEN** the user types in the SideBarText textarea
- **THEN** the shared writer store's value SHALL update immediately
- **AND** any other reader of the store SHALL observe the same value without a page refresh

### Requirement: Panel expansion is owned by the writer store
The writer store SHALL own the panel's expanded/collapsed state. `SideBarText` SHALL NOT use a `watch` over an external prop to derive this state.

#### Scenario: A store mutation introduces new content
- **WHEN** the store's set or append content method is called with non-empty text
- **THEN** the panel's expanded state SHALL become `true`

#### Scenario: User manually toggles the panel
- **WHEN** the user double-clicks or clicks the toggle tab
- **THEN** the expanded state SHALL flip to the opposite of its current value, regardless of whether there is content

### Requirement: User can copy the writer content to the clipboard
`SideBarText` SHALL provide a button that copies the full current writer content to the system clipboard.

#### Scenario: Successful copy
- **WHEN** the user clicks the copy button and the writer has content
- **THEN** the content SHALL be written to the system clipboard
- **AND** a success confirmation SHALL be shown to the user

#### Scenario: Copy attempted with empty content
- **WHEN** the user clicks the copy button and the writer is empty
- **THEN** no clipboard write SHALL occur
- **AND** an informational message SHALL indicate there is nothing to copy

### Requirement: Content can be appended instead of overwritten
The writer store SHALL expose a method that appends new text to the existing content instead of only supporting a full overwrite.

#### Scenario: Appending to empty content
- **WHEN** the append method is called and the current content is empty
- **THEN** the new text SHALL become the entire content

#### Scenario: Appending to existing content
- **WHEN** the append method is called and the current content is non-empty
- **THEN** the new text SHALL be added after the existing content
- **AND** the existing and new content SHALL be separated by a `---` divider on its own line

### Requirement: Component supports multiple content formats
`SideBarText` SHALL support a format identifier describing how its content should be treated, defaulting to plain text, with markdown as an additional supported value, in a way that allows further formats to be added later without changing the existing contract. The format SHALL be settable by whichever writer-store mutation call provides the content (not passed in as a component prop), consistent with the component sourcing all of its state from the shared writer store.

#### Scenario: Default format
- **WHEN** no format is specified
- **THEN** the component SHALL behave exactly as plain text, matching prior behavior

#### Scenario: Markdown format is active
- **WHEN** the format is set to markdown
- **THEN** the component SHALL visually distinguish itself (for example, an accent color) to indicate markdown mode is active
- **AND** the content SHALL remain an editable plain-text textarea for this iteration, not rendered HTML

### Requirement: Layout is responsive on small viewports
`SideBarText` SHALL remain usable on small viewports and SHALL NOT cover the page when collapsed. Below the medium breakpoint it SHALL be a bottom sheet anchored to the bottom edge: collapsed, only the Writer tab is visible; one activation SHALL expand the sheet to 80% of the viewport height; the same activation SHALL collapse it again. The page behind a collapsed sheet SHALL remain scrollable and tappable. At or above the medium breakpoint the panel SHALL stay a right rail, thin when collapsed and a writing column when expanded. A collapsed rail SHALL NOT make the page wider than the viewport. Writer text SHALL scroll inside the panel.

#### Scenario: Small viewport
- **WHEN** the viewport width is below the medium breakpoint and the writer is collapsed
- **THEN** the panel SHALL be a bottom tab instead of a fixed-width side rail
- **AND** the main route content SHALL remain accessible

#### Scenario: Small viewport collapsed
- **WHEN** the viewport is below the medium breakpoint and the writer is collapsed
- **THEN** only the Writer tab SHALL be visible, fixed to the bottom edge
- **AND** the route content SHALL remain scrollable and tappable

#### Scenario: Small viewport expanded
- **WHEN** the user activates the Writer tab on a small viewport
- **THEN** the panel SHALL grow from the bottom to 80% of the viewport height
- **AND** a second activation SHALL return it to the tab

#### Scenario: Large viewport
- **WHEN** the viewport is at or above the medium breakpoint
- **THEN** the panel SHALL behave as a right rail
- **AND** collapsing it SHALL NOT add a horizontal scrollbar to the page
- **AND** an open rail SHALL scroll its own text

### Requirement: Writer panel is globally mounted
`SideBarText` SHALL be mounted at the authenticated application shell level so it persists across route changes, while continuing to bind directly to the shared writer store.

#### Scenario: Navigation preserves writer state
- **WHEN** the user navigates between authenticated routes
- **THEN** the writer content, format, and expanded state SHALL remain unchanged
- **AND** the same single panel instance SHALL stay mounted

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
