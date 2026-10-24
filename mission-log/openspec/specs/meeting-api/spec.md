## Purpose

Owner-scoped meeting resource: planning fields, agenda JSON, and many-to-many links to cards and logs. Replaces `cards.meeting_id` and the single meeting pointer on logs.

## Requirements

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
- **AND** SHALL remove its issues, its requirements, and its tasks
- **AND** SHALL remove its `card_meetings` rows and its `log_meetings` rows
- **AND** SHALL remove a linked log only when that link's `source` is `meeting`
- **AND** SHALL NOT delete the cards themselves

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

### Requirement: Deleting a meeting removes its associated work
When the owner deletes a meeting, the same request SHALL remove that meeting's issues, the requirements whose meeting id is that meeting, the tasks of those requirements, and the tasks whose meeting id is that meeting. It SHALL remove the meeting's `card_meetings` rows and MUST NOT delete the card rows. For each `log_meetings` row of this meeting whose `source` is `log`, it SHALL remove only that pivot row and MUST leave the log row and that log's links to other meetings. For each `log_meetings` row of this meeting whose `source` is `meeting`, it SHALL remove that log and every `log_meetings` row of that log, including a link from the same log to another meeting. Requirements, tasks, logs, and issues that are not associated with this meeting MUST stay. A missing or foreign meeting MUST be `404` and MUST NOT delete any of those rows. If the delete fails before it finishes, the meeting and every associated row SHALL stay as they were.

#### Scenario: Associated rows are removed
- **WHEN** the owner deletes a meeting that has an issue, a requirement, a task of that requirement, a task of the meeting, a log linked with `source` `meeting`, and a linked card
- **THEN** the meeting, the issue, the requirement, both tasks, and that log SHALL be gone
- **AND** the card SHALL still exist
- **AND** the meeting SHALL have no remaining `card_meetings` or `log_meetings` rows

#### Scenario: An independent log keeps its row
- **WHEN** the owner deletes a meeting whose link to a log has `source` `log`
- **THEN** that pivot row SHALL be gone
- **AND** the log SHALL still exist

#### Scenario: An independent log stays on another meeting
- **WHEN** the owner deletes a meeting whose `source` `log` link points at a log that is also linked to a second meeting
- **THEN** the log SHALL still exist
- **AND** the second meeting SHALL still list that log

#### Scenario: A meeting-born log linked elsewhere is removed
- **WHEN** the owner deletes a meeting whose `source` `meeting` link points at a log that is also linked to a second meeting
- **THEN** that log SHALL be gone
- **AND** the second meeting SHALL no longer list that log
- **AND** the second meeting SHALL still exist

#### Scenario: Another meeting is left alone
- **WHEN** the owner deletes one meeting
- **THEN** a requirement, a task, a log, and an issue of a different meeting SHALL stay

#### Scenario: Foreign id changes nothing
- **WHEN** an authenticated user deletes a meeting id they do not own
- **THEN** the API SHALL respond with `404`
- **AND** that meeting and its associated rows SHALL stay

#### Scenario: A failed delete leaves the meeting
- **WHEN** the delete fails after it has started removing associated rows
- **THEN** the meeting SHALL still exist
- **AND** its issues, requirements, tasks, logs, and links SHALL stay as they were

### Requirement: Finish is atomic
The finish action SHALL apply its clock update as one unit. If the finish fails before it completes, `duration`, `runningSince`, `finishedAt`, and `executed` SHALL stay as they were. A successful finish SHALL keep the existing finish rules.

#### Scenario: A failed finish does not store a partial clock
- **WHEN** the owner finishes a running meeting and the finish fails before it completes
- **THEN** `duration`, `runningSince`, `finishedAt`, and `executed` SHALL stay as they were

### Requirement: Saving a meeting does not rewrite requirements or tasks
Create and update of a meeting MUST NOT create, delete, or rewrite requirements or tasks. Changing a meeting's project id MUST NOT change the project id already stored on a requirement or a task.

