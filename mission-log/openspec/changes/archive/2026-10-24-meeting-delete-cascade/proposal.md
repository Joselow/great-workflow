## Why

Finalizar y borrar una reunión escriben varias filas con consultas sueltas. Si una falla a mitad de camino, la reunión queda a medias: requerimientos desenganchados, vínculos borrados y la reunión todavía presente. Borrar además deja vivos los issues, los logs, las tareas y los requerimientos que nacieron de esa reunión.

## What Changes

- **BREAKING:** `DELETE /meeting/:id` borra la reunión y lo que nació de ella: issues, requerimientos de esa reunión y las tareas de esos requerimientos (también una tarea de la reunión sin requerimiento). En `log_meetings`, un vínculo con `source` `log` solo borra la fila pivote; un vínculo con `source` `meeting` borra el pivote y el log. Las cards se quedan; solo se borra el vínculo `card_meetings`.
- Finalizar (`POST /meeting/:id/clock/finish`) y borrar corren cada uno dentro de una sola transacción. Si algo falla, no queda ningún cambio de esa llamada.
- El reloj no cambia de reglas: finalizar sigue sumando el tramo abierto, marca `executed` y se puede reanudar después.

## Capabilities

### New Capabilities

### Modified Capabilities

- `meeting-api`: borrar deja de desenganchar requerimientos y tareas. Un log con `source` `log` se conserva; un log con `source` `meeting` se borra. Finalizar y borrar son atómicos.

## Impact

- `logger-brain`: `finishMeetingClock` y `deleteMeeting` en `meetingService.ts`. Los dos usan `db.transaction`.
- Un vínculo `source` `log` solo pierde la fila de esta reunión. El log sigue, y sus vínculos con otras reuniones siguen.
- Un vínculo `source` `meeting` borra ese log. Si ese mismo log tenía un vínculo con otra reunión, ese otro pivote también se borra, porque el log ya no existe. La otra reunión sigue.
- Se borran los requerimientos de esta reunión y las tareas de esos requerimientos. Una tarea creada en la reunión sin requerimiento también se borra. Requerimientos, tareas, logs e issues de otra reunión no se tocan. Las cards no se borran.
