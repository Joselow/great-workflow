# Evaluación del proyecto

Fecha: 21 de octubre de 2026. Recorre el código de `mission-log` y `logger-brain`, y lo que OpenSpec tiene abierto o archivado. Es una lectura del estado, no un change.

Flow Work Logger es un gestor de ciclo cerrado: logs, reuniones, requerimientos, tareas, cards y, desde hace poco, plantillas de acción. El repo es un monorepo de dos apps independientes. Cada una tiene su stack, su `package.json` y sus convenciones. No hay workspace compartido.

## Qué hay hoy

### Backend — `logger-brain`

API REST con Express 4, TypeScript, Drizzle y PostgreSQL. El flujo de una request está definido y se cumple en los recursos nuevos:

```
routes → middleware (auth, rate limit, Zod) → controller → service → db/schemas
```

El controller no toca la base. El service no conoce `req` ni `res`. Los errores tipados caen en `errorHandler`. El token entra por `Authorization` o por cookie. La contraseña no sale en la respuesta de auth.

Recursos montados bajo `/api/v1/app`, todos con `requireAuth`, más `/api/v1/auth`, `/api/v1/health` y `/api/v1/public/card`:

| Recurso | Qué persiste |
|---|---|
| Proyectos | Nombre, descripción, color. Dueño por `user_id`. |
| Logs | Descripción, responsable, tags, comentario, `completed` nullable. Siempre con proyecto. |
| Reuniones | Plan (título, fecha, duración estimada en minutos, estado, objetivo, participantes, color), agenda como issues, cards y logs enlazados, siguientes pasos como logs, calificación (`executed`, `objectiveAchieved`, `summary`, `lessons`). |
| Cards | Nombre, descripción, color, secciones, `isPrompt`, `flMeeting`. Listado con búsqueda. Vista pública de solo lectura. |
| Requerimientos | Nombre. Proyecto obligatorio. Reunión opcional. |
| Tareas | Nombre, descripción, `completed`. Proyecto obligatorio. Reunión y requerimiento opcionales. |
| Plantillas de acción | Por módulo (`all`, `log`, `meeting`, `requirement`, `task`). Texto o card de prompt, no las dos. |

Los ids de dominio son UUIDv7. Issues y plantillas usan serial. Las columnas de tiempo salen de `db/schemas/commons.ts`.

La integridad es de aplicación, no de base. Casi ninguna tabla declara `.references()`. El dueño se comprueba en el service (`userId` en el `WHERE`, `assertOwnedProject`, `getOwnedMeeting`). Cards y plantillas tienen índice. El resto de las listas filtra por `user_id` o `project_id` sin índice propio.

### Frontend — `mission-log`

Vue 3, TypeScript, Vite, Tailwind 4, Vue Router, Axios. Sin Pinia: el estado compartido son módulos con `ref` (`projectStore`, `logStore`, `authStore`, `textDataStore`). La UI es Pastel Soft / soft brutalism: borde fino, radio pequeño, color del proyecto como tinte, iconos de Material Symbols.

El shell autenticado está en `App.vue`: encabezado, cajón de proyectos y writer. El writer es un riel a la derecha en escritorio y una pestaña inferior en móvil. Las rutas públicas (login, registro, card compartida) no lo montan.

Pantallas:

| Ruta | Qué hace |
|---|---|
| `/` | Formulario de log, filtros por semana y estado, tabla. |
| `/meetings`, `/meetings/new`, `/meetings/:id` | Tabla con filtro de fechas. Formulario de planificación, cards, resumen, lecciones, calificar, copiar resumen. |
| `/requirements` | Nombre del requerimiento. **Tareas** abre el mismo espacio de tareas en un modal. |
| `/tasks` | Formulario a la izquierda, lista a la derecha, filtros Todos / Pendientes / Completadas. |
| `/cards`, `/cards/new`, `/cards/:id`, `/share-data/:id` | Galería, editor, vista pública. |
| `/action-templates` | Tablero por módulo y modal de alta. |
| `/projects/new`, `/projects/:id` | Alta y edición del proyecto. |

Los composables (`useLog`, `useMeeting`, `useCard`, `useRequirement`, `useTask`, `useActionTemplate`, `useProject`, `useAuth`) son la única capa que llama a Axios. Los componentes emiten y pintan. Eso se cumple en lo nuevo. `HelloWorld.vue` sigue en el árbol y no entra en ninguna ruta.

Atajos de teclado y un modal de ayuda viven en el shell. El proyecto activo se guarda en `localStorage`.

## Arquitectura que conviene conservar

