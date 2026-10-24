## 1. Entity content

- [x] 1.1 Add a requirement helper that returns the trimmed name, and move the task row's `*name*` plus description string into a task helper. An empty description returns only the emphasized name. Point the task description button at that helper. Verify a task named "Enviar acta" with description "Antes del viernes" still writes the same text from the description button, and a requirement named "Contrato" yields "Contrato".
- [x] 1.2 Add the compose step: template text when there is no card, otherwise `cardToCopyText` of the prompt-card summary; then the module entity function; join non-empty blocks with one blank line. Verify "Revisar el alcance" plus "Contrato" is those two blocks, a linked prompt card uses the existing card copy as the first block, a single block stays alone, and two empty blocks produce nothing.

## 2. Apply

- [x] 2.1 Load `GET /action-template` once per page and keep active templates whose module is the surface or `all`, in the returned order. Verify an inactive meeting template and an active log template are absent from the meeting list, and an active `all` template is present for meeting, requirement, task, and log.
- [x] 2.2 On activate, replace the writer with the composed markdown and copy that same string. Verify the writer expands with that text, a successful copy shows the copied toast, a denied clipboard leaves the writer text and shows the copy error, and an empty compose does not change the writer.

## 3. Meeting buttons

- [x] 3.1 On the planning form, after **Copiar resumen**, show one full-width button per offered template: template color, readable text, `touch_app`, the template name, and `title` set to the Acción text when it exists. The summary uses the same fields **Copiar resumen** already uses. Verify "Correo" appears with title "Para el cliente", **Copiar resumen** still writes only the summary, and the execution room, including the notebook, has no template button.
- [x] 3.2 Add those same templates to each meeting row menu, ahead of **Eliminar**. Choosing one loads that meeting by id and writes its summary as the entity block, without opening the form. Verify the menu of "Sync" offers "Correo" and **Eliminar**, choosing "Correo" writes the summary of "Sync", and a row with no templates still offers only **Eliminar**.

## 4. Row dropdown

- [x] 4.1 Let `MeetingRowActions` size to its items, scroll inside a max height, flip near the bottom, and wrap long names. Verify the meeting row's **Eliminar** item still opens beside its button.
- [x] 4.2 Add that dropdown to each requirement row, task row, and log row only when that surface has an offered template. Each item uses the same color, icon, name, and `title`. It applies to that row. Verify two task templates list in the dropdown and not edit or delete, the same task row inside the requirement-tasks modal lists them too, a requirement named "Contrato" writes "Contrato" as the entity block, **Info** still writes only the log text, and the meeting notebook does not show the dropdown.
