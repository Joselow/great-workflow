## ADDED Requirements

### Requirement: Deleting a meeting detaches requirements and tasks
When the owner successfully deletes a meeting, the API SHALL set the meeting id to null on every requirement and every task that pointed at that meeting. It MUST NOT delete those requirements or tasks. Their project id MUST stay as stored. A task's requirement id MUST stay as stored. Requirements and tasks that pointed at a different meeting MUST be unchanged. A delete that responds with `404` MUST NOT change any requirement or task. This cleanup MUST NOT change the existing removal of the meeting, of its card links, and of its log links, and MUST NOT delete the cards or logs themselves.

#### Scenario: Rows stay and lose the meeting
- **WHEN** the owner deletes a meeting that one requirement and one task point at
- **THEN** the meeting SHALL be removed
- **AND** that requirement and that task SHALL still exist
- **AND** their meeting id SHALL be null
- **AND** their project id SHALL be unchanged
- **AND** the task's requirement id SHALL be unchanged

#### Scenario: Another meeting is left alone
- **WHEN** the owner deletes one meeting
- **THEN** a requirement that points at a different meeting SHALL keep that meeting id

#### Scenario: Foreign id changes nothing
- **WHEN** an authenticated user deletes a meeting id they do not own
- **THEN** the API SHALL respond with `404`
- **AND** no requirement or task SHALL change its meeting id

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
