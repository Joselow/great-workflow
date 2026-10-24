## Purpose

Active action templates become usable on the meeting plan, and on each requirement, task, and log: activating one writes the template body plus that entity's content into the writer and the clipboard.

## ADDED Requirements

### Requirement: Active templates appear on their module
The meeting planning form, the meeting row menu, each requirement row, each task row, and each log row SHALL offer every active template whose module is that surface's module or `all`. An inactive template MUST NOT appear. A template of another module MUST NOT appear. Templates MUST be offered oldest created first. Each control MUST show the material icon `touch_app` and the template name, and MUST use the template color so the name and icon stay readable. The visible label MUST be the template name. When the template has action text, the control's `title` MUST be that text. When the action text is absent, the control MUST NOT set a `title`. The control MUST NOT show the template body or a card name. Templates MUST NOT depend on the active project. When a requirement, task, or log row has no matching active template, it MUST NOT show an empty action control.

#### Scenario: Meeting and general templates on the plan
- **WHEN** the owner opens the meeting planning form and has an active meeting template named "Correo" whose action text is "Para el cliente" and an active template named "General" with module `all`
- **THEN** the form SHALL offer "Correo" and "General"
- **AND** the "Correo" control's title SHALL be "Para el cliente"
- **AND** "General" SHALL also be offered on requirement, task, and log rows

#### Scenario: Inactive and foreign templates stay hidden
- **WHEN** a meeting template is inactive and a log template is active
- **THEN** the meeting planning form SHALL NOT offer either template

#### Scenario: No templates
- **WHEN** the owner has no active requirement template and no active template with module `all`
- **THEN** a requirement row SHALL NOT show an action control for templates

### Requirement: Meeting templates are buttons on the planning form and items in the row menu
On the meeting planning form, each offered template MUST be its own button. **Copiar resumen** MUST remain and MUST still write only the meeting summary. The meetings table actions menu MUST list those same templates and MUST still offer **Eliminar**. Choosing a template from that menu MUST apply it to that saved meeting and MUST NOT open the planning form. The execution room, including its notebook, MUST NOT offer these template controls.

#### Scenario: Buttons sit with the summary copy
- **WHEN** the planning form has one offered template named "Correo"
- **THEN** the form SHALL show a "Correo" button
- **AND** SHALL still show **Copiar resumen**

#### Scenario: Table menu lists the template and delete
- **WHEN** the owner opens a meeting row's actions menu and "Correo" is an offered meeting template
- **THEN** the menu SHALL offer "Correo" and **Eliminar**

#### Scenario: A table action uses that meeting
- **WHEN** the owner chooses "Correo" from the menu of a meeting titled "Sync"
- **THEN** the entity block SHALL be the summary **Copiar resumen** would write for "Sync"
- **AND** the planning form SHALL stay closed

#### Scenario: The execution room stays without templates
- **WHEN** the owner is in the execution room
- **THEN** the room SHALL NOT offer a meeting template control

### Requirement: Requirement, task, and log templates use the row dropdown
Each requirement row, each task row, and each log row that has at least one offered template MUST show one dropdown, using the same menu pattern as the meeting row. The dropdown MUST list only those templates. Choosing one MUST apply that template to that row's entity. Edit, delete, complete, **Info**, and the other controls already on the row MUST remain. The task row is shared by the tasks page and the requirement-tasks modal, so both MUST show that dropdown. The meeting notebook MUST NOT show it.

#### Scenario: Open the dropdown on a task
- **WHEN** a task row on the tasks page has two offered templates
- **THEN** opening its dropdown SHALL list those two templates
- **AND** SHALL NOT list edit or delete inside that dropdown

#### Scenario: The same task row inside the modal
- **WHEN** the owner opens the tasks of a requirement and that modal lists a task
- **THEN** that task row SHALL offer the same task templates as the tasks page

#### Scenario: Apply to the row that was opened
- **WHEN** the owner chooses a template from the dropdown of a requirement named "Contrato"
- **THEN** the written entity content SHALL be the content of "Contrato"
- **AND** SHALL NOT be the content of another requirement

### Requirement: The written text is the template body plus the entity content
Activating a template MUST build one text. The first block MUST be the template body: the stored template text when the template has no linked card, or the same text the app already copies for that prompt card when a card is linked. The second block MUST be that module's entity content. When both blocks have text, they MUST be joined by one blank line, template body first. When only one block has text, the result MUST be that block. The result MUST replace the writer content, MUST be treated as markdown, and MUST expand the writer. The same result MUST be copied to the clipboard. A failed clipboard copy MUST leave the writer showing that result and MUST show an error. A successful copy MUST show the existing copied confirmation. When both blocks are empty, the writer and the clipboard MUST stay unchanged.

#### Scenario: Text template and a requirement
- **WHEN** the owner activates a text template whose body is "Revisar el alcance" on a requirement named "Contrato"
- **THEN** the writer SHALL show "Revisar el alcance", a blank line, and "Contrato"
- **AND** the clipboard SHALL contain that same text

#### Scenario: Linked prompt card
- **WHEN** the owner activates a template linked to a prompt card on a log
- **THEN** the first block SHALL be the text the app already copies for that prompt card
- **AND** the second block SHALL be that log's entity content

#### Scenario: Clipboard is denied
- **WHEN** the clipboard copy fails
- **THEN** the writer SHALL still show the built text
- **AND** the app SHALL show an error

### Requirement: Entity content comes from one function per module
Meeting entity content MUST be the same text **Copiar resumen** writes for the current planning form. Requirement entity content MUST be the requirement name. Task entity content MUST be the task name, and when the task has a description MUST also include that description after a blank line, matching the text the task's description control writes. Log entity content MUST be the same text the log **Info** control writes. Each module's entity content MUST be produced in one place, so a change to that text changes both the existing control and the template output. **Copiar resumen** and **Info** MUST keep writing only their entity content.

#### Scenario: Meeting action matches the summary
- **WHEN** the owner activates a text template whose body is "Preparar" on a planning form
- **THEN** the writer SHALL show "Preparar", a blank line, and the same summary **Copiar resumen** would write for that form

#### Scenario: Task with a description
- **WHEN** the owner activates a template on a task named "Enviar acta" whose description is "Antes del viernes"
- **THEN** the entity block SHALL be the same text the description control writes for that task

#### Scenario: Task without a description
- **WHEN** the owner activates a template on a task named "Enviar acta" that has no description
- **THEN** the entity block SHALL include "Enviar acta"
- **AND** the description control SHALL stay hidden

#### Scenario: Copiar resumen stays the summary alone
- **WHEN** the owner activates **Copiar resumen**
- **THEN** the writer SHALL show the meeting summary
- **AND** SHALL NOT prefix it with a template body
