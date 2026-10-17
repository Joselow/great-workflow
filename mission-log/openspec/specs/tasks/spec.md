# tasks Specification

## Purpose
Owner-scoped tasks that start from a project, from a meeting, or from a requirement, with one optional meeting, one optional requirement, a description, and a completed flag.

## Requirements

### Requirement: A task is stored for the authenticated user
The API SHALL store a task with an id, the authenticated user's id, a project id, a meeting id or null, a requirement id or null, a name, a description, a completed flag, and created and updated timestamps. The id MUST be a UUID, not a serial integer. The user id MUST come from the auth token and MUST NOT be taken from the body. The stored task MUST NOT include an issue id or a log id. A task MUST reference at most one meeting and at most one requirement.

#### Scenario: Defaults
- **WHEN** an authenticated user creates a task with a name and a project they own, and omits description, completed, meeting, and requirement
- **THEN** the API SHALL respond with `201`
- **AND** the description SHALL be an empty string
- **AND** completed SHALL be false
- **AND** the meeting id and requirement id SHALL be null
- **AND** the user id SHALL be the token user

#### Scenario: Forbidden link fields
- **WHEN** the create or update body includes an issue id or a log id
- **THEN** the API SHALL respond with `400`
- **AND** SHALL NOT create or change a task

#### Scenario: No token
- **WHEN** a client creates a task without a valid token
- **THEN** the API SHALL respond with `401`

### Requirement: A project-only task has no meeting and no requirement
When the body has a project id and no meeting id and no requirement id, the API SHALL store that project id, a null meeting id, and a null requirement id. The project MUST belong to the user. Otherwise the API SHALL respond with `400` and MUST NOT store the task.

#### Scenario: Project only
- **WHEN** the user creates a task with a name and a project they own, and without a meeting or requirement
- **THEN** the stored project id SHALL be that project
- **AND** the meeting id and requirement id SHALL be null

#### Scenario: Project is not owned
- **WHEN** the project id does not exist or belongs to another user
- **THEN** the API SHALL respond with `400`
- **AND** SHALL NOT store the task

### Requirement: A meeting-only task copies the meeting's project
When the body has a meeting id and no requirement id, the API SHALL set the meeting id to that meeting, SHALL set the project id from that meeting's project, and SHALL leave the requirement id null. The meeting MUST belong to the user and MUST have a project. If the body also sends a project id, it MUST equal the meeting's project. Otherwise the API SHALL respond with `400` and MUST NOT store the task.

#### Scenario: Meeting has a project
- **WHEN** the user creates a task with a meeting they own that has a project, and without a requirement
- **THEN** the stored project id SHALL equal that meeting's project id
- **AND** the stored meeting id SHALL equal that meeting
- **AND** the requirement id SHALL be null

#### Scenario: Meeting has no project
- **WHEN** the user creates a task from a meeting that has no project
- **THEN** the API SHALL respond with `400`
- **AND** SHALL NOT store the task

#### Scenario: Meeting is missing or not owned
- **WHEN** the meeting id does not exist or belongs to another user
- **THEN** the API SHALL respond with `400`
- **AND** SHALL NOT store the task

### Requirement: Linking a requirement copies its project and meeting
When a requirement id is set on create or on update, the API SHALL load that requirement and SHALL set the task's project id and meeting id from it, including when the requirement's meeting id is null. The requirement MUST belong to the user. If the body also sends a project id or a meeting id, each one that is sent MUST equal the requirement's value, treating null as equal to null. A conflicting pair MUST be `400` and MUST NOT be stored. A missing or unowned requirement MUST be `400`.

#### Scenario: Requirement has a meeting
- **WHEN** the user creates a task with a requirement they own and that requirement has a meeting
- **THEN** the task's project id SHALL equal the requirement's project id
- **AND** the task's meeting id SHALL equal the requirement's meeting id

#### Scenario: Requirement has no meeting
- **WHEN** the user creates a task with a requirement whose meeting id is null
- **THEN** the task's meeting id SHALL be null
- **AND** the task's project id SHALL equal the requirement's project id

#### Scenario: Body disagrees with the requirement
- **WHEN** the body sends a requirement id and a project id or meeting id that is not the requirement's
- **THEN** the API SHALL respond with `400`
- **AND** SHALL NOT store that pair

#### Scenario: Requirement is missing or not owned
- **WHEN** the requirement id does not exist or belongs to another user
- **THEN** the API SHALL respond with `400`
- **AND** SHALL NOT store or relink the task

### Requirement: Unlinking keeps the task where it is
Setting the requirement id to null SHALL clear only that link. The task's project id and meeting id MUST remain the values already stored.