#### Scenario: Update the meeting project
- **WHEN** the owner changes a meeting's project and saves the meeting
- **THEN** a requirement created earlier from that meeting SHALL keep the project id it already had
- **AND** SHALL keep its meeting id until the meeting is deleted

#### Scenario: Meeting payload has no requirement list
- **WHEN** the owner creates or updates a meeting
- **THEN** the meeting API SHALL NOT require a requirement or task list
- **AND** SHALL NOT persist requirements or tasks as part of that request

### Requirement: A meeting stores logistics and an actual duration
The meeting API SHALL store `additionalInfo` as nullable text, `platform` as a nullable string of at most 30 characters, `meetingUrl` as nullable text, `accessDetails` as nullable text, and `duration` as a nullable integer of seconds. `platform` MUST be null or one of `meet`, `zoom`, `teams`, `whatsapp`, `presencial`, `otro`. Create and update SHALL accept the four logistics fields. Omitted logistics fields on create SHALL be stored as null. Omitted logistics fields on update SHALL leave the stored values unchanged. A blank string for any logistics field SHALL be stored as null. An unknown `platform` MUST be rejected with `400` and MUST NOT change the meeting. Get by id SHALL return the five fields. `estimatedDuration` SHALL remain the planned minutes and SHALL NOT be replaced by `duration`.

#### Scenario: Create without logistics
- **WHEN** an authenticated user creates a meeting and omits `additionalInfo`, `platform`, `meetingUrl`, `accessDetails`, and `duration`
- **THEN** the stored values of those five fields SHALL be null

#### Scenario: Save logistics
- **WHEN** the owner updates a meeting with a platform of `meet`, a meeting URL, access details, and additional info
- **THEN** get by id SHALL return those four values
- **AND** `duration` SHALL be unchanged

#### Scenario: Blank logistics become null
- **WHEN** the owner updates a meeting and sends a blank platform, URL, access details, and additional info
- **THEN** those four stored values SHALL be null

#### Scenario: Unknown platform
- **WHEN** the owner sends a `platform` that is not one of the six allowed values and is not null
- **THEN** the API SHALL respond with `400`
- **AND** SHALL NOT change the meeting

### Requirement: A meeting stores a server-owned clock
The meeting API SHALL store `duration` as a nullable integer of whole seconds, `startedAt` as a nullable timestamp, `runningSince` as a nullable timestamp, and `finishedAt` as a nullable timestamp. `duration` MUST be the closed seconds only. `runningSince` MUST be the start of the open segment, or null when the clock is not running. `startedAt` MUST be the first start and MUST stay unchanged when the clock is paused, resumed, or finished. `estimatedDuration` MUST remain the planned minutes. Create SHALL store `duration`, `startedAt`, `runningSince`, and `finishedAt` as null. A create or update body that includes any of those four fields MUST NOT change the stored clock. Get by id SHALL return the four fields. List items MUST NOT include `duration`, `startedAt`, `runningSince`, or `finishedAt`.

#### Scenario: Create ignores a clock body
- **WHEN** an authenticated user creates a meeting and the body includes a `duration`, a `startedAt`, a `runningSince`, and a `finishedAt`
- **THEN** the stored `duration`, `startedAt`, `runningSince`, and `finishedAt` SHALL be null
- **AND** `estimatedDuration` SHALL be the planned minutes from the body

#### Scenario: Get returns the clock
- **WHEN** the owner gets a meeting by id
- **THEN** the response SHALL include `duration`, `startedAt`, `runningSince`, and `finishedAt`

#### Scenario: List omits the clock
- **WHEN** the owner lists meetings
- **THEN** each item SHALL NOT include `duration`, `startedAt`, `runningSince`, or `finishedAt`