En el backend, el corte por capas es el mejor activo. Un recurso nuevo ya tiene un camino: schema, validación Zod, request form, controller envuelto en `catchErrors`, service, router bajo `requireAuth`. Reuniones, cards, tareas, requerimientos y plantillas lo siguen. La respuesta de error es una sola.

En el frontend, el corte también es claro: vista que orquesta, componente que pinta, composable que pide, helper puro, interfaz de contrato. `ModalBase`, `ConfirmModal`, `DangerZone`, `ColorPicker`, `EmptyRecords` y `RichTextEditor` se reutilizan de verdad. El editor guarda negrita y cursiva como `*` y `_`, y el copiado de la reunión las deja así para WhatsApp.

Los stores de módulo son más ligeros que Pinia para lo que hay. `CLAUDE.md` menciona Pinia; el código no la usa. Meterla ahora no haría la app más rápida.

La fluidez que ya existe y hay que cuidar: el debounce de la búsqueda de cards, el filtro de logs que llama a una sola función, los filtros de tareas que cambian con un click y piden de nuevo, el modal de tareas que carga al abrirse y no al montar la página, el writer que no empuja el ancho cuando está cerrado.

## Qué está planeado

OpenSpec vive en `mission-log/openspec`. Las specs principales describen el producto ya construido. Los changes abiertos son el trabajo que todavía no es código, o que el código ya hizo y nadie archivó.

| Change | Estado | Qué es |
|---|---|---|
| `meeting-execution-room` | Plan listo, 0 tareas hechas | La sala de la reunión. Botón **Iniciar reunión** debajo de **Copiar resumen**. Tres actos, cuaderno único, reloj que solo cuenta con la sala abierta. **Finalizar** guarda `duration` en segundos. Si `executed` es true o `duration` ya existe, el reloj solo muestra el valor. |
| `action-templates` | Tareas marcadas hechas, sin archivar | El tablero y la API ya están en el código. Falta archivar el change para que la spec principal deje de decir que la navegación tiene cinco enlaces. |
| `requirement-tasks-modal` | Tareas marcadas hechas, sin archivar | El modal de tareas del requerimiento ya está en `/requirements`. |
| `cards-filter-dark-and-persist` | 0 de 5 | Select legible en oscuro y restaurar el proyecto activo y el filtro de cards. El proposal dice que aún no hay specs principales. Eso ya no es cierto: el archivo está viejo. |

La sala no toca el vínculo issue–requerimiento. El punto de agenda es un marco. El cuaderno es de la reunión. `duration` no se escribe desde el formulario de planificación.

Fuera de OpenSpec, este documento deja anotada la paginación. Hoy no tiene change.

## Paginación

Es el hueco de producto que falta en los dos lados. Cards y reuniones ya parten la consulta. El resto devuelve la lista entera. En pantalla, cada lista inventa su propio control, o no tiene.

### Lo que hace el backend hoy

`listCards` y `listMeetings` responden `{ items, page, limit, total }`. Cuentan con el mismo `where` de la página y aplican `limit` + `offset`. Cards: default 6, máximo 24. Reuniones: default 12, máximo 24. La lógica está copiada dentro de cada service.

`getLog`, `listRequirements`, `listTasks` y `listActionTemplates` no aceptan página. Devuelven todas las filas del filtro. Logs y tareas salen de la más vieja a la más nueva. La spec de tareas pide el orden inverso. La respuesta de logs es el arreglo pelado (`simpleSuccess`). La de reuniones y cards va envuelta con `success`.

### Lo que hace el frontend hoy

`CardsView` pide página y pinta dos botones ‹ › a los lados de la grilla. `AssociateCardModal` repite anterior/siguiente. `MeetingsView` pide `page: 1` y `limit: 24`. Si `total` es mayor, escribe «Mostrando n de total» y no deja pasar de página. Logs, requerimientos, tareas y plantillas renderizan todo lo que llegó.

### El componente

Uno solo, en `commons/`, sin llamada HTTP. Recibe `page`, `limit` y `total`. Emite la página nueva. El padre pide los datos. Así el mismo control sirve cuando el corte lo hace el servidor y cuando una lista corta ya está en memoria y el padre solo cambia de slice.

Dos modos, la misma cara visual: borde fino, radio pequeño, página actual con el color de marca, extremos deshabilitados, sin sombra.

- `simple`. Anterior, el rango visible («1–9 de 40») y siguiente. Es la paginación de la galería y del modal de cards.
- `pages`. Números, ventana corta y elipsis cuando hay muchas páginas. Primera y última. Es la paginación real por página, para tablas (reuniones, logs, tareas).

El componente no decide el modo según el tamaño de la lista. Lo elige la pantalla.

### El backend

