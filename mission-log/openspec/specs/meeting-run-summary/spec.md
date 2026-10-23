## Purpose

The close act of the execution room stays a recap the owner can still extend: add a requirement, a task of that requirement, a loose task, or another next step, without rewriting the summary copy already on screen.

## Requirements

### Requirement: Summary adds requirements and tasks
On the close act, a meeting that has a project SHALL offer a plus control to add a requirement, a plus control to add a task to a requirement, and a plus control to add a loose task. The plus for a requirement task SHALL be on that requirement's row and on each of its task rows. The plus for a loose task SHALL be on each loose-task row, and SHALL still be available when that list is empty. Confirming a non-empty name SHALL create that item. A new requirement SHALL appear after the requirements already listed. A new requirement task SHALL appear after the tasks of that requirement. A new loose task SHALL appear after the loose tasks and SHALL NOT be nested under a requirement. An empty name SHALL NOT create anything. A meeting with no project SHALL NOT show these plus controls. The development act SHALL keep the add controls it already has.

#### Scenario: Add a requirement
- **WHEN** the close act is open for a meeting with a project and the owner adds a requirement named "Contrato"
- **THEN** "Contrato" SHALL appear at the end of the requirements list

#### Scenario: Add a task to a requirement
- **WHEN** the owner uses the plus on a requirement row, or on one of that requirement's task rows, and confirms a task name
- **THEN** that task SHALL appear under that requirement, after the tasks it already has

#### Scenario: Add a loose task
- **WHEN** the owner uses the plus in Tareas and confirms a task name
- **THEN** that task SHALL appear at the end of Tareas
- **AND** SHALL NOT be nested under a requirement

#### Scenario: Empty name
- **WHEN** the owner confirms an add with an empty name
- **THEN** no requirement or task SHALL be created

#### Scenario: Meeting has no project
- **WHEN** the close act is open for a meeting with no project
- **THEN** the summary SHALL NOT show plus controls for requirements or tasks

### Requirement: Summary copy stays
The close act SHALL keep the heading **Resumen de la reunión** together with the text snippet icon, numbered requirement rows, numbered loose-task rows, the word **Actualizar** on the control that saves an edit, the handshake icon beside **Muchas gracias**, and the labels **Puntos tratados**, **Requerimientos**, **Tareas**, **Información adicional**, and **Próximos pasos**.

#### Scenario: Open the close act
- **WHEN** the owner opens the close act
- **THEN** the heading SHALL read **Resumen de la reunión**
- **AND** SHALL show the text snippet icon

### Requirement: Summary adds a next step
On the close act, a meeting that has a project SHALL offer a plus control to add a next step. Confirming a description of at least 2 characters SHALL append that step after the next steps already listed. A description shorter than 2 characters SHALL NOT be saved and SHALL NOT remove the steps already listed. Editing and deleting an existing next step SHALL remain. A meeting with no project SHALL NOT show this plus control.

#### Scenario: Add a next step
- **WHEN** the owner adds a next step whose description is "Enviar el acta"
- **THEN** "Enviar el acta" SHALL appear at the end of **Próximos pasos**

#### Scenario: Description is too short
- **WHEN** the owner confirms a next step whose description has one character
- **THEN** the next-step list SHALL stay unchanged

#### Scenario: Meeting has no project
- **WHEN** the close act is open for a meeting with no project
- **THEN** the summary SHALL NOT show a plus control for next steps
