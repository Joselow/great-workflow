## ADDED Requirements

### Requirement: Additional info fits its text
The additional-info field in the issue frame and on the close act SHALL grow and shrink with its text. Empty, it SHALL keep a short minimum height of about three lines. The field MUST NOT use an inner scrollbar while its text is taller than that minimum; the act column scrolls instead. Both places SHALL keep showing the same meeting field.

#### Scenario: Text grows the field
- **WHEN** the owner types additional info past three lines on the close act
- **THEN** the field SHALL grow to show that text
- **AND** SHALL NOT scroll inside the field

#### Scenario: Deleting text shrinks the field
- **WHEN** the owner deletes text until three lines or fewer remain
- **THEN** the field SHALL shrink
- **AND** SHALL keep the minimum height

#### Scenario: The issue frame uses the same fit
- **WHEN** the owner opens an issue whose additional info is longer than three lines
- **THEN** the issue frame SHALL show that text at the field's grown height
