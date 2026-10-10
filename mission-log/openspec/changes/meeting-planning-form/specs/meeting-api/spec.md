## Purpose

Owner-scoped meeting resource: planning fields, agenda JSON, and many-to-many links to cards and logs. Replaces `cards.meeting_id` and the single meeting pointer on logs.

## ADDED Requirements

### Requirement: Persist a meeting owned by the authenticated user
The API SHALL create a meeting for the authenticated user with `title`, `date`, `estimatedDuration`, `topicStatus`, `objective`, `participants`, `color`, optional `projectId`, `agenda`, `cardIds`, and `logLinks`. `user_id` MUST come from the auth token. Execution fields (`summary`, `lessons`, `executed`, `objectiveAchieved`) MUST be stored with defaults and MUST NOT be required on create.

#### Scenario: Create a planning meeting
- **WHEN** an authenticated user sends a valid create payload with a title, date, duration, and empty agenda
- **THEN** the API SHALL persist the meeting for that user
- **AND** SHALL return the saved meeting including its id

#### Scenario: Create without auth
- **WHEN** a client creates a meeting without a valid token
- **THEN** the API SHALL respond with `401`

### Requirement: Optional project must belong to the owner
`project_id` MAY be null. When present, the project MUST exist and MUST belong to the same user.

#### Scenario: Meeting with no project
- **WHEN** the client omits `project_id` or sends null
- **THEN** the API SHALL persist the meeting with no project

#### Scenario: Project of another user
- **WHEN** the client sends a `project_id` that is not owned by the authenticated user
- **THEN** the API SHALL reject the request
- **AND** SHALL NOT persist the meeting

### Requirement: Agenda is an ordered list of titled items
`agenda` SHALL be an array of `{ title, done }` persisted in the given order. Items with an empty title MUST NOT be stored. `done` MUST default to false when omitted.

#### Scenario: Save agenda items
- **WHEN** the owner creates or updates a meeting with three titled agenda items, the second marked done
- **THEN** the API SHALL persist those three items in order
- **AND** SHALL persist the second item as done

#### Scenario: Drop untitled rows
- **WHEN** the payload includes an agenda item whose title is blank
- **THEN** the API SHALL omit that item from the stored agenda

### Requirement: Owner can read, list, update, and delete their meetings
`GET`, `PUT`, and `DELETE` for a meeting id SHALL succeed only when the meeting exists and `user_id` matches the authenticated user. List SHALL return only the owner's meetings. A missing or foreign id MUST be `404`.

#### Scenario: Owner reads their meeting
- **WHEN** the owner requests their meeting by id
- **THEN** the API SHALL return planning fields, agenda, linked cards, and linked logs with `source`

#### Scenario: Other user reads a meeting
- **WHEN** an authenticated user requests a meeting they do not own
- **THEN** the API SHALL respond with `404`

#### Scenario: Owner deletes a meeting
- **WHEN** the owner deletes their meeting
- **THEN** the API SHALL remove the meeting
- **AND** SHALL remove its `card_meetings` and `log_meetings` rows
- **AND** SHALL NOT delete the cards or logs themselves

### Requirement: Replace card and log links on write
Create and update MUST accept `cardIds` and `logLinks`. The service MUST replace the meeting's join rows with that set. Each card and log MUST belong to the same user. Duplicate pairs MUST NOT be inserted. For an existing `log_meetings` pair, the original `source` MUST be kept.

#### Scenario: Attach two owned cards
- **WHEN** the owner saves a meeting with two of their card ids
- **THEN** the API SHALL persist two `card_meetings` rows
- **AND** GET SHALL include those cards

#### Scenario: Remove a card by omitting it
- **WHEN** the owner updates the same meeting with only one of those card ids
- **THEN** the API SHALL keep one `card_meetings` row
- **AND** SHALL delete the omitted pair

#### Scenario: Unowned card id
- **WHEN** the payload includes a card id the user does not own
- **THEN** the API SHALL reject the request with `400`
- **AND** SHALL NOT persist that link

#### Scenario: Link logs with source
- **WHEN** the owner saves `logLinks` of `[{ logId, source: "log" }]`
- **THEN** GET SHALL return that log with `source` `log`

### Requirement: Cards no longer store meeting_id
The cards table MUST NOT have `meeting_id`. Card create, get, update, list, and public get MUST NOT read, write, or return `meetingId`. `fl_meeting` SHALL remain a card flag.

#### Scenario: Create a card
- **WHEN** an authenticated user creates a card
- **THEN** the response SHALL omit `meetingId`
- **AND** SHALL still include `flMeeting`

### Requirement: List meetings with optional filters
`GET /meeting` SHALL filter in the database by optional `projectId` (uuid or literal `null`), optional `from`/`to` on `date` (same pairing rules as logs), and pagination (`page`, `limit`). Results MUST be the owner's meetings ordered by `date` descending.

#### Scenario: List by project
- **WHEN** the owner lists with `projectId` of a project they own
- **THEN** the API SHALL return only meetings of that project for that user

#### Scenario: Empty list
- **WHEN** the owner has no meetings matching the filters
- **THEN** the API SHALL return an empty `items` array and a total of 0
