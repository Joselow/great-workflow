## MODIFIED Requirements

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

## REMOVED Requirements

### Requirement: Deleting a meeting detaches requirements and tasks
**Reason**: Deleting a meeting now removes the requirements of that meeting and the tasks of those requirements, instead of leaving them with a null meeting id.
**Migration**: A requirement that should survive must not carry that meeting id. A task of that requirement is removed with the requirement.

## ADDED Requirements

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
