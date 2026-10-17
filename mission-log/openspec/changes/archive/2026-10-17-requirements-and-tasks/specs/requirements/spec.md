## Purpose

Owner-scoped requirements that always belong to a project and optionally to one meeting, so a piece of work can be named without using meeting issues or next-step logs.

## ADDED Requirements

### Requirement: A requirement is stored for the authenticated user
The API SHALL store a requirement with an id, the authenticated user's id, a project id, a meeting id or null, a name, and created and updated timestamps. The user id MUST come from the auth token and MUST NOT be taken from the body. The stored resource MUST NOT include a description, status, color, due date, issue id, or log id.

#### Scenario: Create for the active project
- **WHEN** an authenticated user creates a requirement with a name and a project id they own, and omits the meeting
- **THEN** the API SHALL respond with `201`
- **AND** SHALL return the requirement with a new id, that project id, a null meeting id, and the trimmed name
- **AND** the user id SHALL be the token user

#### Scenario: Body tries to set the owner
- **WHEN** the create body includes a user id other than the authenticated user
- **THEN** the stored requirement SHALL still belong to the authenticated user

#### Scenario: Forbidden link fields
- **WHEN** the create or update body includes an issue id or a log id
- **THEN** the API SHALL respond with `400`
- **AND** SHALL NOT create or change a requirement

#### Scenario: No token
- **WHEN** a client creates a requirement without a valid token
- **THEN** the API SHALL respond with `401`

### Requirement: The project is required and must be owned
A requirement MUST have a project id. A missing project, or a project the user does not own, MUST be rejected with `400` and MUST NOT be stored.

#### Scenario: Missing project
- **WHEN** the user creates a requirement with a name and without a project id or a meeting id
- **THEN** the API SHALL respond with `400`
- **AND** SHALL NOT store a requirement

#### Scenario: Project of another user
- **WHEN** the user creates a requirement with a project id they do not own
- **THEN** the API SHALL respond with `400`
- **AND** SHALL NOT store a requirement

### Requirement: A meeting copies its project onto the requirement
When the user creates a requirement with a meeting id, the API SHALL set the requirement's project id from that meeting's project id and SHALL set the meeting id to that meeting. The meeting MUST belong to the user and MUST have a project. If the body also sends a project id, it MUST equal the meeting's project id. A requirement MUST reference at most one meeting.

#### Scenario: Meeting has a project
- **WHEN** the user creates a requirement with a meeting id whose meeting they own and that meeting has a project
- **THEN** the stored project id SHALL equal that meeting's project id
- **AND** the stored meeting id SHALL equal that meeting

#### Scenario: Meeting has no project
- **WHEN** the user creates a requirement with a meeting id and that meeting has no project
- **THEN** the API SHALL respond with `400`
- **AND** SHALL NOT store a requirement

#### Scenario: Meeting is missing or not owned
- **WHEN** the meeting id does not exist or belongs to another user
- **THEN** the API SHALL respond with `400`
- **AND** SHALL NOT store a requirement

#### Scenario: Body project disagrees with the meeting
- **WHEN** the body sends a meeting id and a project id that is not that meeting's project
- **THEN** the API SHALL respond with `400`
- **AND** SHALL NOT store a requirement

### Requirement: The name is required text
The name MUST be trimmed text from 1 to 255 characters. A blank or whitespace-only name MUST be rejected with `400`.

#### Scenario: Blank name
- **WHEN** the user submits a name that is empty or only whitespace
- **THEN** the API SHALL respond with `400`
- **AND** SHALL NOT store that name

#### Scenario: Name is trimmed
- **WHEN** the user submits a name with surrounding spaces within the length limit
- **THEN** the stored name SHALL be the trimmed text

### Requirement: Update renames and does not move the requirement
An update SHALL change the name only. The project id and the meeting id MUST stay as stored. A body that includes a project id or a meeting id MUST be rejected with `400` and MUST NOT change the row. A missing requirement, or one owned by another user, MUST be `404`.

#### Scenario: Rename
- **WHEN** the owner updates their requirement with a new valid name and no project or meeting field
- **THEN** the API SHALL respond with `200`
- **AND** SHALL return the new name
- **AND** the project id and meeting id SHALL be unchanged

#### Scenario: Attempt to move it
- **WHEN** the update body includes a project id or a meeting id
- **THEN** the API SHALL respond with `400`
- **AND** the stored project id and meeting id SHALL stay unchanged

#### Scenario: Someone else's requirement
- **WHEN** an authenticated user updates or reads a requirement they do not own
- **THEN** the API SHALL respond with `404`

### Requirement: List is the owner's project, newest first
`GET` list MUST require a project id and MUST return only that user's requirements for that project, ordered by creation time descending. There is no page parameter in v1; the response SHALL be the full matching list. An optional meeting id MUST further limit the list to rows that have both that project id and that meeting id. A requirement that still points at the meeting but kept an older project id MUST remain on that older project's list and MUST NOT appear in the new project's meeting list. A missing or unowned project or meeting MUST be `400`. When the meeting's current project is not the requested project, the API MUST respond with `400`.

#### Scenario: List the project
- **WHEN** the owner lists requirements with a project id they own
- **THEN** the API SHALL return every requirement of that user and project
- **AND** a newer requirement SHALL appear before an older one
- **AND** the body SHALL be the list itself, not a page object

#### Scenario: List one meeting inside a project
- **WHEN** the owner also passes a meeting id they own whose current project is that project
- **THEN** the API SHALL return only requirements that have both that project id and that meeting id
- **AND** SHALL NOT return requirements of the same project whose meeting id is null

#### Scenario: Meeting project was changed earlier
- **WHEN** a requirement still has this meeting id but a previous project id, and the owner lists the meeting's current project with that meeting id
- **THEN** that requirement SHALL NOT be in the response
- **AND** it SHALL still be returned when listing the previous project without a meeting filter

#### Scenario: List without a project
- **WHEN** the owner lists requirements without a project id
- **THEN** the API SHALL respond with `400`

### Requirement: Deleting a requirement keeps its tasks
Deleting a requirement the user owns SHALL remove that requirement and SHALL set `requirement_id` to null on tasks that pointed at it. Those tasks MUST keep the project id and meeting id they already had. The API MUST NOT delete those tasks. On success both outcomes SHALL be visible together. A missing or unowned requirement id MUST be `404`.

#### Scenario: Tasks stay after the requirement is gone
- **WHEN** the owner deletes a requirement that two of their tasks point at
- **THEN** the API SHALL respond with `200`
- **AND** those two tasks SHALL still exist
- **AND** their requirement id SHALL be null
- **AND** their project id and meeting id SHALL be the values stored before the delete

#### Scenario: Other requirements stay
- **WHEN** the owner deletes one requirement
- **THEN** another requirement of the same project SHALL remain
- **AND** a task that pointed at the other requirement SHALL keep that requirement id
