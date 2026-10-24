## REMOVED Requirements

### Requirement: Each row has an actions menu with delete only
**Reason**: The row menu also lists the active meeting action templates.
**Migration**: **Eliminar** still asks for confirmation before deleting. The template items are added to that same menu and do not open the planning form.

## ADDED Requirements

### Requirement: Each row menu deletes and applies a meeting template
Each row SHALL end with an actions menu. The menu MUST include **Eliminar**. Choosing it MUST ask for confirmation before deleting. Confirming MUST delete that meeting for the owner and remove the row. Cancelling MUST leave the meeting in the table. The menu MUST also list every active template whose module is `meeting` or `all`, oldest created first. Each of those items MUST show the template name. Choosing one MUST apply that template to that meeting and MUST NOT navigate to the planning form. The menu MUST still be available when there is no template, and in that case MUST offer only **Eliminar**.

#### Scenario: Delete remains
- **WHEN** the user opens a row's actions menu
- **THEN** the menu SHALL offer Eliminar

#### Scenario: Confirm delete
- **WHEN** the user chooses Eliminar and confirms
- **THEN** the meeting SHALL be deleted
- **AND** the row SHALL disappear from the table

#### Scenario: Cancel delete
- **WHEN** the user chooses Eliminar and cancels the confirmation
- **THEN** the meeting SHALL remain in the table

#### Scenario: A meeting template is in the menu
- **WHEN** the user opens the menu of a row and an active meeting template named "Correo" exists
- **THEN** the menu SHALL offer "Correo" and Eliminar
- **AND** choosing "Correo" SHALL NOT open the planning form
