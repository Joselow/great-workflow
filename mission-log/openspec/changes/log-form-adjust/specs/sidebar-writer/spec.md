## ADDED Requirements

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
`SideBarText` SHALL remain usable on small/mobile viewports and SHALL NOT rely solely on a fixed wide side-rail that can overflow or obstruct the primary content on narrow screens.

#### Scenario: Small viewport
- **WHEN** the viewport width is below the medium breakpoint
- **THEN** the panel SHALL adapt its layout (for example, a full-width bottom panel) instead of a fixed-width side rail

#### Scenario: Large viewport
- **WHEN** the viewport width is at or above the medium breakpoint
- **THEN** the panel SHALL behave as the existing side-rail layout
