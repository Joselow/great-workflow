# action-template-api Specification

## Purpose

Owner-scoped action templates: a named, colored text or a link to one prompt card, stored for a single module so later flows can reuse it.

## Requirements

### Requirement: A template is stored for the authenticated user
The API SHALL store an action template with an integer id, the authenticated user's id, one module, a name, an action or null, a template string, a color, an active flag, a card id or null, and created and updated timestamps. The user id MUST come from the auth token and MUST NOT be taken from the body. The response MUST NOT include the user id. A request without a valid token MUST be `401`.

#### Scenario: Create with a token
- **WHEN** an authenticated user sends a valid text-mode create
- **THEN** the API SHALL respond with `201`
- **AND** SHALL return the template with a new integer id
- **AND** the stored user SHALL be the token user

#### Scenario: Body tries to set the owner
- **WHEN** the create body includes a user id other than the authenticated user
- **THEN** the stored template SHALL still belong to the authenticated user

#### Scenario: No token
- **WHEN** a client creates, lists, reads, updates, or deletes a template without a valid token
- **THEN** the API SHALL respond with `401`

### Requirement: Module is one of five values
`module` MUST be exactly one of `all`, `log`, `meeting`, `requirement`, or `task`. Any other value, including a cards module, MUST be `400` and MUST NOT be stored. Create and update MUST both accept a module so a template can move from one section to another.

#### Scenario: General template
- **WHEN** the user creates a template with module `all`
- **THEN** the stored module SHALL be `all`

#### Scenario: Cards is not a module
- **WHEN** the user sends module `card` or `cards`
- **THEN** the API SHALL respond with `400`
- **AND** SHALL NOT store that module

#### Scenario: Move to another module
- **WHEN** the owner updates a template from `log` to `meeting` with an otherwise valid body
- **THEN** the stored module SHALL be `meeting`

### Requirement: Name, action, color, and active flag
The name MUST be trimmed text from 1 to 255 characters. A blank name MUST be `400`. `action` MAY be omitted; a blank action MUST be stored as null; a non-blank action MUST be trimmed and MUST be at most 1000 characters. `color` MUST match `#` plus six hex digits. Omitted `isActive` on create MUST be stored as true. Update MUST be able to set `isActive` to false without deleting the row.

#### Scenario: Blank name
- **WHEN** the user submits a name that is empty or only whitespace
- **THEN** the API SHALL respond with `400`
- **AND** SHALL NOT store that name

#### Scenario: Blank action
- **WHEN** the user omits `action` or sends only whitespace
- **THEN** the stored action SHALL be null

#### Scenario: Default active
- **WHEN** the user creates a template without `isActive`
- **THEN** the stored active flag SHALL be true

#### Scenario: Invalid color
- **WHEN** the user sends a color that is not `#` plus six hex digits
- **THEN** the API SHALL respond with `400`

### Requirement: The body is text or one prompt card
Text mode and card mode are exclusive. When `cardId` is null or omitted, `template` MUST be trimmed text from 1 to 20000 characters and the stored card id MUST be null. When `cardId` is present, the card MUST exist, MUST belong to the user, and MUST be a prompt; the API MUST store that card id and MUST store `template` as an empty string, ignoring any template text in the body. A missing card, a card owned by someone else, or a card that is not a prompt MUST be `400` and MUST NOT be stored. A blank template in text mode MUST be `400`.

#### Scenario: Text template
- **WHEN** the user creates a template with a non-empty template and no card id
- **THEN** the stored template SHALL be the trimmed text
- **AND** the stored card id SHALL be null

#### Scenario: Prompt card link
- **WHEN** the user creates a template with the id of a prompt card they own, and also sends template text
- **THEN** the stored card id SHALL be that card
- **AND** the stored template SHALL be an empty string

#### Scenario: Card is not a prompt
- **WHEN** the user sends a card id for a card they own whose prompt flag is false
- **THEN** the API SHALL respond with `400`
- **AND** SHALL NOT store the template

#### Scenario: Card of another user
- **WHEN** the user sends a card id they do not own
- **THEN** the API SHALL respond with `400`
- **AND** SHALL NOT store the template

#### Scenario: Text mode without text
- **WHEN** the user omits `cardId` and sends a blank template
- **THEN** the API SHALL respond with `400`

#### Scenario: Switch from card to text
- **WHEN** the owner updates a linked template with a null card id and a non-empty template
- **THEN** the stored card id SHALL be null
- **AND** the stored template SHALL be that text

### Requirement: The owner can list, read, and update
List MUST return only the authenticated user's templates as a JSON array, oldest created first. An optional `module` query MUST limit the array to that module. An invalid `module` MUST be `400`. Each item MUST include id, module, name, action, template, color, isActive, cardId, card, createdAt, and updatedAt. `card` MUST be `{ id, name, color, description }` when the linked card still belongs to the user and is still a prompt, and MUST be null otherwise. Get or update of a missing id, a non-integer id, or another user's id MUST be `404` and MUST NOT change another user's row.

#### Scenario: List is the owner's set
- **WHEN** an authenticated user lists templates
- **THEN** the API SHALL return only that user's templates
- **AND** SHALL order them by created time ascending

#### Scenario: Filter by module
- **WHEN** the user lists templates with `module=log`
- **THEN** every returned template SHALL have module `log`

#### Scenario: Linked card summary
- **WHEN** the user reads a template whose card id points at their prompt card
- **THEN** `card` SHALL include that card's id, name, color, and description
- **AND** the response SHALL NOT include the user id

#### Scenario: Other user's id
- **WHEN** an authenticated user reads a template they do not own
- **THEN** the API SHALL respond with `404`
- **AND** SHALL NOT change that template

### Requirement: Deleting a template deletes only that action
Delete MUST remove the action template row and nothing else. If that row's card id points at a card, the card MUST still exist afterward with the same name, description, color, prompt flag, and sections. Delete MUST NOT call card deletion. Delete of a missing id, a non-integer id, or another user's template MUST be `404` and MUST NOT delete a card. A successful delete MUST respond with `200`.

#### Scenario: Delete a linked template
- **WHEN** the owner deletes a template whose card id points at a prompt card
- **THEN** the API SHALL respond with `200`
- **AND** that template SHALL no longer be returned in the list
- **AND** the card SHALL still be returned by the owner's card read

#### Scenario: Delete a text template
- **WHEN** the owner deletes a template whose card id is null
- **THEN** that template SHALL be removed
- **AND** no card SHALL be deleted

#### Scenario: Delete does not remove another user's card
- **WHEN** an authenticated user deletes a template id they do not own
- **THEN** the API SHALL respond with `404`
- **AND** SHALL NOT delete any card

### Requirement: Removing the prompt card keeps the template
Deleting a card the user owns MUST set `card_id` null on that user's templates that pointed at it, and MUST NOT delete those templates. Updating that card so it is no longer a prompt MUST do the same. Templates that pointed at a different card MUST be unchanged.

#### Scenario: Delete the linked card
- **WHEN** the owner deletes a prompt card that templates of theirs point at
- **THEN** those templates SHALL still exist
- **AND** their card id SHALL be null

#### Scenario: Card stops being a prompt
- **WHEN** the owner updates a linked card so its prompt flag is false
- **THEN** templates that pointed at that card SHALL keep their rows
- **AND** their card id SHALL be null

#### Scenario: Another card is untouched
- **WHEN** the owner deletes a card that a template does not point at
- **THEN** that template's card id SHALL stay as it was
