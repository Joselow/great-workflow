## MODIFIED Requirements

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
