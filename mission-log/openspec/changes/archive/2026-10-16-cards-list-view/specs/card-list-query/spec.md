## Purpose

Owner-scoped card list: filter in the database by project (including free cards), prompt/meeting flags, and ILIKE across title, description, and section text, then return one page.

## ADDED Requirements

### Requirement: Owner can list only their cards
`GET` on the card collection SHALL return cards whose `user_id` matches the authenticated user. The response MUST be `{ items, page, limit, total }`. Each item MUST include `id`, `name`, `description`, `color`, `isPrompt`, `flMeeting`, `projectId`, and `project` (`{ name, color }` or null). Items MUST NOT include `sections`, `userId`, or `meetingId`. A request without a valid token MUST be `401`.

#### Scenario: Owner lists cards
- **WHEN** an authenticated user requests the card collection
- **THEN** the API SHALL return only that user's cards
- **AND** SHALL include `items`, `page`, `limit`, and `total`

#### Scenario: List without auth
- **WHEN** a client requests the card collection without a valid token
- **THEN** the API SHALL respond with `401`

### Requirement: Project filter accepts all, one project, or null-only
The collection SHALL accept an optional `projectId` query parameter. When omitted, project MUST NOT restrict the list. When it is a project id, the list MUST include only cards with that `project_id`. When it is the literal `null`, the list MUST include only cards with no project. A missing or empty match MUST return an empty `items` array, not an error.

#### Scenario: All projects
- **WHEN** the client omits `projectId`
- **THEN** the response SHALL include cards with a project and cards with no project

#### Scenario: One project
- **WHEN** the client sends `projectId` equal to one of their project ids
- **THEN** the response SHALL contain only cards with that `project_id`

#### Scenario: Free cards only
- **WHEN** the client sends `projectId=null`
- **THEN** the response SHALL contain only cards whose `project_id` is null

### Requirement: Text search uses ILIKE on card and section fields
The collection SHALL accept an optional `q` query parameter. When `q` is non-empty after trim, the list MUST include a card if `name`, `description`, any section title, or any section description matches with case-insensitive LIKE (`ILIKE '%q%'`). Literal `%`, `_`, and `\` in `q` MUST be treated as normal characters. When `q` is omitted or blank, text MUST NOT restrict the list. Matching MUST happen in the database.

#### Scenario: Match title or description
- **WHEN** the client sends `q` that appears in a card's name or description
- **THEN** that card SHALL be included

#### Scenario: Match a section
- **WHEN** the client sends `q` that appears only in a section title or section description
- **THEN** that card SHALL be included

#### Scenario: Wildcard characters are literal
- **WHEN** the client sends `q` containing `%` or `_`
- **THEN** the API SHALL NOT treat those characters as SQL wildcards

#### Scenario: Blank search
- **WHEN** the client omits `q` or sends only whitespace
- **THEN** the response SHALL not filter by text

### Requirement: Prompt and meeting filters are optional and combine with AND
The collection SHALL accept optional `isPrompt` and `flMeeting` query parameters (`true` or `false`). When present, the list MUST include only cards whose flag equals that value. When both are present, both constraints MUST apply. When omitted, that flag MUST NOT restrict the list.

#### Scenario: Prompt only
- **WHEN** the client sends `isPrompt=true` and omits `flMeeting`
- **THEN** the response SHALL contain only prompt cards

#### Scenario: Both flags
- **WHEN** the client sends `isPrompt=true` and `flMeeting=true`
- **THEN** the response SHALL contain only cards that are both a prompt and marked for meeting

#### Scenario: No flag filter
- **WHEN** the client omits `isPrompt` and `flMeeting`
- **THEN** the response SHALL not filter by those flags

### Requirement: List is paginated
The collection SHALL accept `page` (1-based, default 1) and `limit` (default 6, maximum 24). `items` MUST be one page ordered by `updatedAt` descending. `total` MUST be the number of rows matching the same filters, ignoring page. Invalid `page`, `limit`, `q`, `projectId`, or flag values MUST be `400`.

#### Scenario: Default page
- **WHEN** the client omits `page` and `limit`
- **THEN** the API SHALL return at most 6 items
- **AND** SHALL set `page` to 1 and `limit` to 6

#### Scenario: Second page
- **WHEN** the client sends `page=2` and `limit=6` and more than 6 cards match
- **THEN** `items` SHALL be the next up-to-6 cards
- **AND** `total` SHALL be the full match count

#### Scenario: Invalid query
- **WHEN** the client sends an invalid `projectId`, `page`, or flag value
- **THEN** the API SHALL respond with `400`
