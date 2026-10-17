# objective-emphasis Specification

## Purpose
Recognize bold and italic spans in the meeting objective so those words can be reused as keywords, and ignore the same marks on every other meeting field.

## Requirements

### Requirement: The objective stores WhatsApp markers
The objective, the current status, and each agenda row SHALL be edited in a rich text field that shows bold and italic. The owner SHALL mark text with Ctrl+B and Ctrl+I. The form SHALL NOT show the `*` or `_` characters for that formatting. Saving SHALL store those fields as plain text, with bold as `*asterisks*` and italic as `_underscores_`. The form SHALL NOT add a separate keywords field.

#### Scenario: Markers round-trip
- **WHEN** the owner writes an objective `Cerrar el *alcance* con el _cliente_` and saves
- **THEN** the stored objective SHALL be `Cerrar el *alcance* con el _cliente_`

#### Scenario: Helper text, not a new field
- **WHEN** the meeting form shows the objective
- **THEN** the objective SHALL show a short hint, `Ctrl+B` in bold and `Ctrl+I` in italic
- **AND** that hint SHALL NOT explain the tags and SHALL NOT show `*` or `_` marker characters
- **AND** that helper text SHALL NOT be an additional input

### Requirement: Ctrl+B and Ctrl+I wrap the selection
While focus is in the objective, the current status, or an agenda row, Ctrl+B SHALL show the selection in bold and Ctrl+I SHALL show it in italic. The same shortcut SHALL remove that formatting. The stored text SHALL use `*` for bold and `_` for italic. The shortcut SHALL NOT change the title or any other field. The objective and each agenda row SHALL stay at most 255 characters; when wrapping would pass that limit, the text SHALL stay unchanged.

#### Scenario: Bold the selection
- **WHEN** the owner selects `alcance` in the objective and presses Ctrl+B
- **THEN** the field SHALL show `alcance` in bold
- **AND** the stored objective SHALL contain `*alcance*`

#### Scenario: Italic the selection
- **WHEN** the owner selects `cliente` in the objective and presses Ctrl+I
- **THEN** the field SHALL show `cliente` in italic
- **AND** the stored objective SHALL contain `_cliente_`

#### Scenario: The same shortcut removes the marker
- **WHEN** the owner selects `alcance` inside `*alcance*` and presses Ctrl+B
- **THEN** the objective SHALL contain `alcance` without those asterisks

#### Scenario: No selection starts bold typing
- **WHEN** the caret is in the objective with nothing selected and the owner presses Ctrl+B and types `API`
- **THEN** the field SHALL show `API` in bold
- **AND** the stored objective SHALL contain `*API*`
- **AND** the field SHALL NOT show asterisk characters

#### Scenario: Another field is unchanged
- **WHEN** focus is in the title and the owner presses Ctrl+B
- **THEN** the title SHALL stay unchanged

### Requirement: Keywords come only from the objective
A keyword SHALL be the trimmed text inside a `*...*` span or a `_..._` span in the objective. The opening and closing marker MUST be on the same line. The opener MUST sit at the start of the line or immediately after whitespace. The closer MUST sit at the end of the line, immediately before whitespace, or immediately before one of `. , ; : ! ?`. Empty or whitespace-only inner text SHALL NOT be a keyword. A span marked as both bold and italic (`*_word_*` or `_*word*_`) SHALL yield that inner text once. The same keyword, compared without regard to case, SHALL appear once, keeping the first spelling. Title, current status, agenda, participants, summary, lessons, and next-step text SHALL NOT supply keywords.

#### Scenario: Bold and italic in the objective
- **WHEN** the objective is `Definir *API* para el _cliente_`
- **THEN** the keywords SHALL be `API` and `cliente`, in that order

#### Scenario: A phrase is one keyword
- **WHEN** the objective is `Acordar *cerrar alcance* hoy`
- **THEN** the keywords SHALL be `cerrar alcance`

#### Scenario: Bold and italic on the same word
- **WHEN** the objective is `Priorizar *_API_*`
- **THEN** the keywords SHALL be `API`

#### Scenario: Repeated word
- **WHEN** the objective is `Revisar *API* y luego _api_`
- **THEN** the keywords SHALL be `API`

#### Scenario: Marks in another field are ignored
- **WHEN** the objective is `Alinear el plan` and the current status contains `*API*`
- **THEN** the keywords SHALL be empty

#### Scenario: An underscore inside a word is not a keyword
- **WHEN** the objective is `Revisar foo_bar_baz`
- **THEN** the keywords SHALL be empty

#### Scenario: Unclosed mark is not a keyword
- **WHEN** the objective is `Revisar *API con el cliente`
- **THEN** the keywords SHALL be empty

#### Scenario: Mark broken by a newline is not a keyword
- **WHEN** the objective has `*API` at the end of one line and `cliente*` at the start of the next
- **THEN** the keywords SHALL be empty
