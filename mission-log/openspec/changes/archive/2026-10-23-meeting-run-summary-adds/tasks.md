## 1. Summary adds

- [x] 1.1 In the close act, show the notebook plus controls when the meeting has a project, and keep them hidden when it does not. The plus sits inside the requirement row and inside each of that requirement's task rows, and it adds a task under that requirement. Verify a new task appears after the ones already listed, an empty name creates nothing, and the development act still uses its current **Agregar tarea** button and bottom composer.
- [x] 1.2 Add a plus for a new requirement on the summary. Verify "Contrato" appears at the end of the requirements, and the plus is still there when the list is empty.
- [x] 1.3 Add a plus for a loose task on each loose-task row, and under **Tareas** when that list is empty. Verify the new task appears at the end of **Tareas** and is not nested under a requirement.
- [x] 1.4 Leave the summary copy in place: **Resumen de la reunión** with the text snippet icon, numbered rows, **Actualizar**, the handshake icon, and the existing section labels. Verify those strings are still on the close act after the plus controls are added.

## 2. Next steps

- [x] 2.1 Add a plus under **Próximos pasos** that saves through the existing full-list update. Verify "Enviar el acta" appears last, a one-character description leaves the list unchanged, edit and delete still work, and a meeting with no project does not show the plus.

## 3. Arrow keys

- [x] 3.1 Register `room-act-prev` and `room-act-next` in the keyboard command registry, with Spanish labels and a scope of the execution room. The room registers and clears the callbacks, and disables them while the finish dialog is open. Verify ArrowRight moves from the first act to development, ArrowLeft moves from close back to development, ArrowLeft on the first act stays there, the keys do nothing inside a field and on another page, and there is no second key listener in the room.
