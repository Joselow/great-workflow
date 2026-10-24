## Why

En la sala el reloj solo arranca si el dueño pulsa **Iniciar**, y sigue contando mientras confirma **Finalizar**. El campo **Información adicional** queda en tres filas y el texto largo se esconde dentro del cuadro. Hace falta preguntar el arranque una sola vez por visita, congelar el tiempo al pedir finalizar, y dejar que ese campo crezca con el texto.

## What Changes

- La primera vez que, en una visita a la sala, el dueño pasa del acto de contexto al siguiente y el reloj aún no ha arrancado, la sala pregunta si quiere iniciar la reunión. Confirmar llama al mismo arranque que **Iniciar** y avanza. Cancelar avanza sin arrancar y no vuelve a preguntar mientras siga en esa visita, aunque cambie de acto.
- Salir de la sala y volver a entrar reinicia esa pregunta. Si el reloj ya arrancó, o la reunión está ejecutada sin reloj, no se pregunta.
- Al pulsar **Finalizar** con un tramo abierto, el tiempo se detiene en ese instante. Confirmar deja la reunión finalizada. Cancelar reanuda el contador desde el segundo en que se detuvo. Si el reloj ya estaba en pausa, cancelar lo deja en pausa.
- El campo **Información adicional** de la sala crece y se encoge con el texto, en el marco de un tema y en el cierre. Sigue siendo el mismo campo de la reunión.

## Capabilities

### New Capabilities

### Modified Capabilities

- `meeting-run-clock`: aviso de inicio una vez por visita al pasar al acto siguiente, y detener el tramo abierto al abrir la confirmación de finalizar.
- `meeting-execution-room`: el campo de información adicional de la sala se ajusta a su texto.

## Impact

- `mission-log`: `MeetingRunView` (aviso, bandera de la visita, pausa al abrir finalizar y reanudar al cancelar), `MeetingRunDevelopment` y `MeetingRunClose` (altura del textarea). El arranque, la pausa, la reanudación y el finalizado siguen siendo las acciones de reloj que ya existen. No hay cambio de API.
