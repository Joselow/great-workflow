## Purpose

TBD

## Requirements

### Requirement: SideBarText is mounted once at app level
The application SHALL render exactly one `SideBarText` instance at the authenticated app shell level, not inside individual route views.

#### Scenario: Sidebar visible on authenticated routes
- **WHEN** the user navigates between authenticated routes (for example home and logger)
- **THEN** the same SideBarText panel SHALL remain mounted and visible
- **AND** its content and expanded state SHALL persist across navigation

#### Scenario: Sidebar not on auth pages
- **WHEN** the user is on login or register
- **THEN** SideBarText SHALL NOT be rendered

### Requirement: Main content layout accommodates global sidebar
The authenticated layout SHALL place main content and the writer side by side at or above the medium breakpoint, and SHALL leave main content usable when the writer is a collapsed bottom tab below that breakpoint. The shell SHALL NOT grow wider than the viewport because of the writer.

#### Scenario: Desktop layout
- **WHEN** the viewport is at or above the medium breakpoint
- **THEN** main content and the writer SHALL display side by side
- **AND** a closed writer SHALL NOT add a horizontal scrollbar to the page

#### Scenario: Mobile layout
- **WHEN** the viewport is below the medium breakpoint and the writer is collapsed
- **THEN** main content SHALL remain scrollable and usable
- **AND** the writer SHALL use its bottom-tab behavior

### Requirement: LogsView no longer owns SideBarText
Individual views SHALL NOT import or render SideBarText directly.

#### Scenario: LogsView structure
- **WHEN** LogsView renders
- **THEN** it SHALL contain only log-specific content (form, filters, table)
- **AND** SHALL NOT include a SideBarText import
