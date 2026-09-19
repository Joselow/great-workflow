## Purpose

Restores the header active project from localStorage after reload, and keeps the cards list project filter across visits to `/cards`.

## ADDED Requirements

### Requirement: Header active project survives reload
After a full reload on an authenticated route, the app MUST read the stored active project and show it in the header. It MUST NOT leave the header on “Seleccionar o crear proyecto” when a valid stored project exists. Restore MUST run after the current route is known, not only on the first setup tick.

#### Scenario: Reload while a project is stored
- **WHEN** `fwl:activeProject` holds a valid project and the user reloads `/cards` or `/cards/:id`
- **THEN** the header SHALL show that project
- **AND** SHALL NOT show “Seleccionar o crear proyecto”

#### Scenario: Public route still skips project fetch
- **WHEN** the user opens a public card with no auth
- **THEN** the app SHALL NOT request the protected project list

### Requirement: Cards list project filter survives reload
The gallery project filter (Todos, Global cards, or a project id) MUST be written to localStorage when it changes and MUST be applied on the next `/cards` load. A missing, invalid, or unknown stored value MUST fall back to Todos.

#### Scenario: Filter then reload
- **WHEN** the user selects a project in the cards filter and reloads `/cards`
- **THEN** that project SHALL still be selected
- **AND** the list request SHALL use that `projectId`

#### Scenario: Global cards then reload
- **WHEN** the user selects Global cards and reloads `/cards`
- **THEN** the filter SHALL stay on Global cards
- **AND** the list request SHALL send `projectId=null`
