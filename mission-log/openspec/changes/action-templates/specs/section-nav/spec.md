## RENAMED Requirements

- FROM: `### Requirement: The shell shows five text links`
- TO: `### Requirement: The shell shows the section links`

## MODIFIED Requirements

### Requirement: The shell shows the section links
On every authenticated page, the shell SHALL show a text nav with exactly these labels, in this order: **Logs**, **Reuniones**, **Requerimientos**, **Tareas**, **Cards**, **Acciones**. **Logs** SHALL open the logs view. **Reuniones** SHALL open the meetings list. **Requerimientos** SHALL open `/requirements`. **Tareas** SHALL open `/tasks`. **Cards** SHALL open the cards list. **Acciones** SHALL open `/action-templates`. The nav SHALL NOT be shown on login, register, or a public page.

#### Scenario: Open requirements from the nav
- **WHEN** the owner activates **Requerimientos**
- **THEN** the app SHALL show `/requirements`

#### Scenario: Open tasks from the nav
- **WHEN** the owner activates **Tareas**
- **THEN** the app SHALL show `/tasks`

#### Scenario: Open action templates from the nav
- **WHEN** the owner activates **Acciones**
- **THEN** the app SHALL show `/action-templates`

#### Scenario: Guest pages
- **WHEN** the user is on login or register
- **THEN** the section links SHALL NOT be shown

### Requirement: The current section is distinct
The link for the section the owner is in SHALL be visually distinct from the others. **Logs** is current on `/` and on `/logger`. **Reuniones** is current on the meetings list and on a meeting form. **Requerimientos** is current on `/requirements`. **Tareas** is current on `/tasks`. **Cards** is current on the cards list and on a card form. **Acciones** is current on `/action-templates`.

#### Scenario: Tasks is current
- **WHEN** the owner is on `/tasks`
- **THEN** **Tareas** SHALL be the distinct link
- **AND** **Requerimientos** SHALL NOT be the distinct link

#### Scenario: A meeting form stays under Reuniones
- **WHEN** the owner is editing a meeting
- **THEN** **Reuniones** SHALL be the distinct link

#### Scenario: Action templates is current
- **WHEN** the owner is on `/action-templates`
- **THEN** **Acciones** SHALL be the distinct link
- **AND** **Cards** SHALL NOT be the distinct link

### Requirement: Narrow screens wrap the links
Below the `md` breakpoint the section links SHALL wrap onto additional lines. They MUST NOT overlay the page and MUST NOT force the page wider than the viewport. A closed writer SHALL NOT cover the links or the page.

#### Scenario: Narrow header
- **WHEN** the viewport is below `md`
- **THEN** the section labels SHALL remain readable
- **AND** SHALL wrap instead of overflowing the viewport
- **AND** a closed writer SHALL NOT cover them
