## Why

La app empieza a organizarse alrededor de **Proyectos** como contenedor principal (logs, tags, reuniones, etc.), pero hoy no existe forma de elegir un proyecto activo ni de crearlo desde la UI. Sin contexto global, los logs no pueden filtrarse por proyecto y el writer (`SideBarText`) queda acoplado a una sola vista en lugar de acompañar al usuario en toda la app autenticada.

## What Changes

1. **Contexto global de proyecto activo** en el `Header`: slot central que muestra nombre + color del proyecto seleccionado; si no hay proyecto, texto clickeable para abrir el panel de proyectos. Estado en store simple (ref), persistido en `localStorage` con fallback al último proyecto usado.
2. **Drawer / sidebar izquierdo** para listar y crear proyectos: lista con color por proyecto, botón `+ Crear`, vista inline de nuevo/edición con título grande, descripción opcional y selector de color estilo Excalidraw. Auto-guardado mientras se escribe (nombre reflejado en la lista al instante). Color por defecto neutro. Botón **Seleccionar proyecto** fija el contexto global y cierra el drawer volviendo a la ruta anterior.
3. **Logs acotados al proyecto activo**: crear y listar logs usando `project_id` del proyecto seleccionado; recargar al cambiar de proyecto.
4. **`SideBarText` global**: un solo panel fijo a la derecha en `App.vue` (no importado por vista), visible en cualquier ruta autenticada, manteniendo el comportamiento responsive actual.
5. **Backend mínimo en `logger-brain`** (dependencia): tabla/schema `projects`, columna `project_id` en `logs`, endpoints CRUD de proyectos y filtro de logs por proyecto. Sin esto el frontend no puede persistir proyectos ni filtrar logs de verdad.

## Capabilities

### New Capabilities

- `active-project-context`: Proyecto activo global, persistencia en localStorage, slot en Header y helpers de storage.
- `project-drawer`: Drawer izquierdo — listado, creación/edición inline, auto-save, selección de proyecto activo y navegación de retorno.
- `project-color-picker`: Componente reutilizable de paleta de colores (swatches cuadrados, selección visual, color neutro por defecto).
- `project-scoped-logs`: Logs filtrados y creados bajo el `project_id` del proyecto activo; bloqueo o aviso si no hay proyecto seleccionado.
- `global-app-shell`: Layout autenticado con `SideBarText` único a nivel app, responsive, sin romper el flujo actual de logs.

### Modified Capabilities

- `sidebar-writer` (delta en `log-form-adjust`): El writer deja de montarse en `LogsView` y pasa a vivir en el shell global; su contrato de store no cambia, solo su ubicación en el árbol de componentes.

## Impact

- **Frontend (`mission-log`)**: `App.vue`, `Header.vue`, nuevo store `projectStore`, utils de localStorage, drawer de proyectos, color picker, `useLog` / `LogForm` / `LogsView`, interfaces `Project`, router (ruta de retorno opcional vía state).
- **Backend (`logger-brain`)**: nuevo schema `projects`, migración `project_id` en `logs`, routes/controllers/services/validations para `/project` y query `?projectId=` en `/log`. Fuera del `allowedEditRoots` de este change OpenSpec pero bloqueante para la integración real.
- **Sin nuevas dependencias npm** previstas; Tailwind + patrones existentes (stores ref, composables, axios).
- **Responsive**: drawer izquierdo como overlay en mobile; header y sidebar derecho deben seguir usables en pantallas pequeñas.
