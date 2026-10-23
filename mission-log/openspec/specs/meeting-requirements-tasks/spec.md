# meeting-requirements-tasks Specification

## Purpose
The meeting form no longer embeds the requirements and tasks workspace. Capture happens in the execution room. The agenda, issues, next steps, qualification, and cards stay on the form.

## Requirements

### Requirement: Agenda, issues, next steps, qualification, and cards stay
This change MUST NOT change the agenda editor, the issues list, the next-steps list, qualification, or the cards panel. Next steps SHALL remain logs. Issues SHALL NOT be linked to a requirement or a task. Deleting the meeting from this form SHALL still be the meeting delete, which detaches requirements and tasks instead of deleting them.

#### Scenario: Next steps are still logs
- **WHEN** the owner adds a next step and saves the meeting
- **THEN** that step SHALL still be stored as a log
- **AND** SHALL NOT be stored as a task

#### Scenario: Issues stay on the meeting
- **WHEN** the owner edits the agenda and the issues and saves
- **THEN** those controls SHALL behave as they did before this change
- **AND** the save SHALL NOT write an issue id onto a requirement or a task
