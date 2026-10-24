## Why

Las action templates ya se configuran por módulo, pero en Reuniones, Requerimientos, Tareas y Logs todavía no se pueden usar. Al accionar una, el texto de la plantilla —o de la card vinculada— tiene que quedar en el writer y en el portapapeles, junto con el contenido de esa entidad.

## What Changes

- En cada módulo aparecen las plantillas activas de ese módulo y las de `all`. Una plantilla inactiva no aparece. El rótulo visible es el nombre de la plantilla, con el icono `touch_app` y el color guardado. El atributo `title` del control es el texto del campo **Acción** cuando existe.
- Al accionar, la salida son dos bloques: primero el cuerpo de la plantilla (el texto, o el texto de la card prompt vinculada) y debajo el contenido de la entidad. Ese resultado reemplaza el writer y se copia al portapapeles.
- El contenido de la entidad sale de una función por módulo, para poder cambiarlo en un solo lugar. Reunión usa el mismo resumen que **Copiar resumen**. Requerimiento usa el nombre. Tarea usa el texto que ya arma la fila al ver la descripción; si no hay descripción, igual incluye el nombre. Log usa el texto que ya arma **Info**.
- En el formulario de planificación de la reunión, cada plantilla es un botón. **Copiar resumen** se queda. El menú de cada fila de la tabla también lista esas plantillas, además de **Eliminar**. La sala de ejecución no las muestra.
- En la lista de requerimientos, en la lista de tareas y en la lista de logs, las plantillas entran en un dropdown como el de la fila de reuniones. La fila de tarea es la misma en la página de Tareas y en el modal de tareas de un requerimiento, así que el dropdown sale en los dos. El cuaderno de la sala no lo usa.

## Capabilities

### New Capabilities

- `module-action-apply`: plantillas activas listas en Reuniones, Requerimientos, Tareas y Logs, y la salida de plantilla más contenido de la entidad en el writer y en el portapapeles.

### Modified Capabilities

- `meeting-table-view`: el menú de la fila sigue pudiendo eliminar, y además lista las plantillas de reunión.

## Impact

- `mission-log`: botones en el formulario de reunión; las mismas plantillas en el menú de la tabla; dropdown en las filas de requerimientos, tareas y logs, incluido el modal de tareas. Reutiliza `GET /action-template`, `GET /meeting/:id` al accionar desde la tabla, `generateMeetingSummary`, `generateLogInfo`, `cardToCopyText`, `MeetingRowActions` y el writer. El contenido de tarea que hoy está en la fila pasa a una función compartida.
- `logger-brain`: sin cambios. No hay columna, endpoint ni dependencia nueva.
