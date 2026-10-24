## Purpose

Show the owner's meetings as a table so they can scan the basics of each scheduled meeting and delete one from the row, using the planning form for the full record.

## Requirements

### Requirement: Meetings view is a table of basic fields
The meetings view SHALL render the owner's meetings as a table, not a card grid. Each row MUST show title, date and time, estimated duration in minutes, project name, and participants. A meeting with no project MUST show that it has no project. Empty participants MUST show as empty, not as a placeholder person. The view MUST keep the existing action to create a meeting.

#### Scenario: Row shows planning basics
- **WHEN** the list returns a meeting titled "Sync", on 14 February at 09:00, lasting 30 minutes, in project "Cafeteria", with participants "Ana, Luis"
- **THEN** that row SHALL show the title, the date and time, "30" minutes, "Cafeteria", and "Ana, Luis"

#### Scenario: Meeting without a project
- **WHEN** a listed meeting has no project
- **THEN** the project cell SHALL show that the meeting has no project

### Requirement: List items include participants
`GET /meeting` list items MUST include `participants` as text, in addition to the fields the list already returns. The table MUST use that field and MUST NOT request each meeting by id to fill the row.

#### Scenario: List payload carries participants
- **WHEN** the client requests the meeting list
- **THEN** each item SHALL include `participants`
- **AND** the value SHALL be the text stored on the meeting

### Requirement: Opening a row goes to the planning form
Activating a row, except through its actions menu, SHALL open the existing meeting planning form for that meeting.

#### Scenario: Open a meeting from the table
- **WHEN** the user activates a row outside the actions menu
- **THEN** the app SHALL navigate to the planning form for that meeting id

### Requirement: Each row menu deletes and applies a meeting template
Each row SHALL end with an actions menu. The menu MUST include **Eliminar**. Choosing it MUST ask for confirmation before deleting. Confirming MUST delete that meeting for the owner and remove the row. Cancelling MUST leave the meeting in the table. The menu MUST also list every active template whose module is `meeting` or `all`, oldest created first. Each of those items MUST show the template name. Choosing one MUST apply that template to that meeting and MUST NOT navigate to the planning form. The menu MUST still be available when there is no template, and in that case MUST offer only **Eliminar**.

#### Scenario: Delete remains
- **WHEN** the user opens a row's actions menu
- **THEN** the menu SHALL offer Eliminar

#### Scenario: Confirm delete
- **WHEN** the user chooses Eliminar and confirms
- **THEN** the meeting SHALL be deleted
- **AND** the row SHALL disappear from the table

#### Scenario: Cancel delete
- **WHEN** the user chooses Eliminar and cancels the confirmation
- **THEN** the meeting SHALL remain in the table

#### Scenario: A meeting template is in the menu
- **WHEN** the user opens the menu of a row and an active meeting template named "Correo" exists
- **THEN** the menu SHALL offer "Correo" and Eliminar
- **AND** choosing "Correo" SHALL NOT open the planning form

### Requirement: The table shows one page of the existing list
The table MUST request the existing meeting list with the current page size limit. When the total is greater than the number of rows shown, the view MUST show how many meetings match versus how many are visible. This change MUST NOT add pagination controls, search, status filters, row checkboxes, or bulk actions.

#### Scenario: Range fits on one page
- **WHEN** the filtered total is less than or equal to the page size
- **THEN** the table SHALL show every matching meeting
- **AND** SHALL NOT show a truncation notice

#### Scenario: Range exceeds one page
- **WHEN** the filtered total is greater than the number of rows returned
- **THEN** the view SHALL show the returned rows
- **AND** SHALL show the visible count and the total
