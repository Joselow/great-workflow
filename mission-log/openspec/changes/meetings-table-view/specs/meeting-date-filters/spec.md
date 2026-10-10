## Purpose

Let the meetings table be narrowed by a date range through one filters object and a separate control, reusing the list endpoint's existing `from` and `to` query.

## ADDED Requirements

### Requirement: Date filters are a separate control with one object
The meetings view SHALL render a date-filter control separate from the table. Filter state MUST be a single object `{ from, to }` where both values are calendar dates `YYYY-MM-DD` or empty strings. The control MUST edit that object as a whole. The view MUST refetch from the handler that receives the updated object. It MUST NOT use a watcher to refetch when the object changes.

#### Scenario: Control is separate from the table
- **WHEN** the user opens the meetings view
- **THEN** the date-filter control SHALL be visible above the table
- **AND** SHALL expose a start date and an end date

#### Scenario: A date change replaces the whole object
- **WHEN** the user changes the start or the end date
- **THEN** the view SHALL replace `{ from, to }` with the new pair
- **AND** SHALL refetch only from that update, not from a watcher on the object

### Requirement: Default range is the current calendar month
On first load, `from` MUST be the first day of the current calendar month and `to` MUST be the last day of that month. The first list request MUST include that pair.

#### Scenario: Open meetings in October 2026
- **WHEN** the meetings view loads during October 2026
- **THEN** `from` SHALL be `2026-10-01`
- **AND** `to` SHALL be `2026-10-31`
- **AND** the list request SHALL send those query values

### Requirement: A valid range filters meeting date
When both dates are set and `from` is less than or equal to `to`, the list request MUST send `from` and `to` together. The range MUST be inclusive on the meeting date, using the existing list query. The request MUST NOT send a project id from this control. Meetings whose date falls outside the range MUST NOT appear.

#### Scenario: Narrow the month
- **WHEN** the user sets `from` to `2026-10-10` and `to` to `2026-10-12`
- **THEN** the list request SHALL include `from=2026-10-10` and `to=2026-10-12`
- **AND** a meeting on 11 October SHALL be eligible
- **AND** a meeting on 9 October SHALL NOT be returned

### Requirement: Incomplete or reversed ranges do not refetch
If only one date is set, or if `from` is after `to`, the view MUST NOT send a list request. The previous rows MUST stay visible, and the control MUST show that the range is not applied.

#### Scenario: Only the start date is set
- **WHEN** the user clears the end date and leaves a start date
- **THEN** the view SHALL NOT request the list
- **AND** the table SHALL keep the previous rows

#### Scenario: Start is after end
- **WHEN** the user sets `from` later than `to`
- **THEN** the view SHALL NOT request the list
- **AND** the control SHALL show that the range is invalid

### Requirement: Clearing both dates lists without a range
The control MUST offer a way to clear both dates at once. Clearing MUST set the object to `{ from: "", to: "" }` and MUST request the list without `from` and without `to`.

#### Scenario: Clear the range
- **WHEN** the user clears the date filter
- **THEN** both `from` and `to` SHALL be empty
- **AND** the list request SHALL omit `from` and `to`
