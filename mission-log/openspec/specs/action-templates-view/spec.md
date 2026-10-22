# action-templates-view Specification

## Purpose

The Action Templates board lets the owner configure one set of actions per module, with text or a linked prompt card, without leaving the page for a separate editor.

## Requirements

### Requirement: The board is five module sections
The authenticated route `/action-templates` SHALL show the title **Action Templates** and five sections, in this order: **Todos**, **Logs**, **Reuniones**, **Requerimientos**, **Tareas**. **Todos** lists only templates whose module is `all`. **Logs** lists `log`. **Reuniones** lists `meeting`. **Requerimientos** lists `requirement`. **Tareas** lists `task`. The page MUST NOT show a Cards section. From the `lg` breakpoint, **Todos** spans the full width and the other four sections sit in two columns. Below `lg`, the five sections stack in the same order. The page MUST NOT grow wider than the viewport.

#### Scenario: Open the board
- **WHEN** an authenticated user opens `/action-templates`
- **THEN** the app SHALL show those five sections in that order
- **AND** SHALL NOT show a Cards section

#### Scenario: Narrow board
- **WHEN** the viewport is below `lg`
- **THEN** the five sections SHALL stack in that order
- **AND** SHALL remain within the viewport width

### Requirement: The list does not follow the active project
The board SHALL load the owner's templates without a project filter. Changing or clearing the active project MUST NOT change which templates are shown and MUST NOT close an open modal by itself.

#### Scenario: Switch project
- **WHEN** the owner changes the active project while the board is open
- **THEN** the same templates SHALL remain listed

### Requirement: A section row shows the template
Each template SHALL appear only in its module section. The row MUST show a color swatch and the name. When the template's card summary is present, the row MUST also show a link icon and that card's name. When the card summary is null, the row MUST NOT show a card chip. An inactive template MUST stay in the list and MUST look quieter than an active one. The row MUST offer edit and delete. The row MUST NOT use a radio control.

#### Scenario: Text template in Logs
- **WHEN** a template has module `log`, a color, a name, and no card summary
- **THEN** it SHALL appear in **Logs** only
- **AND** the row SHALL show that color and name
- **AND** SHALL NOT show a card chip

#### Scenario: Linked card
- **WHEN** a template has a card summary
- **THEN** its row SHALL show a link icon and the card name

#### Scenario: Inactive
- **WHEN** a template is inactive
- **THEN** it SHALL remain in its section
- **AND** SHALL be visually quieter than an active template in that section

### Requirement: Each section can add a template
Every section SHALL offer a **+** control. Activating it MUST open the create modal with that section's module already selected, **Texto** selected, the color picker on the neutral default, **Activa** on, and empty name, action, and template. The modal MUST include **Nombre**, the existing color picker, optional **Acción**, **Activa**, a module select limited to the five modules, and the **Texto** / **Card** choice. **Guardar** on an invalid form MUST leave the modal open.

#### Scenario: Add from Reuniones
- **WHEN** the owner activates **+** on **Reuniones**
- **THEN** the create modal SHALL open with module meeting selected
- **AND** **Texto** SHALL be the selected content mode

#### Scenario: Save text
- **WHEN** the owner enters a name and a template, leaves **Texto** selected, and saves
- **THEN** the app SHALL create the template with no card
- **AND** the new row SHALL appear in the section for the selected module
- **AND** the modal SHALL close

### Requirement: Edit uses the same modal
Edit MUST open the same modal filled from the template. **Texto** MUST be selected when the card summary is null, and the template text MUST be shown. **Card** MUST be selected when the card summary is present, the template textarea MUST be hidden, and the modal MUST show the card name and its description as read-only text. **Editar card** MUST open that card's existing edit route. **Quitar** MUST clear the card from the form without saving and without deleting the card. Saving MUST send the update and, on success, refresh the row and close the modal. A failed save MUST leave the modal open with the entered values.

#### Scenario: Edit a text template
- **WHEN** the owner edits a template that has no card summary
- **THEN** the modal SHALL show **Texto**, the stored name, color, action, active flag, module, and template text

#### Scenario: Edit a linked template
- **WHEN** the owner edits a template whose card summary is present
- **THEN** the modal SHALL show **Card**
- **AND** SHALL show the card name and description as read-only text
- **AND** SHALL NOT show the template textarea

#### Scenario: Open the card
- **WHEN** the owner activates **Editar card** for the linked card
- **THEN** the app SHALL show that card's edit route

#### Scenario: Clear the link
- **WHEN** the owner activates **Quitar** on a linked template and does not save
- **THEN** the form SHALL return to **Texto**
- **AND** the card SHALL still exist

#### Scenario: Failed save
- **WHEN** the owner saves a template the API rejects
- **THEN** the modal SHALL stay open
- **AND** the entered name SHALL still be visible

### Requirement: Card mode links a prompt card and text mode does not
Choosing **Card** MUST hide the template textarea and MUST offer **Asociar card**, which opens the associate-card modal. After a card is chosen, the form MUST show the link treatment: link icon, card name, and the read-only description. Saving in **Card** mode without a chosen card MUST NOT call create or update. Saving in **Texto** mode MUST send a null card id and the template text. Saving in **Card** mode MUST send the chosen card id. Neither save MUST delete a card.

#### Scenario: Choose a card
- **WHEN** the owner is in **Card** mode and chooses a card from the associate-card modal
- **THEN** the form SHALL show that card's name with a link icon
- **AND** the associate-card modal SHALL be closed

#### Scenario: Save without a card
- **WHEN** the owner saves in **Card** mode with no card chosen
- **THEN** the app SHALL NOT create or update a template
- **AND** the form modal SHALL stay open

### Requirement: Delete removes the action and keeps the card
Delete MUST open a confirmation that states the action is removed and the linked card is not. Confirming MUST delete that action template and remove its row. If the template was linked to a card, that card MUST remain available in Cards. Cancelling MUST leave the template in the section and MUST leave the card unchanged.

#### Scenario: Confirm delete of a linked action
- **WHEN** the owner confirms delete for a template that shows a card chip
- **THEN** that template SHALL disappear from its section
- **AND** the linked card SHALL still be available on the cards list

#### Scenario: Cancel delete
- **WHEN** the owner cancels the confirmation
- **THEN** the template SHALL remain in its section
- **AND** the linked card SHALL remain unchanged

### Requirement: An empty section can still add
A section with no templates MUST show an empty message and MUST still offer **+**.

#### Scenario: Empty Tareas
- **WHEN** the owner has no templates with module `task`
- **THEN** **Tareas** SHALL show an empty message
- **AND** SHALL still offer **+**
