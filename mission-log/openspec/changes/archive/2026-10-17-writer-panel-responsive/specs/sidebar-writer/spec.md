## MODIFIED Requirements

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
