## Purpose

Authenticated create and edit form for meeting planning: project, title, date, current status, objective, agenda, duration, participants, color, and associated cards. Reuses the card editor inside a modal.

## Requirements

### Requirement: One form for create and edit
The app SHALL use the same form view to create a meeting and to edit an existing one. Create SHALL start with defaults. Edit SHALL load the owner's meeting by id. After a successful create, the user MUST land on the edit route for the new id.

#### Scenario: Open create
- **WHEN** the user opens the new-meeting route
- **THEN** the form SHALL show an empty title
- **AND** SHALL be ready to save a new meeting

#### Scenario: Open edit
- **WHEN** the user opens the edit route with a meeting they own
- **THEN** the form SHALL show that meeting's title, date, project, status, objective, agenda, duration, participants, color, and linked cards
- **AND** SHALL show its platform, meeting URL, access details, and additional info

### Requirement: Project defaults to the active project and can be cleared
The form SHALL include a project selector. On create, the selected project MUST default to the current active project when one exists, otherwise none. Changing the selector MUST NOT change the app's active project.

#### Scenario: Create with an active project
- **WHEN** the user opens create and an active project is set
- **THEN** the selector SHALL start on that project

#### Scenario: Free meeting
- **WHEN** the user selects no project
- **THEN** save SHALL send a null project

### Requirement: Planning fields match the wireframe structure
The form SHALL present, in one scrollable layout: project and title; date (including time); current status; objective; agenda list; estimated duration in minutes; participants; color control; a cards panel; a logistics section; and save. The logistics section SHALL include a platform select, a meeting URL, access details, and additional info. The platform select SHALL offer an empty choice and the labels Google Meet, Zoom, Teams, WhatsApp, Presencial, and Otro. Estimated duration SHALL remain the planned minutes. The form SHALL NOT offer an input for the actual duration in seconds. Visual treatment MUST use the app's Pastel Soft UI / Soft Brutalism (thin borders, small radius, existing color tokens), not the mock's rainbow outlines.

#### Scenario: Save planning data
- **WHEN** the user fills title, date, duration, objective, and status and confirms save
- **THEN** the API payload SHALL include those fields
- **AND** SHALL not require summary, lessons, or executed

#### Scenario: Save logistics
- **WHEN** the owner chooses Zoom, enters a URL, access details, and additional info, and confirms save
- **THEN** the payload SHALL include that platform, URL, access details, and additional info
- **AND** SHALL NOT send an actual duration that replaces the stored duration

#### Scenario: Clear logistics
- **WHEN** the owner clears the platform, URL, access details, and additional info, and confirms save
- **THEN** a later load SHALL show those four values empty

### Requirement: Agenda items can be added, checked, reordered, and removed
The agenda editor SHALL support adding a row, editing its title, toggling `done`, moving up/down, and removing. Order on screen MUST be the order sent on save. Untitled rows MUST not be persisted.

#### Scenario: Check an agenda item
- **WHEN** the user marks an agenda row as done and saves
- **THEN** reload SHALL show that row still done

### Requirement: Associate existing cards or create one in a modal
The cards panel SHALL list cards already on the draft. The user MUST be able to open a modal to pick an existing owned card (from the card list API) or to create a card. Creating a card SHALL use the same card form fields as the card page (extracted component). A newly created card MUST be added to the draft immediately. Save of the meeting SHALL send the draft's card ids. Removing a card from the panel MUST un-link it on the next meeting save and MUST NOT delete the card.

#### Scenario: Attach an existing card
- **WHEN** the user picks a card they own in the modal
- **THEN** the panel SHALL show that card
- **AND** save SHALL include its id in `cardIds`

#### Scenario: Create a card from the meeting
- **WHEN** the user creates a card in the modal
- **THEN** the card SHALL be persisted via the card API
- **AND** the panel SHALL include the new card

#### Scenario: Remove a card from the meeting
- **WHEN** the user removes a card from the panel and saves the meeting
- **THEN** the meeting SHALL no longer list that card
- **AND** the card SHALL still exist in the cards gallery

### Requirement: Card page still uses the extracted form
`CardFormView` SHALL render the extracted card form for create/edit. Copy, share, and danger-zone actions MAY stay on the page wrapper. Behavior of prompt, sections, and save confirm MUST remain available on the card page.

#### Scenario: Edit a card on its page
- **WHEN** the user opens the existing card edit route
- **THEN** the form SHALL still load and save that card as today

### Requirement: Confirm before save; list is reachable
Save SHALL open a confirm step. `/meetings` SHALL list the owner's meetings with a way to open create and edit. A keyboard shortcut equivalent to the cards shortcut SHALL navigate to the meetings list.

#### Scenario: Confirm create
- **WHEN** the user clicks save and confirms
- **THEN** the app SHALL create the meeting
- **AND** SHALL navigate to the edit route

#### Scenario: Open list
- **WHEN** the user opens `/meetings`
- **THEN** the app SHALL show their meetings or an empty state
- **AND** SHALL offer a control to create a meeting

### Requirement: Optional log origin from the query string
If the create route includes log ids in the query, the draft MUST send those ids as `logLinks` with `source` `log` on save. The planning form is not required to show a log picker.

#### Scenario: Create from logs
- **WHEN** the user opens create with log ids in the query and saves
- **THEN** the meeting SHALL be linked to those logs with `source` `log`
