## Why

En el resumen de la sala ya se puede revisar y corregir lo tratado, pero no se puede sumar nada: un requerimiento, una tarea o un próximo paso que aparece al cerrar se queda afuera. Las flechas de la pantalla cambian de acto, y el teclado no hace lo mismo.

## What Changes

- En **Resumen de la reunión** vuelven los botones de agregar. Se puede sumar un requerimiento, una tarea de un requerimiento y una tarea suelta. Lo nuevo queda debajo de lo que ya está.
- En **Próximos pasos** hay un botón para agregar otro paso. Sigue valiendo editar y eliminar los que ya existen.
- Los textos que ya están en el resumen se quedan: el título con `text_snippet`, la numeración, **Actualizar** al guardar, el apretón de manos en el agradecimiento y el resto de las etiquetas.
- En la sala, flecha izquierda y flecha derecha hacen lo mismo que las flechas de la pantalla: acto anterior y acto siguiente. No corren mientras se escribe en un campo, ni en el resto de la aplicación.

## Capabilities

### New Capabilities

- `meeting-run-summary`: botones de agregar en el resumen de la sala, para requerimientos, tareas de requerimiento, tareas sueltas y próximos pasos, sin cambiar los textos ya puestos.

### Modified Capabilities

- `keyboard-commands`: la sala de ejecución registra flecha izquierda y flecha derecha para cambiar de acto.

## Impact

- `mission-log`: resumen de la sala (`MeetingRunClose`), cuaderno compartido (`MeetingRunNotebook`) y el registro de atajos. Reutiliza crear requerimiento, crear tarea y el `PUT` de `nextSteps`. No hay columna nueva ni dependencia nueva.
- `logger-brain`: sin cambios. Crear requerimiento, crear tarea y sincronizar próximos pasos ya cubren estos botones.
