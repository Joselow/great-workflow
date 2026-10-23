## MODIFIED Requirements

### Requirement: SideBarText is mounted once at app level
The application SHALL render exactly one `SideBarText` instance at the authenticated app shell level, not inside individual route views. The meeting execution room route SHALL NOT render `SideBarText`, the header, or the project drawer.

#### Scenario: Sidebar visible on authenticated routes
- **WHEN** the user navigates between authenticated routes other than the meeting execution room
- **THEN** the same SideBarText panel SHALL remain mounted and visible
- **AND** its content and expanded state SHALL persist across navigation

#### Scenario: Sidebar not on auth pages
- **WHEN** the user is on login or register
- **THEN** SideBarText SHALL NOT be rendered

#### Scenario: Execution room has no shell chrome
- **WHEN** the user is on the meeting execution room route
- **THEN** SideBarText SHALL NOT be rendered
- **AND** the header SHALL NOT be rendered
- **AND** the project drawer SHALL NOT be rendered

### Requirement: Main content layout accommodates global sidebar
The authenticated layout SHALL place main content and the writer side by side at or above the medium breakpoint, and SHALL leave main content usable when the writer is a collapsed bottom tab below that breakpoint. The shell SHALL NOT grow wider than the viewport because of the writer. The meeting execution room route SHALL render the room as the whole view, without the writer beside it or as a bottom tab.

#### Scenario: Desktop layout
- **WHEN** the viewport is at or above the medium breakpoint and the route is not the meeting execution room
- **THEN** main content and the writer SHALL display side by side
- **AND** a closed writer SHALL NOT add a horizontal scrollbar to the page

#### Scenario: Mobile layout
- **WHEN** the viewport is below the medium breakpoint, the writer is collapsed, and the route is not the meeting execution room
- **THEN** main content SHALL remain scrollable and usable
- **AND** the writer SHALL use its bottom-tab behavior

#### Scenario: Execution room uses the viewport
- **WHEN** the user is on the meeting execution room route
- **THEN** the room SHALL fill the view
- **AND** the writer SHALL NOT be shown
