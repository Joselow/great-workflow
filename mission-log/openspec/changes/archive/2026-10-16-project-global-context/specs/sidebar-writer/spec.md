## ADDED Requirements

### Requirement: Writer panel is globally mounted
`SideBarText` SHALL be mounted at the authenticated application shell level so it persists across route changes, while continuing to bind directly to the shared writer store.

#### Scenario: Navigation preserves writer state
- **WHEN** the user navigates between authenticated routes
- **THEN** the writer content, format, and expanded state SHALL remain unchanged
- **AND** the same single panel instance SHALL stay mounted

## MODIFIED Requirements

### Requirement: Layout is responsive on small viewports
`SideBarText` SHALL remain usable on small/mobile viewports and SHALL NOT rely solely on a fixed wide side-rail that can overflow or obstruct the primary content on narrow screens. When mounted globally, the shell layout SHALL still allow the main content area to scroll and remain usable alongside the writer panel.

#### Scenario: Small viewport
- **WHEN** the viewport width is below the medium breakpoint
- **THEN** the panel SHALL adapt its layout (for example, a full-width bottom panel) instead of a fixed-width side rail
- **AND** the main route content SHALL remain accessible

#### Scenario: Large viewport
- **WHEN** the viewport width is at or above the medium breakpoint
- **THEN** the panel SHALL behave as the existing side-rail layout within the global app shell
