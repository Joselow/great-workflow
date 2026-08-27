## ADDED Requirements

### Requirement: Filter bar shows status and period controls
The logs view SHALL render a filter bar with two status pills (`Finalizado`, `No Finalizado`) and period controls (month label with previous/next, plus exactly four week chips). Styling MUST follow the existing mission-log palette (pills, brand colors, dark mode): idle chips use muted borders; selected period chips use one accent (orange); status pills use cyan (Finalizado) and pink (No Finalizado). Selected vs idle MUST be obvious in light and dark mode.

#### Scenario: Bar visible on logs view
- **WHEN** the user opens the logs view
- **THEN** the filter bar SHALL be visible above the log table
- **AND** SHALL show status pills, the month/week controls, and an advanced-dates toggle
- **AND** SHALL show exactly four week chips

### Requirement: Default period is current month and current week
On load, the selected month MUST be the current calendar month and the selected week MUST be the current slice of that month. Weeks are always: 1–7, 8–14, 15–21, and 22 through end of month. There is never a fifth week chip. If today is day 22 or later, week 4 MUST be selected. Advanced dates MUST default to off.

#### Scenario: Open logs in August on day 26
- **WHEN** the logs view loads on 26 August
- **THEN** the month control SHALL show August
- **AND** week 4 SHALL be selected
- **AND** the list request SHALL use `from` and `to` covering 22–31 August

### Requirement: User can change month and week
The user SHALL be able to move to the previous or next month and to select any week chip of the visible month. Changing month MUST select the current week if that month is the current calendar month, otherwise week 1. Changing month or week MUST refetch logs for the derived `from`/`to`.

#### Scenario: Select another week
- **WHEN** the user clicks Semana 2
- **THEN** that week SHALL become selected
- **AND** the list SHALL reload for days 8–14 of the visible month

#### Scenario: Change to another month
- **WHEN** the user moves to a month that is not the current calendar month
- **THEN** week 1 of that month SHALL be selected
- **AND** the list SHALL reload for days 1–7 of that month

### Requirement: Status filter is exclusive and optional
At most one status pill SHALL be selected. Selecting a pill MUST refetch with `completed=true` or `completed=false`. Selecting the already-active pill MUST clear the status filter and refetch without `completed`. Default MUST be no status filter.

#### Scenario: Filter unfinished
- **WHEN** the user clicks No Finalizado
- **THEN** that pill SHALL appear selected
- **AND** the list request SHALL include `completed=false`

#### Scenario: Clear status filter
- **WHEN** No Finalizado is selected and the user clicks it again
- **THEN** neither status pill SHALL be selected
- **AND** the list request SHALL omit `completed`

### Requirement: Filters stay scoped to the active project
Filter changes MUST keep using the active project's id. Changing the active project MUST refetch with the current filters for the new project.

#### Scenario: Project change
- **WHEN** the user switches active project while filters are set
- **THEN** the logs list SHALL reload for the new project using the same status and period filters

### Requirement: Advanced dates toggle swaps week chips for a free range
The filter bar SHALL include a compact “Fechas avanzadas” control. When on, month prev/next and week chips MUST hide and two date inputs (fecha inicio, fecha fin) MUST show. When off, the date inputs MUST hide and month + four week chips MUST show again, using the stored month and week. Filter state MUST stay in the logs view; the bar remains presentational (props + emits). Turning advanced on SHOULD prefill start/end from the currently selected week. If start is after end, the view MUST NOT fetch and MUST show an error toast.

#### Scenario: Turn advanced dates on
- **WHEN** the user turns Fechas avanzadas on
- **THEN** month navigation and week chips SHALL hide
- **AND** start and end date inputs SHALL appear, prefilled from the selected week range
- **AND** the list SHALL use those dates as `from` and `to`

#### Scenario: Turn advanced dates off
- **WHEN** the user turns Fechas avanzadas off
- **THEN** the date inputs SHALL hide
- **AND** month navigation and four week chips SHALL show
- **AND** the list SHALL reload for the selected month and week

#### Scenario: Invalid custom range
- **WHEN** the user sets a start date after the end date
- **THEN** the view SHALL not request logs with that range
- **AND** SHALL show an error toast

#### Scenario: Custom range fetch
- **WHEN** the user picks a valid start and end that is not a preset week
- **THEN** the list request SHALL include those dates as `from` and `to`
