## Purpose

Turn each next step of a meeting into a log owned by the same user, joined to that meeting as something that was born there, and keep logs that were attached from the log side.

## Requirements

### Requirement: A next step becomes a log with source meeting
Create and update SHALL accept `nextSteps`, a list of `{ logId?, description }`. A row whose description is empty or whitespace SHALL be ignored. Each remaining row SHALL be stored as a log for the authenticated user and joined to the meeting with `source` `meeting`. The log `description` SHALL be the trimmed row text. `responsible` SHALL be `Reunión {title} {fecha}`, where `fecha` is the meeting date and time formatted `DD/MM/YY h:mm:ss A`. `tags` SHALL be `reunión, {project name}`. `completed` and `comment` SHALL be null. `project_id` SHALL be the meeting's project. `user_id` SHALL come from the auth token.

#### Scenario: Create two next steps
- **WHEN** the owner saves a meeting that has a project, with next steps `"Cerrar el alcance"` and `"Pedir acceso a la API"`
- **THEN** the API SHALL persist two logs with those descriptions
- **AND** SHALL join both to the meeting with `source` `meeting`
- **AND** each log SHALL use that responsible and tags pattern
- **AND** GET SHALL return both logs with `source` `meeting` and their descriptions

#### Scenario: Blank rows are not stored
- **WHEN** the owner saves next steps `"Avisar al cliente"` and `"   "`
- **THEN** the API SHALL persist one log
- **AND** SHALL NOT persist a log for the blank row

#### Scenario: Responsible stays within the column
- **WHEN** the meeting title plus the date would make `responsible` longer than 100 characters
- **THEN** the API SHALL shorten the title portion
- **AND** SHALL keep the `Reunión` prefix and the date
- **AND** SHALL store a `responsible` of at most 100 characters

### Requirement: Next steps require a project and a usable description
A next step that remains after dropping blank rows MUST belong to a meeting with a project the owner owns. Its trimmed description MUST be at least 2 characters. Otherwise the API SHALL respond with `400` and SHALL NOT persist that request's meeting write or its next-step logs. `tags` SHALL be at most 255 characters.

#### Scenario: Next step without a project
- **WHEN** the owner saves a next step with text and the meeting has no project
- **THEN** the API SHALL respond with `400`
- **AND** SHALL NOT create the log

#### Scenario: Description of one character
- **WHEN** the owner saves a next step whose trimmed description is one character
- **THEN** the API SHALL respond with `400`
- **AND** SHALL NOT persist the meeting changes from that request

### Requirement: The write is atomic
A create or update that includes next steps SHALL persist the meeting, its next-step logs, and their joins together. If any part of that write fails, the API SHALL NOT leave a new meeting from that request and SHALL NOT leave a partial set of next-step logs from that request.

#### Scenario: Log write fails
- **WHEN** the owner creates a meeting with next steps and storing one of those logs fails
- **THEN** the API SHALL NOT leave that new meeting stored
- **AND** SHALL NOT leave the next-step logs that belonged only to that failed request

### Requirement: Update keeps, edits, and removes only meeting-born logs
On update, a next step with a `logId` SHALL update that log's description and SHALL refresh `responsible` and `tags` from the meeting being saved. A next step without `logId` SHALL create a new log and a `source` `meeting` join. A previous `source` `meeting` log of this meeting that is absent from `nextSteps` SHALL be deleted, including its join, and SHALL disappear from the project log list. Logs joined with `source` `log` SHALL stay linked and SHALL NOT be deleted by this sync. A `logId` that is not a `source` `meeting` log of this meeting MUST be rejected with `400`.

#### Scenario: Edit one step and add another
- **WHEN** the owner updates a meeting and sends the existing next-step log id with a new description, plus a new row without `logId`
- **THEN** the API SHALL update that log's description
- **AND** SHALL create one new log joined with `source` `meeting`

#### Scenario: Remove a next step
- **WHEN** the owner updates the meeting and omits a next step that was previously `source` `meeting`
- **THEN** the API SHALL delete that log and its join
- **AND** the project log list SHALL no longer include it

#### Scenario: Attached logs survive
- **WHEN** the meeting also has a log joined with `source` `log`, and the owner saves next steps
- **THEN** the API SHALL keep that `source` `log` join
- **AND** SHALL NOT delete that log

#### Scenario: Title change refreshes responsible
- **WHEN** the owner renames the meeting and saves an existing next step
- **THEN** that log's `responsible` SHALL use the new title and the saved date
