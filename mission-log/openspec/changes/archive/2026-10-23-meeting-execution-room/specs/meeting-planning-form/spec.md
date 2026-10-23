## MODIFIED Requirements

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
