## Context

El modelo de datos ya define `PROJECTS` y relaciones (`logs.project_id`, `tags.project_id`, etc.) en `logger-brain/src/db/entities.md`, pero el backend aún no tiene schema/API de proyectos y `logs` no tiene `project_id` en Drizzle. En el frontend, `Header.vue` solo muestra branding + logout; no hay store de proyecto. `SideBarText` vive dentro de `LogsView.vue`, por lo que desaparece en otras rutas. El patrón de estado global ya existe (`textDataStore`, `logStore`, `authStore`) — reutilizamos el mismo estilo KISS: refs exportadas, sin Pinia.

Referencias visuales del usuario: Notion (título grande, campos inline), Excalidraw (swatches de color), wireframe propio (drawer izquierdo + reflejo en lista mientras se escribe).

## Goals / Non-Goals

**Goals:**
- Proyecto activo visible y persistente en el Header.
- Drawer izquierdo rápido para listar/crear/editar proyectos con auto-save.
- Un solo `SideBarText` global en rutas autenticadas.
- Logs scoped al proyecto activo (list + create).
- UI responsive (mobile + desktop) sin romper el layout actual de logs.

**Non-Goals:**
- Gestión de tags, meetings o cards por proyecto (solo preparar el contexto; esas entidades vienen después).
- Drag-and-drop de proyectos, archivado, permisos compartidos.
- Offline-first o sync conflict resolution.
- Pinia, nuevas librerías de UI, o abstracciones de servicio genéricas.

## Decisions

### 1. Store `projectStore` — mismo patrón que `textDataStore`

```ts
// refs: projects[], activeProjectId, drawerOpen, draftProject | null
// acciones: loadProjects, setActiveProject, openDrawer, closeDrawer, upsertDraft (debounced)
```

- `activeProjectId` se persiste en `localStorage` bajo clave fija (`fwl:activeProjectId`).
- Al iniciar sesión / montar app: fetch proyectos → si hay id persistido y existe en lista, seleccionarlo; si no, quedar sin proyecto activo.
- No usar Pinia: coherente con el resto del proyecto.

**Alternativa descartada:** composable-only sin store — rechazada porque Header, Drawer y LogsView necesitan el mismo estado.

### 2. Persistencia localStorage + API como fuente de verdad

- Proyectos viven en backend; localStorage solo guarda **id del proyecto activo** (no el objeto completo).
- Auto-save del draft llama `POST /project` (crear) o `PUT /project/:id` (editar) con debounce ~400ms vía composable `useProject`.
- Si el usuario escribe un título vacío, no crear en API hasta que haya al menos 1 carácter (o usar placeholder "Nuevo Proyecto" solo en UI hasta primer guardado).

**Alternativa descartada:** guardar proyectos enteros en localStorage — rechazada; no escala ni sincroniza entre dispositivos.

### 3. Header — slot central libre

Estructura del header (3 zonas):

| Izquierda | Centro (slot) | Derecha |
|-----------|---------------|---------|
| Logo + nombre app | Proyecto activo o CTA | Theme + logout |

- Proyecto activo: pill/badge con `backgroundColor` del color elegido + nombre truncado.
- Sin proyecto: texto link-style `"Seleccionar o crear proyecto"`.
- Click en cualquiera de los dos abre el drawer izquierdo.

Componente: `HeaderProjectSlot.vue` (UI pura) lee `projectStore`.

### 4. Drawer izquierdo — solo lista; formulario en ruta dedicada

- Componente `ProjectDrawer.vue`: panel izquierdo permanente con lista + `+ Crear` (sin formulario inline).
- Rutas: `/projects/new` (crear) y `/projects/:id` (editar) → `ProjectFormView.vue` en el área principal.
- Al crear: el título escrito se refleja en vivo en la lista izquierda; en edición solo se resalta el proyecto activo.
- Auto-save con debounce; comparar snapshot antes de PUT/POST para evitar loops.
- Cerrar panel (✕): solo oculta sidebar; no navega ni limpia formulario.
- **Seleccionar proyecto**: única acción que cierra panel, limpia draft y vuelve a `returnPath`.

