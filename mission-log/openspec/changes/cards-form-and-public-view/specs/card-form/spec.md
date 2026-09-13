## Purpose

Authenticated create and edit form for a card: project picker, color, prompt mode, optional sections, and a confirm step before every save.

## ADDED Requirements

### Requirement: One form for create and edit
The app SHALL use the same form view to create a card and to edit an existing one. Create SHALL start empty (aside from defaults). Edit SHALL load the owner's card by id. After a successful create, the user MUST land on the edit route for the new id.

#### Scenario: Open create
- **WHEN** the user opens the new-card route
- **THEN** the form SHALL show empty title and description
- **AND** SHALL be ready to save a new card

#### Scenario: Open edit
- **WHEN** the user opens the edit route with a card they own
- **THEN** the form SHALL show that card's name, description, color, project, prompt flag, and sections

### Requirement: Project defaults to the active project and can be cleared
The form SHALL include a project selector at the top. On create, the selected project MUST default to the current active project when one exists, otherwise none. The user MUST be able to pick any of their projects or none (free card). Changing the selector MUST update the project that will be saved; it MUST NOT change the app's active project.

#### Scenario: Create with an active project
- **WHEN** the user opens create and an active project is set
- **THEN** the selector SHALL start on that project

#### Scenario: Switch to another project
- **WHEN** the user picks a different project in the selector
- **THEN** save SHALL send that project's id
- **AND** the header active project SHALL stay unchanged

#### Scenario: Free card
- **WHEN** the user selects no project
- **THEN** save SHALL send a null project

### Requirement: Prompt mode hides and drops sections
The form SHALL offer a control to mark the card as a prompt. While prompt is on, section editors MUST be hidden and the form MUST keep only title, description, color, and project. Turning prompt on MUST clear sections in the draft immediately. Turning it off MUST leave sections empty until the user adds new ones.

#### Scenario: Mark as prompt
- **WHEN** the user turns prompt on on a card that has sections
- **THEN** the section editors SHALL disappear
- **AND** the draft SHALL have no sections

#### Scenario: Prompt form fields
- **WHEN** prompt is on
- **THEN** the user SHALL still edit title, description, color, and project
- **AND** SHALL NOT see add/reorder/remove section controls

### Requirement: User can add, remove, and reorder sections
When the card is not a prompt, the user SHALL be able to add a section (title + description), remove a section, and change section order. The saved order MUST match the visible order.

#### Scenario: Add a section
- **WHEN** the user adds a section and fills title and description
- **THEN** that section SHALL appear in the form
- **AND** SHALL be included in the next confirmed save

#### Scenario: Remove and reorder
- **WHEN** the user removes one section and moves another up or down
- **THEN** the visible list SHALL reflect that
- **AND** the next confirmed save SHALL persist that order

### Requirement: Save always asks for confirmation
Clicking save MUST open a confirm dialog. The API MUST be called only after the user confirms. Cancel MUST leave the draft unchanged and MUST NOT persist.

#### Scenario: Confirm save
- **WHEN** the user clicks save and confirms
- **THEN** the app SHALL persist the current draft (create or update)

#### Scenario: Cancel save
- **WHEN** the user clicks save and cancels the dialog
- **THEN** the app SHALL NOT call the write API
