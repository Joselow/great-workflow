## ADDED Requirements

### Requirement: Enter key saves the log form
The log entry form SHALL treat the Enter key the same as tabbing out of the last field: triggering create or update depending on whether a log is currently selected.

#### Scenario: Enter while creating a new log
- **WHEN** no log is selected and the user presses Enter while focused in the form
- **THEN** the system SHALL create a new log using the current field values

#### Scenario: Enter while editing an existing log
- **WHEN** a log is selected and the user presses Enter while focused in the form
- **THEN** the system SHALL update the selected log using the current field values

### Requirement: Plus key starts a new log without clearing the writer
While the log form is mounted, pressing the "+" key SHALL clear the currently selected log, returning the form to "create new" mode, without clearing the writer/sidebar content, and SHALL move focus to the description field. This SHALL be the only keyboard shortcut for clearing the selected log — it replaces any prior unguarded shortcut for the same action. It SHALL NOT trigger while the user is typing inside a form field.

#### Scenario: Plus pressed outside of a field with a log selected
- **WHEN** a log is selected and the user presses "+" while focus is not inside an input or textarea
- **THEN** the selected log SHALL be cleared
- **AND** focus SHALL move to the description field
- **AND** the writer content SHALL remain unchanged

#### Scenario: Plus typed inside a field
- **WHEN** the user presses "+" while focus is inside a form input or textarea
- **THEN** the selected log SHALL NOT be cleared
- **AND** the character SHALL be entered into the field normally

### Requirement: Creating or updating a log auto-populates the writer
When a log is created or updated, the system SHALL generate its report text and add it to the writer content, tagged as markdown format, using the append (not overwrite) behavior.

#### Scenario: First log of the session
- **WHEN** a log is created or updated and the writer is currently empty
- **THEN** the generated report SHALL become the writer's content

#### Scenario: Subsequent log with existing writer content
- **WHEN** a log is created or updated and the writer already has content
- **THEN** the generated report SHALL be appended below the existing content, separated by a `---` divider

### Requirement: Finishing a task without a comment saves the writer content
When a task is marked as finished and it has no existing comment, the system SHALL persist the current writer content as the log's comment in the same request that marks it completed.

#### Scenario: Finish without a comment
- **WHEN** the user confirms finishing a task and the log's comment is empty
- **THEN** the update request SHALL include the current writer content as the comment
- **AND** the log SHALL be marked completed in that same request

#### Scenario: Finish with an existing comment
- **WHEN** the user confirms finishing a task and the log already has a comment
- **THEN** the existing comment SHALL be preserved
- **AND** only the completed state SHALL change
