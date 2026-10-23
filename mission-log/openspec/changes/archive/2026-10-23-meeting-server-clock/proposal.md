## Why

El tiempo de la sala vive en `localStorage` de un navegador y el servidor solo recibe un entero al finalizar, una sola vez. Cerrar el navegador, abrir la sala en otro sitio o reanudar después de finalizar pierde o congela ese tiempo. El reloj tiene que vivir en la reunión y seguir los tramos que el usuario abre y cierra.

## What Changes

- La reunión guarda el reloj en las columnas que ya tiene y en tres nuevas: `duration` pasa a ser los segundos ya cerrados, y se agregan `started_at`, `running_since` y `finished_at`. No hay tabla nueva.
- El servidor calcula cada tramo con su propio reloj. El cliente no envía la duración.
- En la sala, a la derecha del reloj, hay un play para iniciar o reanudar, y los iconos de pausa y finalizar mientras el tramo está abierto o en pausa. Finalizar, desde ese icono o desde el último acto, guarda el tiempo y marca `executed`. Después se puede reanudar: el contador sigue y suma el tramo nuevo. `started_at` no se mueve. `duration` no se reinicia. La sala no muestra el texto ejecutada.
- Cerrar el navegador, salir de la sala u ocultar la pestaña no pausa. El tramo sigue abierto. Al volver, la pantalla suma desde `running_since` hasta ahora y sigue contando.
- No hay tick ni `localStorage`. Pausar o finalizar suma el tramo completo, aunque el navegador haya estado cerrado horas.
- El resumen y las lecciones siguen en la calificación. Finalizar solo marca `executed`.
- **BREAKING:** `POST /meeting/:id/finish` con una duración enviada por el cliente se reemplaza por las acciones del reloj. Una `duration` ya guardada deja de congelar la sala.

## Capabilities

### New Capabilities

- `meeting-run-clock`: botones y lectura del reloj en la sala, sin `localStorage` y sin tick. Cerrar el navegador no pausa. Después de finalizar se puede reanudar.

### Modified Capabilities

- `meeting-api`: columnas del reloj en `meetings`, acciones para reanudar, pausar, confirmar el tramo abierto y finalizar, y la regla de que planificación y calificación no escriben esos campos.

## Impact

- `logger-brain`: tres columnas en `meetings`, migración que marca como finalizadas las filas que ya tienen `duration`, y las acciones del reloj en lugar de `POST /meeting/:id/finish`.
- `mission-log`: `useMeetingClock`, la sala (`MeetingRunView`, `MeetingRunClose`) y `useMeeting`. El reloj no se guarda en el navegador.
- El change abierto `meeting-execution-room` describe el reloj en `localStorage` y un finalizado de una sola vez. Este change reemplaza esa parte. El formulario de planificación no edita el tiempo real.
