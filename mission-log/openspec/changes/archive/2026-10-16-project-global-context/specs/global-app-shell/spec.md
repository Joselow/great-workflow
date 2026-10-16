## ADDED Requirements

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
The authenticated layout SHALL reserve space for the global sidebar without breaking responsive behavior.

#### Scenario: Desktop layout
- **WHEN** the viewport is at or above the medium breakpoint
- **THEN** the main content and SideBarText SHALL display side by side as today in LogsView

#### Scenario: Mobile layout
- **WHEN** the viewport is below the medium breakpoint
- **THEN** SideBarText SHALL use its bottom-panel responsive behavior
- **AND** main content SHALL remain scrollable and usable

### Requirement: LogsView no longer owns SideBarText
Individual views SHALL NOT import or render SideBarText directly.

#### Scenario: LogsView structure
- **WHEN** LogsView renders
- **THEN** it SHALL contain only log-specific content (form, filters, table)
- **AND** SHALL NOT include a SideBarText import