### 5. `ColorPicker` — paleta fija estilo Excalidraw

Constante `PROJECT_COLORS` en `constants/projectColors.ts`:

```ts
{ id: 'neutral', value: '#f5f5f4', label: 'Neutral' } // default
// + 5–8 tonos pastel alineados con brand (orange, cyan, pink, mint, yellow...)
```

UI: fila de cuadrados `w-7 h-7 rounded-md`, borde/ring en seleccionado (como imagen Excalidraw). Sin input hex libre en v1.

Reutilizar espíritu de `helpers/pastel.ts` pero con colores **elegidos por el usuario**, no hash del nombre.

### 6. Logs scoped — `project_id` obligatorio en create; filtro en list

- `useLog.getLogs(projectId)` → `GET /log?projectId=...`
- `createLog` incluye `projectId` del store activo.
- Si no hay proyecto activo: `LogsView` muestra estado vacío con CTA al drawer (no fetch de logs).
- Al cambiar `activeProjectId`: watcher en `LogsView` recarga logs y `clearLog()`.

Backend (logger-brain, fuera del edit root pero documentado):
- `projects` table según entities.md.
- `logs.project_id` NOT NULL (migración; logs existentes necesitan proyecto default o nullable temporal — ver Open Questions).

### 7. Shell global — `App.vue` layout de 3 columnas

```
[ Header full width ]
[ main content (RouterView) | SideBarText ]
[ ProjectDrawer overlay ]
```

- Quitar `SideBarText` de `LogsView.vue`.
- `main` usa `flex` con padding derecho que respete el ancho colapsado/expandido del sidebar (igual que hoy en desktop).
- `SideBarText` sin cambios de contrato de store; solo cambia el padre.

Delta spec para `sidebar-writer`: requisito de montaje global.

### 8. Composable `useProject` — thin axios wrapper

Métodos: `getProjects`, `createProject`, `updateProject` — mismo patrón que `useLog`. Sin capa service/interceptor extra.

Debounce de auto-save vive en el drawer (o helper `debounce.ts` mínimo si no existe).

## Risks / Trade-offs

- **[Risk]** Backend sin `project_id` en logs rompe filtrado → **Mitigation:** implementar backend en paralelo como primer bloque de tasks; frontend puede mockear brevemente solo en dev si hace falta.
- **[Risk]** Logs legacy sin `project_id` tras migración → **Mitigation:** script de migración asigna un "Proyecto Default" por usuario, o columna nullable temporal hasta limpieza manual.
- **[Risk]** Auto-save agresivo genera muchos requests → **Mitigation:** debounce 400ms; PUT solo si hay cambios (shallow compare name/description/color).
- **[Risk]** Drawer + sidebar derecho compiten en mobile → **Mitigation:** drawer full-height con z-index > sidebar; sidebar sigue bottom sheet como hoy.
- **[Risk]** Usuario cierra drawer sin seleccionar → **Mitigation:** proyecto activo no cambia; draft queda guardado en API.

## Migration Plan

1. Backend: schema + migrate + endpoints project + alter logs.
2. Frontend: store + API + Header slot + Drawer + ColorPicker.
3. Mover SideBarText a App.vue; ajustar padding layout.
4. Conectar logs a projectId.
5. Smoke test mobile + desktop.

Rollback: revert frontend puede ocultar slot de proyecto; backend migration requiere down migration manual.

## Open Questions

Resueltas:

1. **Logs existentes:** crear "Proyecto Default" por usuario en migración; `project_id` NOT NULL.
2. **Sin proyecto activo:** restricción solo en creación de logs; listado visible (todos o filtrados si hay proyecto activo).
3. **Backend + frontend:** implementados juntos en el mismo ciclo.
