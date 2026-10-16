## ADDED Requirements

### Requirement: List logs by optional completion status
`GET /log` SHALL accept an optional `completed` query parameter. When present, the list MUST include only logs matching that status. When omitted, completion MUST NOT restrict the list.

#### Scenario: Filter completed
- **WHEN** the client requests logs with `completed=true`
- **THEN** the response SHALL contain only logs whose `completed` field is `true`

#### Scenario: Filter not completed
- **WHEN** the client requests logs with `completed=false`
- **THEN** the response SHALL contain logs whose `completed` field is `false` or `null`

#### Scenario: No status filter
- **WHEN** the client omits `completed`
- **THEN** the response SHALL not filter by completion status

### Requirement: List logs by optional createdAt range
`GET /log` SHALL accept optional `from` and `to` query parameters as `YYYY-MM-DD` calendar dates. When both are present, the list MUST include only logs whose `createdAt` is on or after `from` 00:00:00 and before the day after `to`. When both are omitted, the date MUST NOT restrict the list.

#### Scenario: Filter by range
- **WHEN** the client requests logs with `from=2026-08-22` and `to=2026-08-31`
- **THEN** the response SHALL contain only logs created in that inclusive date range

#### Scenario: Filter by free range
- **WHEN** the client requests logs with `from=2026-08-01` and `to=2026-08-31`
- **THEN** the response SHALL contain only logs created in that inclusive date range

#### Scenario: No date filter
- **WHEN** the client omits `from` and `to`
- **THEN** the response SHALL not filter by `createdAt` range

### Requirement: Query filters combine with project scope
Status and date filters SHALL apply in addition to the existing `userId` and optional `projectId` constraints. Invalid query values MUST be rejected with `400`.

#### Scenario: Combined filters
- **WHEN** the client sends `projectId`, `completed=false`, `from`, and `to`
- **THEN** the response SHALL contain only that user's logs for that project, unfinished, inside the date range

#### Scenario: Invalid query
- **WHEN** `completed` is not `true` or `false`, or only one of `from`/`to` is sent, or `from` is after `to`, or a date is not `YYYY-MM-DD`
- **THEN** the API SHALL respond with `400`

#### Scenario: Unchanged default
- **WHEN** the client sends only `projectId` as today
- **THEN** the API SHALL return that project's logs without status or date restriction
