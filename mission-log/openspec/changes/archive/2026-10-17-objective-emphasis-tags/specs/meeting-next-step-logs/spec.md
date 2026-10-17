## MODIFIED Requirements

### Requirement: A next step becomes a log with source meeting
Create and update SHALL accept `nextSteps`, a list of `{ logId?, description }`. A row whose description is empty or whitespace SHALL be ignored. Each remaining row SHALL be stored as a log for the authenticated user and joined to the meeting with `source` `meeting`. The log `description` SHALL be the trimmed row text. `responsible` SHALL be `Reunión {title} {fecha}`, where `fecha` is the meeting date and time formatted `DD/MM/YY h:mm:ss A`. `tags` SHALL start with `reunión, {project name}`. Keywords taken from the objective SHALL be appended after that prefix, in order, each preceded by `, `. A keyword that matches `reunión` or the project name without regard to case SHALL NOT be appended again. An objective with no keywords SHALL leave `tags` as `reunión, {project name}` only. `tags` SHALL be at most 255 characters. If the project name alone would make that prefix longer than 255 characters, the API SHALL shorten the project name and SHALL keep the `reunión, ` prefix. Keywords that would make `tags` longer than 255 characters SHALL be dropped from the end, and a keyword SHALL NOT be cut in the middle. `completed` and `comment` SHALL be null. `project_id` SHALL be the meeting's project. `user_id` SHALL come from the auth token. Logs joined with `source` `log` SHALL NOT receive these tags.

#### Scenario: Create two next steps
- **WHEN** the owner saves a meeting that has a project and an objective with no keywords, with next steps `"Cerrar el alcance"` and `"Pedir acceso a la API"`
- **THEN** the API SHALL persist two logs with those descriptions
- **AND** SHALL join both to the meeting with `source` `meeting`
- **AND** each log SHALL use that responsible pattern
- **AND** each log's `tags` SHALL be `reunión, {project name}`
- **AND** GET SHALL return both logs with `source` `meeting` and their descriptions

#### Scenario: Objective keywords are appended
- **WHEN** the owner saves a meeting whose objective is `Definir *API* para el _cliente_` and one next step `"Pedir acceso"`
- **THEN** that log's `tags` SHALL be `reunión, {project name}, API, cliente`

#### Scenario: Keywords are not taken from another field
- **WHEN** the owner saves a next step, the objective has no keywords, and the current status contains `*API*`
- **THEN** that log's `tags` SHALL be `reunión, {project name}`

#### Scenario: Keywords that do not fit are dropped
- **WHEN** the owner saves a next step and the objective keywords would make `tags` longer than 255 characters
- **THEN** the API SHALL keep `reunión, {project name}`
- **AND** SHALL append only the keywords that still fit, from the start of the list
- **AND** SHALL store `tags` of at most 255 characters
- **AND** SHALL NOT cut a keyword in the middle

#### Scenario: Blank rows are not stored
- **WHEN** the owner saves next steps `"Avisar al cliente"` and `"   "`
- **THEN** the API SHALL persist one log
- **AND** SHALL NOT persist a log for the blank row

#### Scenario: Responsible stays within the column
- **WHEN** the meeting title plus the date would make `responsible` longer than 100 characters
- **THEN** the API SHALL shorten the title portion
- **AND** SHALL keep the `Reunión` prefix and the date
- **AND** SHALL store a `responsible` of at most 100 characters

#### Scenario: Saving refreshes tags from the current objective
- **WHEN** the owner changes the objective keywords and saves an existing next step
- **THEN** that log's `tags` SHALL use the keywords from the objective just saved

#### Scenario: An attached log keeps its own tags
- **WHEN** the meeting also has a log joined with `source` `log`, and the owner saves next steps
- **THEN** that attached log's `tags` SHALL stay as they were