Una función pequeña, usada por todos los listados. Algo con la forma `parsePage(query, { defaultLimit, maxLimit })` que devuelve `{ page, limit, offset }` y rechaza con 400 lo que no sea un entero válido. El service arma el `where` una vez, cuenta y trae la página. La respuesta de las listas queda en un solo sobre: `{ items, page, limit, total }`.

Llevar ese sobre a logs, requerimientos, tareas y plantillas. Unificar el de cards y reuniones para que deje de estar escrito dos veces. Defaults sensatos: cards puede seguir en 6 o 9 (la grilla pide 9 y el default del API es 6), tablas en 20, máximo 50. El máximo existe para que un `limit` enorme no vuelva a traer la tabla completa.

`offset` alcanza para este tamaño. Un cursor por `created_at` + `id` solo haría falta si una lista se vuelve enorme y el usuario salta a la última página. No es el primer paso.

Antes de paginar en serio, índice por `(user_id, created_at)` en logs, tareas y requerimientos, y por `(user_id, date)` en reuniones. Sin eso, la página 1 igual recorre la tabla.

## Frontend: watch, velocidad, UI

El criterio: `watch` cuando varios datos cambian y una sola función pide. Un filtro es el caso. No como forma general de reaccionar.

Los que calzan:

- `LogsView` observa proyecto activo y filtros, y llama a `fetchLogs`. Es exactamente el caso del filtro.
- `CardsView` observa solo el texto de búsqueda, vuelve a la página 1 y dispara la carga con debounce. El resto de filtros entra por `handleFiltersUpdate`. Preciso.
- `RequirementsView` y `TasksView` observan el id del proyecto activo y recargan una vez. El filtro de estado de tareas no es un watch: es `setStatus`, que llama a `loadTasks`. Así se queda.
- `RichTextEditor` observa el modelo para pintar el `contenteditable`. El DOM no es el árbol de Vue. Ahí el watch es el puente. `onUpdated` también pinta: los dos juntos pueden repetir trabajo mientras se escribe. Conviene dejar uno.
- `CardForm` observa el largo de las secciones solo para reajustar el alto del textarea cuando el bloque está abierto. Local y barato.

Los que sobran o pesan:

- `ProjectFormView` observa id, nombre, descripción y color del borrador y, desde ahí, guarda con debounce. También hace `console.log` y escribe el color del proyecto dentro del watch. El guardado es un efecto escondido. Un `@input` con el mismo debounce deja ver qué tecla guarda y no dispara al reemplazar el borrador desde fuera.
- `LogStore.vue` copia `selectedLog` al formulario con `deep: true` e `immediate`. Cada cambio interno del objeto seleccionado reescribe el formulario. Al elegir una fila basta un handler. El `deep` puede pisar lo que la persona está escribiendo si el store se mueve.
- `SaveComment.vue` hace el mismo traslado de comentario. Mismo patrón, más chico.
- `RequirementTasksModal` observa apertura, id del requerimiento y proyecto, y en cada cambio reinicia el filtro a Todos y vuelve a pedir. Abrir el modal es el momento justo. Si solo cambia el filtro, `setStatus` ya pide. El watch no necesita ser la puerta de los tres.

`MeetingRequirementsTasks.vue` también observa meeting y proyecto. El formulario de reunión tiene ese bloque comentado. Es código muerto hasta que la sala exista, y la sala no va a usar ese bloque: el cuaderno es otro.

Otras cosas que frenan la sensación de velocidad, sin ser watches:

- En logs, `CommonLoader` tapa el formulario y la tabla juntos. Al cambiar de semana la página parpadea entera. El loader debe quedarse en la lista.
- `MeetingFormView.vue` pasa de 600 líneas. Mezcla carga, guardado, calificación, copiado y el layout. Al entrar la sala, esa vista tiene que adelgazar, no crecer.
- Quedan `console.log` en el store de proyectos, el formulario de proyecto, el log, el auth y `snapshotProject`. En una pantalla rápida se notan en la consola y no aportan.
- El encabezado dice «Template actions». La spec del change dice **Acciones**. La spec principal todavía habla de cinco enlaces.

La UI que ya funciona no hay que rediseñarla. Borde fino, color del registro, acciones con icono y texto corto, modal que cierra con Escape. El pager nuevo tiene que verse de esa familia, no como un control de otra librería.

## Backend: qué mejorar

Orden sugerido. Lo primero es un fallo. Lo demás es diseño para que el siguiente recurso salga igual de fácil.