#### Scenario: Clear the requirement
- **WHEN** the owner updates a task that has a requirement and sends a null requirement id
- **THEN** the stored requirement id SHALL be null
- **AND** the project id and meeting id SHALL stay as they were before the update

### Requirement: Name, description, and completed follow these rules
The name MUST be trimmed text from 1 to 255 characters. The description MUST be text and MUST be stored as an empty string when omitted. Completed MUST be a boolean, MUST default to false, and MUST NOT be stored as null. A blank name MUST be `400`.

#### Scenario: Blank name
- **WHEN** the user submits a name that is empty or only whitespace
- **THEN** the API SHALL respond with `400`
- **AND** SHALL NOT store that name

#### Scenario: Description is kept
- **WHEN** the user creates a task with a description
- **THEN** the stored description SHALL be that text

### Requirement: Update changes the task fields without moving it by hand
An update SHALL accept a name, a description, a completed flag, and a requirement id. At least one of those fields MUST be present. Omitted fields MUST stay as stored. The client MUST NOT send a project id or a meeting id on update; a body that includes either MUST be `400` and MUST NOT change the row. The project id and meeting id change only when a requirement id is set, by copying that requirement. A missing task, or a task owned by another user, MUST be `404` on read, update, and delete.

#### Scenario: Edit the text
- **WHEN** the owner updates the name and description and omits the requirement id
- **THEN** the name and description SHALL change
- **AND** the requirement id, project id, and meeting id SHALL stay as stored

#### Scenario: Client sends a project on update
- **WHEN** the update body includes a project id or a meeting id
- **THEN** the API SHALL respond with `400`
- **AND** the stored project id and meeting id SHALL stay unchanged

#### Scenario: Someone else's task
- **WHEN** an authenticated user reads a task they do not own
- **THEN** the API SHALL respond with `404`

### Requirement: Completed can be set without editing the rest
`PATCH` with a boolean `completed` SHALL set that flag and SHALL leave the name, description, requirement id, project id, and meeting id unchanged. A body that includes any other field MUST be `400` and MUST NOT change the task.

#### Scenario: Mark done
- **WHEN** the owner sends `PATCH` with `completed` true and no other fields
- **THEN** the API SHALL respond with `200`
- **AND** completed SHALL be true
- **AND** the name and description SHALL be unchanged

#### Scenario: Patch tries to rename
- **WHEN** the `PATCH` body includes a name as well as completed
- **THEN** the API SHALL respond with `400`
- **AND** the stored name and completed flag SHALL stay unchanged

### Requirement: List is the owner's project, newest first
`GET` list MUST require a project id and MUST return only that user's tasks for that project, ordered by creation time descending. There is no page parameter in v1; the response SHALL be the full matching list. Optional filters MUST be combinable and MUST narrow that project: a meeting id, a requirement id, and completed. An omitted requirement filter MUST NOT filter by requirement. The literal requirement filter `null` MUST return only tasks whose requirement id is null. A requirement uuid MUST return only tasks of that requirement. An omitted completed filter MUST return both done and not done. `completed=true` and `completed=false` MUST filter to that flag. A missing or unowned project, meeting, or requirement used as a filter MUST be `400`. When the meeting's current project is not the requested project, or the requirement belongs to another project, the API MUST respond with `400`. A task that still points at the meeting but kept an older project id MUST remain on that older project's list.

#### Scenario: List the project
- **WHEN** the owner lists tasks with a project id they own and no other filter
- **THEN** the API SHALL return every task of that user and project
- **AND** a newer task SHALL appear before an older one
- **AND** the body SHALL be the list itself, not a page object

#### Scenario: Pending only
- **WHEN** the owner lists with `completed=false`
- **THEN** every returned task SHALL have completed false
- **AND** a completed task of that project SHALL be absent

#### Scenario: Without a requirement
- **WHEN** the owner lists with the requirement filter `null`
- **THEN** every returned task SHALL have a null requirement id
- **AND** a task linked to a requirement SHALL be absent

#### Scenario: One requirement
- **WHEN** the owner lists with a requirement id they own in that project
- **THEN** every returned task SHALL point at that requirement

#### Scenario: List without a project
- **WHEN** the owner lists tasks without a project id
- **THEN** the API SHALL respond with `400`

### Requirement: Deleting a task deletes only that row
Deleting a task the user owns SHALL remove that task and MUST NOT delete its requirement or its meeting. A missing or unowned task id MUST be `404`.

#### Scenario: Requirement survives
- **WHEN** the owner deletes a task that points at a requirement
- **THEN** the API SHALL respond with `200`
- **AND** the task SHALL be gone
- **AND** the requirement SHALL still exist
