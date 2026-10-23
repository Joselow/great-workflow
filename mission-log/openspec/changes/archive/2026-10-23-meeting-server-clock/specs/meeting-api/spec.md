## ADDED Requirements

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
