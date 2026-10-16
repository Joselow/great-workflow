## Purpose

Authenticated `/cards` gallery: filter by project, debounced text search, and Prompt/Meeting pills, then show colored tiles with page arrows.

## ADDED Requirements

### Requirement: Cards route shows the owner gallery
The authenticated `/cards` route SHALL render a card gallery instead of the logs placeholder. The gallery MUST show a filter row (project, search, Prompt and Meeting pills) and a grid of the current page of cards. A control MUST navigate to create a new card.

#### Scenario: Open cards
- **WHEN** an authenticated user opens `/cards`
- **THEN** the app SHALL show the filter row and the card grid
- **AND** SHALL NOT show the logs table

#### Scenario: Create from the list
- **WHEN** the user activates the new-card control
- **THEN** the app SHALL navigate to the new-card route

### Requirement: Project filter lists all projects plus none
The project control SHALL offer every project of the user, a “Todos” option, and a “Sin proyecto” option. Default MUST be Todos (no project query param). Choosing a project MUST refetch with that `projectId`. Choosing Sin proyecto MUST refetch with `projectId=null`. Changing this control MUST NOT change the app's active project.

#### Scenario: Default is all
- **WHEN** the gallery loads
- **THEN** the project control SHALL start on Todos
- **AND** the list request SHALL omit `projectId`

#### Scenario: Filter by one project
- **WHEN** the user selects a project
- **THEN** the list request SHALL include that project's id
- **AND** the header active project SHALL stay unchanged

#### Scenario: Free cards
- **WHEN** the user selects Sin proyecto
- **THEN** the list request SHALL send `projectId=null`

### Requirement: Search is automatic and debounced
The search field SHALL refetch the list after the user stops typing for a short debounce (about 300ms). The request MUST send the current `q` together with the other active filters. Clearing the field MUST refetch without `q`. The client MUST NOT filter the downloaded set locally to apply search.

#### Scenario: Type a query
- **WHEN** the user types a search term and pauses
- **THEN** the app SHALL request the list with that `q`

#### Scenario: Clear search
- **WHEN** the user clears the search field and pauses
- **THEN** the list request SHALL omit `q`

### Requirement: Prompt and Meeting pills are independent toggles
The filter row SHALL include Prompt and Meeting pills. Each pill MAY be on or off on its own. Turning a pill on MUST refetch with `isPrompt=true` and/or `flMeeting=true`. Turning it off MUST omit that param. Default MUST be both off.

#### Scenario: Filter prompts
- **WHEN** the user turns Prompt on and leaves Meeting off
- **THEN** the list request SHALL include `isPrompt=true`
- **AND** SHALL omit `flMeeting`

#### Scenario: Both pills
- **WHEN** Prompt and Meeting are both on
- **THEN** the list request SHALL include `isPrompt=true` and `flMeeting=true`

#### Scenario: Clear a pill
- **WHEN** Prompt is on and the user turns it off
- **THEN** the list request SHALL omit `isPrompt`

### Requirement: Tiles use the card color and show flag badges
Each result MUST render as a tile tinted with that card's color (same fill/border language as the rest of the app). The tile MUST show the title. A Prompt badge MUST appear only when `isPrompt` is true. A Meeting badge MUST appear only when `flMeeting` is true. Clicking a tile MUST open the edit route for that id.

#### Scenario: Colored tile
- **WHEN** a card with a chosen color is in the page
- **THEN** its tile SHALL use that color
- **AND** SHALL show the card title

#### Scenario: Badges
- **WHEN** a card is a prompt and marked for meeting
- **THEN** its tile SHALL show Prompt and Meeting badges

#### Scenario: Open edit
- **WHEN** the user clicks a tile
- **THEN** the app SHALL navigate to the edit route for that card

### Requirement: Page arrows move through results
The gallery SHALL show previous and next controls. Previous MUST be disabled on page 1. Next MUST be disabled when there is no further page. Changing project, search, or pills MUST reset to page 1 and refetch. An empty match MUST show an empty state instead of placeholder tiles.

#### Scenario: Next page
- **WHEN** more cards match than the current page holds and the user activates next
- **THEN** the gallery SHALL request the next page

#### Scenario: First page
- **WHEN** the user is on page 1
- **THEN** the previous control SHALL be disabled

#### Scenario: No matches
- **WHEN** the current filters match no cards
- **THEN** the gallery SHALL show an empty state
- **AND** SHALL NOT show fake tiles