1. **El log no comprueba dueño al editar ni al borrar.** `updateLog` y `destroyLog` filtran solo por id. El listado y el alta sí usan `userId`. Tareas, cards, reuniones, requerimientos y plantillas ya hacen `WHERE id AND user_id`. El log tiene que hacer lo mismo, y el controller tiene que esperar el `await` de `destroyLog`. Hoy el delete responde antes de saber si borró.
2. **`updated_at` no se mueve.** `commons.ts` pone `defaultNow()` y nadie lo actualiza en el `UPDATE`, salvo las plantillas. Las cards se ordenan por `updatedAt`, así que una card editada no sube. Un `$onUpdate` en la columna, o la fecha en el service, lo deja parejo.
3. **Un solo sobre de lista y un solo `parsePage`.** Es la paginación de arriba. De paso, logs y proyectos dejan de responder un JSON distinto al de reuniones y cards. El frontend deja de adivinar la forma.
4. **Índices de las listas.** `(user_id, created_at)` y `(user_id, project_id)` donde el filtro es el proyecto. Cards ya indexa `(user_id, updated_at)`. El resto no.
5. **Dueño duplicado.** `assertOwnedProject` está en el service de proyectos y otra vez, privada, en reuniones y en cards. Una sola función evita que una copia se olvide de un caso.
6. **Issues que se borran y se crean en cada guardado.** `syncIssues` no conserva el id. Hoy no rompe nada porque un requerimiento no apunta a un issue. La sala está diseñada así a propósito. Si más adelante algo guarda el id del punto, este guardado lo deja huérfano. No cambiarlo dentro de la sala. Sí dejarlo escrito para no «arreglarlo» a medias.
7. **Orden de tareas y requerimientos.** El service usa `asc(createdAt)`. La spec de tareas pide descendente. La sala va a ordenar en el cliente, newest first, sin cambiar el API de `/tasks`. Conviene decidir un orden y cumplirlo en los dos lados cuando se pagine, porque la página 1 cambia según el `ORDER BY`.
8. **Sin pruebas.** `pnpm test` en el backend sale con error a propósito. No hay tests de frontend. El typecheck es la red. Para paginación y para el arreglo del log, un test del service (dueño, página, total, 400) paga más que un test de componente.
9. **Archivo `nodFound.ts`.** El 404 está bien cableado. El nombre del archivo está mal escrito y el `import` lo repite. Renombrarlo cuando se toque esa zona, no como cambio suelto.
10. **Rate limit global de 1000 cada 10 minutos en `app.ts`, además de los limiters por ruta.** No estorba. Los de login y registro sí importan. El global tan alto no protege un listado sin página.

Lo que no hace falta rehacer: Zod por recurso, `catchErrors`, errores con status en el nombre, UUIDv7, la transacción al borrar una reunión (desengancha requerimientos y tareas, no los borra), y el rechazo explícito de `issueId` en requerimientos y tareas.

## Huecos entre spec y código

- La spec `meeting-requirements-tasks` dice que el formulario de reunión muestra bloques de requerimientos y tareas. En `MeetingFormView.vue` ese bloque está comentado. El change de la sala lo saca del formulario a propósito. Hasta archivarlo, la spec principal miente.
- `section-nav` pide cinco enlaces. El header ya tiene seis, y el sexto no se llama **Acciones**.
- `cards-filter-dark-and-persist` sigue abierto desde septiembre y su proposal describe un repo sin specs. Hay que releerlo antes de implementarlo, o cerrarlo si el código ya restauró el proyecto activo por otro camino.
- `action-templates` y `requirement-tasks-modal` están completos en tareas y siguen en `changes/`. Archivarlos alinea la spec principal con la app.
- `meeting-execution-room` es el único plan nuevo de producto. No está empezado.

## Orden que vale la pena

1. Corregir update y delete de logs para que exijan el dueño.
2. Hacer que `updated_at` cambie en los updates. Revisar el orden de la galería de cards después.
3. Extraer `parsePage` y el sobre `{ items, page, limit, total }`. Índices de las columnas por las que se filtra.
4. Componente `Pager` con modo `simple` y modo `pages`. Usarlo en cards y en el modal de asociar card. Darle páginas de verdad a la tabla de reuniones, que ya recibe `page` y `total`.
5. Paginar logs, requerimientos, tareas y plantillas con ese mismo sobre y ese mismo componente.
6. Seguir con la sala (`meeting-execution-room`) cuando la paginación de reuniones no la bloquee. La sala pide una reunión por id, no el listado.
7. Archivar los changes ya hechos y alinear el nombre **Acciones** en el header.
8. Quitar los `console.log` y el loader que tapa el formulario de logs. Sacar el watch de autoguardado del formulario de proyecto.

La sala y la paginación se tocan poco. Se pueden planear como changes distintos. La paginación todavía no tiene proposal.
