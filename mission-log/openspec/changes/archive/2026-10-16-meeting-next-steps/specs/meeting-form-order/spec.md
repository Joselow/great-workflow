## Purpose

Show the meeting form in the order the meeting is told, with the title as a heading and again as the field you type, and with next steps as plain text rows that come back as the logs born from that meeting.

## ADDED Requirements

### Requirement: The left column follows the meeting order
On the meeting form, the left column SHALL show, from top to bottom: the title as text, the objective, the current status, the title as an input, the agenda, the next steps, the estimated time, the participants, and the date and time. The text title SHALL show the same value as the title input and SHALL NOT be an editable field. The title input SHALL be the control that edits the title. The date and time control SHALL sit after the participants. Cards, summary, lessons, and the qualify action SHALL remain on the right.

#### Scenario: Type the title
- **WHEN** the owner types a title in the title input
- **THEN** the heading at the top SHALL show that same title
- **AND** the heading SHALL NOT be an input

#### Scenario: Date is last
- **WHEN** the owner looks at the left column
- **THEN** the date and time SHALL appear below the participants
- **AND** the estimated time SHALL appear above the participants and below the next steps

### Requirement: Next steps are text rows without color
The form SHALL show a **Siguientes pasos** list. Each row SHALL be one text field. The list SHALL let the owner add a row and remove a row. It SHALL NOT offer a color control. The agenda SHALL keep its color control. Saving SHALL send the non-empty rows as `nextSteps`. A row of only whitespace SHALL NOT be sent as a step.

#### Scenario: Add a step
- **WHEN** the owner adds a row and writes `"Cerrar el alcance"`
- **THEN** the save payload SHALL include that description in `nextSteps`
- **AND** the row SHALL NOT include a color

#### Scenario: Empty step is omitted
- **WHEN** the owner leaves a next-step row blank and saves
- **THEN** the payload SHALL NOT include that blank row

#### Scenario: Missing project blocks the save
- **WHEN** the meeting has no project and a next step has text
- **THEN** the form SHALL NOT send the save
- **AND** SHALL tell the owner that a project is required

### Requirement: Reloading restores only meeting-born steps
Opening a saved meeting SHALL fill **Siguientes pasos** with the descriptions of logs whose join `source` is `meeting`. Logs whose join `source` is `log` SHALL NOT appear in that list. After a successful save, the rows SHALL show the stored descriptions and SHALL keep the log id of each saved step so a later save updates them.

#### Scenario: Open a meeting with both kinds of logs
- **WHEN** the owner opens a meeting that has one `source` `meeting` log and one `source` `log` log
- **THEN** **Siguientes pasos** SHALL show only the meeting-born description

#### Scenario: Save and stay on the form
- **WHEN** the owner saves a new next step and the request succeeds
- **THEN** that row SHALL show the saved description
- **AND** SHALL carry the new log id for the next save
