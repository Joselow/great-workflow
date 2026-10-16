## Purpose

Lets the owner mark a card as meeting-related with `fl_meeting`, independently of prompt mode and of any future meeting link.

## ADDED Requirements

### Requirement: Persist fl_meeting on the card
The API SHALL store `fl_meeting` as a boolean that defaults to false. Create and update MUST accept optional `flMeeting`. On create, omit MUST save false. On update, omit MUST leave the stored value unchanged. `meeting_id` MUST stay unused and MUST NOT be set from this flag.

#### Scenario: Create marked for meeting
- **WHEN** an authenticated user creates a card with `flMeeting` true
- **THEN** the API SHALL persist `fl_meeting` true
- **AND** SHALL leave `meeting_id` null

#### Scenario: Create without the flag
- **WHEN** an authenticated user creates a card and omits `flMeeting`
- **THEN** the API SHALL persist `fl_meeting` false

#### Scenario: Update keeps the flag
- **WHEN** the owner updates other fields and omits `flMeeting`
- **THEN** the API SHALL leave `fl_meeting` unchanged

### Requirement: Form can toggle Meeting next to Prompt
The create/edit form SHALL show a Meeting control beside Prompt. The user MUST be able to turn it on or off before confirm. Meeting MUST NOT hide or clear sections. Prompt and Meeting MUST be independently settable. On create, Meeting MUST start off. On edit, it MUST show the stored value.

#### Scenario: Mark meeting on create
- **WHEN** the user turns Meeting on and confirms save
- **THEN** the write payload SHALL include `flMeeting` true

#### Scenario: Meeting does not drop sections
- **WHEN** the user turns Meeting on on a card that has sections
- **THEN** the section editors SHALL stay visible
- **AND** the draft SHALL keep those sections

#### Scenario: Both flags
- **WHEN** the user turns Prompt and Meeting on
- **THEN** save SHALL send `isPrompt` true and `flMeeting` true
- **AND** sections SHALL still be cleared only because Prompt is on

### Requirement: Read payloads include the flag
Owner get, owner list items, and the public card payload MUST include `flMeeting` reflecting the stored value.

#### Scenario: Owner reads a meeting card
- **WHEN** the owner fetches a card with `fl_meeting` true
- **THEN** the response SHALL include `flMeeting` true

#### Scenario: Public card shows the flag
- **WHEN** a client fetches the public card and `fl_meeting` is true
- **THEN** the public payload SHALL include `flMeeting` true