### Requirement: Planning and qualification do not write the clock
Update of planning fields MUST NOT change `duration`, `startedAt`, `runningSince`, or `finishedAt`. Qualifying a meeting, including setting `executed`, `summary`, `lessons`, or `objectiveAchieved`, MUST NOT change those four fields. Resume and pause MUST NOT change `executed`, `summary`, `lessons`, `objectiveAchieved`, or the planning fields. Finish MUST set `executed` to true and MUST NOT change `summary`, `lessons`, `objectiveAchieved`, or the planning fields.

#### Scenario: Update sends clock fields
- **WHEN** the owner updates a meeting and the body includes a `duration`, a `startedAt`, a `runningSince`, and a `finishedAt`
- **THEN** the stored clock SHALL stay as it was

#### Scenario: Qualify leaves the clock
- **WHEN** the owner sets `executed` to true through qualification
- **THEN** `duration`, `startedAt`, `runningSince`, and `finishedAt` SHALL stay as they were

#### Scenario: Resume leaves qualification
- **WHEN** the owner resumes a meeting whose `executed` is false
- **THEN** `executed` SHALL stay false
- **AND** `summary` and `lessons` SHALL stay as they were

### Requirement: Resume opens one segment
The meeting API SHALL expose a resume action for the owner, with no duration in the body. When `runningSince` is null and the clock has started, or `finishedAt` is set, the action SHALL set `runningSince` to the server time, SHALL set `startedAt` to that same time only when `startedAt` is null, SHALL clear `finishedAt`, and MUST NOT change `duration` or `executed`. When the clock has never started and `executed` is true, the action SHALL respond with `400` and MUST NOT change the meeting. When `runningSince` is already set, the action SHALL respond with `400` and MUST NOT change the meeting. A missing meeting, or one owned by another user, MUST be `404`. A request without a valid token MUST be `401`.

#### Scenario: First start
- **WHEN** the owner resumes a meeting whose `startedAt`, `runningSince`, `finishedAt`, and `duration` are null
- **THEN** `startedAt` SHALL equal `runningSince`
- **AND** `finishedAt` SHALL be null
- **AND** `duration` SHALL stay null

#### Scenario: Resume keeps the closed seconds
- **WHEN** the owner resumes a meeting whose `duration` is 300, whose `startedAt` is already set, and whose `runningSince` is null
- **THEN** `duration` SHALL stay 300
- **AND** `startedAt` SHALL stay unchanged
- **AND** `runningSince` SHALL be set

#### Scenario: Resume after finish
- **WHEN** the owner resumes a meeting whose `finishedAt` is set, whose `executed` is true, and whose `duration` is 900
- **THEN** `finishedAt` SHALL be null
- **AND** `executed` SHALL stay true
- **AND** `duration` SHALL stay 900
- **AND** `runningSince` SHALL be set

#### Scenario: Resume while running
- **WHEN** the owner resumes a meeting whose `runningSince` is already set
- **THEN** the API SHALL respond with `400`
- **AND** `runningSince` and `duration` SHALL stay as they were

### Requirement: Pause commits the open segment on the server clock
The meeting API SHALL expose a pause action for the owner and SHALL NOT expose a periodic tick. The action SHALL NOT accept a duration from the client. When `runningSince` is null, the action SHALL respond with success and MUST NOT change the meeting. When `runningSince` is set, the action SHALL add the whole seconds between `runningSince` and the server time to `duration`, rounding down, including a gap longer than 120 seconds, and MUST NOT add a fraction or a negative number. A null `duration` SHALL become that whole-second count. Pause SHALL then set `runningSince` to null and MUST NOT change `executed`. Two overlapping commits MUST NOT add the same open segment twice.

#### Scenario: Pause adds the open segment
- **WHEN** the owner pauses a running meeting whose `duration` is 300 and whose open segment is 30 whole seconds old
- **THEN** `duration` SHALL be 330
- **AND** `runningSince` SHALL be null
- **AND** `finishedAt` SHALL stay null

#### Scenario: A long gap is kept
- **WHEN** the owner pauses a running meeting whose `duration` is 300 and whose open segment is more than 120 seconds old
- **THEN** `duration` SHALL include those whole seconds
- **AND** `runningSince` SHALL be null
- **AND** `executed` SHALL stay as it was

