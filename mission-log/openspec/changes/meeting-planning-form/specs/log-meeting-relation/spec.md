## Purpose

Logs and meetings relate many-to-many through `log_meetings` with a `source` that records which side created the link. Logs no longer store a single meeting pointer.

## ADDED Requirements

### Requirement: Log write payloads omit meeting fields
Create and update log requests MUST NOT accept `meetingId` or `typeMeetingLink`. Log responses MUST NOT include those fields.

#### Scenario: Create a log
- **WHEN** an authenticated user creates a log with project, description, responsible, and tags
- **THEN** the API SHALL persist the log
- **AND** SHALL NOT store a meeting id on the log row

#### Scenario: Client still sends meetingId
- **WHEN** a client includes `meetingId` or `typeMeetingLink` on create or update
- **THEN** the API SHALL reject the request with `400`

### Requirement: Source records which entity originated the link
Each `log_meetings` row MUST have `source` of `log` or `meeting`. `log` means the meeting was created from that log. `meeting` means the log was created from that meeting. A log MAY link to many meetings. A meeting MAY link to many logs.

#### Scenario: Meeting born from logs
- **WHEN** a meeting is created with two log links whose source is `log`
- **THEN** both rows SHALL have `source` `log`
- **AND** each log SHALL remain linkable to other meetings

#### Scenario: Log born from a meeting
- **WHEN** a meeting write includes a log link whose source is `meeting`
- **THEN** that row SHALL have `source` `meeting`

### Requirement: Same log-meeting pair is unique
The database MUST allow only one row per `(log_id, meeting_id)`. Re-attaching the same pair MUST NOT insert a second row and MUST keep the existing `source`.

#### Scenario: Attach the same log twice
- **WHEN** the owner saves a meeting that already links log A with `source` `log` and sends log A again with `source` `meeting`
- **THEN** the pair SHALL still exist once
- **AND** `source` SHALL remain `log`

### Requirement: Existing log meeting columns are migrated then dropped
Any existing `logs.meeting_id` MUST be copied into `log_meetings` before the columns are dropped. `type_meeting_link` `log-meet` maps to `source` `log`; `meet-log` maps to `source` `meeting`; a meeting id with null type maps to `source` `log`.

#### Scenario: Backfill a log-meet pointer
- **WHEN** a log row has `meeting_id` set and `type_meeting_link` `log-meet`
- **THEN** after migration there SHALL be a `log_meetings` row for that pair with `source` `log`
- **AND** the log row SHALL no longer have `meeting_id`
