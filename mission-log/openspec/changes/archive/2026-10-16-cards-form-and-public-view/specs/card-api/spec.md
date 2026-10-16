## Purpose

Owns the card resource: persist title, description, color, optional project, prompt flag, and sections, and expose owner write plus a public read by id.

## ADDED Requirements

### Requirement: Persist a card owned by the authenticated user
The API SHALL create a card for the authenticated user with `name`, `description`, `color`, `is_prompt`, optional `project_id`, and `sections`. `meeting_id` MUST be stored as null and MUST NOT be accepted from the client. `user_id` MUST come from the auth token, not the body.

#### Scenario: Create a regular card
- **WHEN** an authenticated user sends a valid create payload with `is_prompt` false and one or more sections
- **THEN** the API SHALL persist the card for that user
- **AND** SHALL return the saved card including its id and sections in order

#### Scenario: Create a prompt card
- **WHEN** an authenticated user sends a valid create payload with `is_prompt` true
- **THEN** the API SHALL persist the card with empty sections
- **AND** SHALL ignore any sections sent in the body

#### Scenario: Create without auth
- **WHEN** a client creates a card without a valid token
- **THEN** the API SHALL respond with `401`

### Requirement: Optional project must belong to the owner
`project_id` MAY be null (free card). When present, the project MUST exist and MUST belong to the same user. A project that is missing or owned by someone else MUST be rejected.

#### Scenario: Free card
- **WHEN** the client omits `project_id` or sends null
- **THEN** the API SHALL persist the card with no project

#### Scenario: Project of another user
- **WHEN** the client sends a `project_id` that is not owned by the authenticated user
- **THEN** the API SHALL reject the request
- **AND** SHALL NOT persist the card

### Requirement: Owner can read and update their card
`GET` and `PUT` for a card id SHALL succeed only when the card exists and `user_id` matches the authenticated user. Update MUST allow changing name, description, color, `is_prompt`, `project_id` (including to null), and sections. Update MUST NOT change `meeting_id` or `user_id`.

#### Scenario: Owner reads their card
- **WHEN** the owner requests their card by id
- **THEN** the API SHALL return the full card they can edit

#### Scenario: Other user reads a private card
- **WHEN** an authenticated user requests a card they do not own
- **THEN** the API SHALL respond with `404`

#### Scenario: Owner updates project and sections
- **WHEN** the owner sends a valid update with a new project (or null) and a new section list
- **THEN** the API SHALL persist those fields
- **AND** SHALL leave `meeting_id` unchanged

### Requirement: Prompt flag clears sections on write
When `is_prompt` is true on create or update, the API MUST persist `sections` as an empty list even if the client sent sections.

#### Scenario: Convert a sectioned card into a prompt
- **WHEN** the owner updates a card that has sections and sets `is_prompt` true
- **THEN** the API SHALL save `is_prompt` true
- **AND** SHALL persist no sections

#### Scenario: Regular card keeps sections
- **WHEN** the owner updates a card with `is_prompt` false and a section list
- **THEN** the API SHALL persist those sections in the given order

### Requirement: Public read by id without authentication
The API SHALL expose an unauthenticated get-by-id that returns only public card fields: id, name, description, color, `is_prompt`, sections, and an optional project summary (name and color) when the card has a project. It MUST NOT return `user_id` or `meeting_id`. A missing id MUST be `404`.

#### Scenario: Anyone opens a public card
- **WHEN** a client requests the public card endpoint with a valid existing id and no token
- **THEN** the API SHALL return the public fields
- **AND** SHALL include the project name and color when the card has a project

#### Scenario: Public card not found
- **WHEN** a client requests the public card endpoint with an unknown id
- **THEN** the API SHALL respond with `404`

#### Scenario: Prompt card on the public endpoint
- **WHEN** the requested card has `is_prompt` true
- **THEN** the response SHALL include empty sections
- **AND** SHALL include name and description