#### Scenario: Pause while paused
- **WHEN** the owner pauses a meeting whose `runningSince` is null and whose `duration` is 300
- **THEN** the API SHALL respond with success
- **AND** `duration` SHALL stay 300
- **AND** `runningSince` SHALL stay null

#### Scenario: The same segment is not added twice
- **WHEN** two commits for the same open segment are applied
- **THEN** `duration` SHALL include that segment's whole seconds once

### Requirement: Finish closes the clock without clearing the total
The meeting API SHALL expose a finish action for the owner, with no duration in the body. When a segment is open, the action SHALL commit it with the same rules as pause, SHALL set `finishedAt` to the server time, and SHALL set `executed` to true. When the clock was started, `runningSince` is null, and `finishedAt` is null, the action SHALL set `finishedAt`, SHALL set `executed` to true, and MUST NOT change `duration`. When `finishedAt` is already set and `runningSince` is null, the action SHALL respond with success and MUST NOT change the meeting. When the clock was never started, the action SHALL respond with `400` and MUST NOT change the meeting. Finish MUST NOT clear `duration` or `startedAt`. The API MUST NOT expose an action that stores a client-supplied duration as the meeting clock.

#### Scenario: Finish the open segment
- **WHEN** the owner finishes a running meeting whose `duration` is 600 and whose open segment is 30 whole seconds old
- **THEN** `duration` SHALL be 630
- **AND** `runningSince` SHALL be null
- **AND** `finishedAt` SHALL be set
- **AND** `executed` SHALL be true
- **AND** `startedAt` SHALL stay unchanged

#### Scenario: Finish while paused
- **WHEN** the owner finishes a meeting whose `duration` is 600, whose `runningSince` is null, whose `startedAt` is set, and whose `finishedAt` is null
- **THEN** `duration` SHALL stay 600
- **AND** `finishedAt` SHALL be set
- **AND** `executed` SHALL be true

#### Scenario: Finish again
- **WHEN** the owner finishes a meeting whose `finishedAt` is already set and whose `runningSince` is null
- **THEN** the API SHALL respond with success
- **AND** `finishedAt` and `duration` SHALL stay as they were

#### Scenario: Finish before the first start
- **WHEN** the owner finishes a meeting whose `startedAt`, `runningSince`, `finishedAt`, and `duration` are null
- **THEN** the API SHALL respond with `400`
- **AND** those four fields SHALL stay null

#### Scenario: A long finish keeps the gap
- **WHEN** the owner finishes a running meeting whose `duration` is 300 and whose open segment is more than 120 seconds old
- **THEN** `duration` SHALL include those whole seconds
- **AND** `runningSince` SHALL be null
- **AND** `finishedAt` SHALL be set
- **AND** `executed` SHALL be true

### Requirement: Clock actions are owner-only
Resume, pause, and finish MUST succeed only for the owner. A request without a valid token MUST be `401` and MUST NOT change the meeting. A missing meeting, or one owned by another user, MUST be `404` and MUST NOT change the meeting.

#### Scenario: No token
- **WHEN** a client resumes a meeting without a valid token
- **THEN** the API SHALL respond with `401`
- **AND** the meeting clock SHALL stay as it was

#### Scenario: Another user's meeting
- **WHEN** an authenticated user pauses a meeting they do not own
- **THEN** the API SHALL respond with `404`
- **AND** that meeting's clock SHALL stay as it was

### Requirement: An already stored duration is a finished clock
A meeting that already had a stored `duration` before the clock timestamps existed SHALL be readable with that same `duration`, a null `runningSince`, a null `startedAt`, and a non-null `finishedAt`.

#### Scenario: Previous finish stays finished
- **WHEN** the owner gets a meeting that had a stored `duration` of 125 and no clock timestamps
- **THEN** `duration` SHALL be 125
- **AND** `finishedAt` SHALL be set
- **AND** `runningSince` and `startedAt` SHALL be null
