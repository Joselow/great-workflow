## Why

Planear una reunión y estar en ella son dos momentos distintos. Hoy el formulario guarda el plan y la calificación, y no hay un lugar para recorrer la agenda, anotar lo que va saliendo y medir solo el tiempo en que esa sala estuvo abierta. Cuando la reunión ya se ejecutó, o la sala ya se finalizó, ese tiempo es un resultado: no debe volver a correr.

## What Changes

- La reunión gana logística opcional (`additionalInfo`, `platform`, `meetingUrl`, `accessDetails`) y una duración real (`duration`, entero en segundos, null hasta finalizar la sala). `estimatedDuration` sigue siendo el plan en minutos.
- En el formulario, una sección de plataforma (select, enlace y acceso) y el dato adicional. Debajo de **Copiar resumen**, un botón **Iniciar reunión** abre la sala de una reunión ya guardada.
- La sala es una ruta propia, sin encabezado, cajón de proyectos ni writer. Tres actos: contexto, desarrollo y cierre. El título de la reunión permanece.
- En desarrollo, la lista son los puntos de la agenda. Entrar a un punto cambia el encabezado. Los requerimientos, sus tareas, las tareas sueltas y el dato adicional son de la reunión: el mismo cuaderno en cualquier punto. Lo nuevo queda arriba. Las tareas van sangradas bajo su requerimiento, siempre visibles. Un punto no guarda un `issueId`.
- El reloj cuenta solo con la sala abierta. Al salir, cerrar la pestaña o ocultar el documento, se pausa y el hueco no suma. Al volver, sigue desde los segundos ya acumulados en `localStorage`. **Finalizar** lo para y persiste `duration`.
- Si `executed` es true, o si `duration` ya está guardada, el reloj no arranca ni cuenta: muestra ese valor y ya. **Finalizar** no marca la reunión como ejecutada ni escribe resumen ni lecciones. Calificar sigue siendo el otro paso.
- El formulario de planificación deja de ser el lugar del cuaderno de requerimientos y tareas. Ese cuaderno vive en la sala. `/requirements` y `/tasks` no cambian.

## Capabilities

### New Capabilities

- `meeting-execution-room`: sala de ejecución, el botón que la abre, los tres actos, el cuaderno compartido y el reloj que se pausa y se congela.

### Modified Capabilities

- `meeting-api`: campos de logística y `duration`; el guardado de planificación no escribe `duration`; finalizar la sala la persiste una sola vez.
- `meeting-planning-form`: sección de plataforma, enlace, acceso y dato adicional en el formulario.
- `global-app-shell`: la ruta de la sala no monta encabezado, cajón de proyectos ni writer.
- `meeting-requirements-tasks`: el cuaderno de la reunión pasa del formulario a la sala. Los puntos de agenda siguen sin vincularse a requerimientos ni a tareas.

## Impact

- `logger-brain`: columnas en `meetings`, validación, respuesta de get/create/update, y una acción de finalizar que solo escribe `duration`.
- `mission-log`: formulario de reunión, router, `App.vue`, vista de la sala, reloj en `localStorage`. Reutiliza `useRequirement`, `useTask` y `useMeeting`. No hay tabla nueva ni dependencia nueva.
