## Purpose

Show on the meeting list and on the meeting form whether a meeting was executed and whether its objective was achieved, and let the owner qualify it from a lazy modal that also captures the summary and the lessons.

## ADDED Requirements

### Requirement: Meeting rows show execution and objective icons
On `/meetings`, each row SHALL show the `verified` icon beside the title when `executed` is true, and SHALL NOT show it when `executed` is false. The row SHALL show the `rocket_launch` icon beside the title when `objectiveAchieved` is true, and SHALL NOT show it when `objectiveAchieved` is false or null. A meeting that was executed and achieved its objective SHALL show both icons.

#### Scenario: Executed and achieved
- **WHEN** the list renders a meeting with `executed` true and `objectiveAchieved` true
- **THEN** the row SHALL show `verified` and `rocket_launch`

#### Scenario: Executed and not achieved
- **WHEN** the list renders a meeting with `executed` true and `objectiveAchieved` false
- **THEN** the row SHALL show `verified`
- **AND** SHALL NOT show `rocket_launch`

#### Scenario: Not executed
- **WHEN** the list renders a meeting with `executed` false and `objectiveAchieved` null
- **THEN** the row SHALL NOT show `verified` or `rocket_launch`

### Requirement: The meetings table does not qualify from the row
The row actions SHALL NOT include "Marcar como ejecutada" or "Objetivo alcanzado". Qualifying a meeting happens on the meeting form.

#### Scenario: Open row actions
- **WHEN** the owner opens the actions menu of a meeting row
- **THEN** the menu SHALL NOT offer to mark the meeting executed or to mark the objective achieved

### Requirement: The form shows summary, lessons, and status
The meeting form SHALL show the saved summary and lessons. The top right of the form SHALL show whether the meeting was executed and whether the objective was achieved, each with a text label and an icon. `executed` true SHALL use the label "Ejecutada" and the `verified` icon. `executed` false SHALL use the label "No ejecutada" and an icon. `objectiveAchieved` true SHALL use the label "Objetivo logrado" and the `rocket_launch` icon. `objectiveAchieved` false SHALL use the label "No logrado" and an icon. `objectiveAchieved` null SHALL use the label "Sin calificar" and an icon. The main save SHALL persist the summary, lessons, and current qualification shown on the form. When the current verdict is not achieved, the main save SHALL NOT proceed if lessons are blank.

#### Scenario: Open an achieved meeting
- **WHEN** the owner opens a saved meeting with `executed` true, `objectiveAchieved` true, a summary, and null lessons
- **THEN** the form SHALL show that summary and empty lessons
- **AND** the top right SHALL show "Ejecutada" with `verified` and "Objetivo logrado" with `rocket_launch`

#### Scenario: Open a meeting that was not held
- **WHEN** the owner opens a saved meeting with `executed` false and `objectiveAchieved` null
- **THEN** the top right SHALL show "No ejecutada" and "Sin calificar"

#### Scenario: Save cleared lessons after a failed objective
- **WHEN** the meeting verdict is not achieved and the owner clears lessons and uses the main save
- **THEN** the form SHALL NOT persist the change
- **AND** SHALL tell the owner that lessons are required

### Requirement: Calificar reunión opens a lazy qualification modal
A saved meeting SHALL show a button labeled "Calificar reunión". Activating it SHALL open a modal. The modal code SHALL load on the first open, not with the initial form. The create form, before the meeting exists, SHALL NOT show the button. The modal SHALL offer two exclusive choices, "Objetivo logrado" and "No logrado", a summary textarea labeled "¿Cómo te fue en la reunión? ¿Cómo se llevó la reunión?", a lessons textarea labeled "¿Qué lecciones te llevas o sacas de esta reunión?", Cancelar, and Guardar. Opening the modal SHALL start from the qualification currently on the form.

#### Scenario: First open loads the modal
- **WHEN** the owner opens the edit form and has not activated "Calificar reunión"
- **THEN** the qualification modal SHALL NOT have been loaded
- **AND** activating the button SHALL load and open it

#### Scenario: New meeting has no qualify button
- **WHEN** the owner is creating a meeting that has not been saved
- **THEN** the form SHALL NOT show "Calificar reunión"

#### Scenario: Reopen keeps the saved qualification
- **WHEN** the owner opens the modal for a meeting already qualified as not achieved, with lessons and a summary
- **THEN** "No logrado" SHALL be selected
- **AND** both textareas SHALL show the current texts

### Requirement: Modal save enforces the verdict and lessons rule
Guardar SHALL NOT persist until one of the two choices is selected. Summary SHALL be optional. Lessons SHALL be required only when "No logrado" is selected. Cancelar SHALL close the modal without persisting. A successful Guardar SHALL persist the verdict, summary, and lessons, SHALL mark the meeting executed, SHALL close the modal, and SHALL update the form status, summary, and lessons to the saved values.

#### Scenario: Save without a choice
- **WHEN** the owner opens the modal and activates Guardar with neither choice selected
- **THEN** the modal SHALL stay open
- **AND** SHALL NOT persist a qualification

#### Scenario: Objetivo logrado without texts
- **WHEN** the owner selects "Objetivo logrado" and activates Guardar with both textareas empty
- **THEN** the API save SHALL succeed
- **AND** the form header SHALL show "Ejecutada" with `verified` and "Objetivo logrado" with `rocket_launch`

#### Scenario: No logrado without lessons
- **WHEN** the owner selects "No logrado" and activates Guardar with blank lessons
- **THEN** the modal SHALL stay open
- **AND** SHALL NOT persist
- **AND** SHALL tell the owner that lessons are required

#### Scenario: No logrado with lessons
- **WHEN** the owner selects "No logrado", writes lessons, leaves summary empty, and activates Guardar
- **THEN** the meeting SHALL be stored as executed with the objective not achieved and those lessons
- **AND** the modal SHALL close
- **AND** the form SHALL show those lessons and "No logrado"

#### Scenario: Cancel discards the draft verdict
- **WHEN** the owner changes the choice and activates Cancelar
- **THEN** the modal SHALL close
- **AND** the stored qualification SHALL stay as it was
