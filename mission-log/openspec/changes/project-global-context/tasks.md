## 1. Backend — Proyectos y logs (logger-brain)

- [x] 1.1 Crear schema Drizzle `projects` (`id`, `userId`, `name`, `description`, `color`, timestamps) según `entities.md`
- [x] 1.2 Agregar columna `projectId` a `logs` + relación; generar y aplicar migración
- [x] 1.3 Decidir y aplicar estrategia para logs existentes (proyecto default por usuario o nullable temporal)
- [x] 1.4 Validations Zod: `createProject`, `updateProject`
- [x] 1.5 Service + controller + routes: `GET/POST /project`, `PUT /project/:id` (auth required, scoped por user)
- [x] 1.6 Extender `GET /log` con query `projectId`; incluir `projectId` en create/update de logs

## 2. Frontend — Tipos, constantes y store

- [x] 2.1 Crear `interfaces/project.ts` (`Project`, `NewProject`, `PartialProject`)
- [x] 2.2 Crear `constants/projectColors.ts` con paleta fija + color neutro default
- [x] 2.3 Crear `utils/activeProjectStorage.ts` (get/set/clear `fwl:activeProjectId`)
- [x] 2.4 Crear `composables/useProject.ts` (getProjects, createProject, updateProject vía apiApp)
- [x] 2.5 Crear `store/projectStore.ts` (projects, activeProjectId, drawerOpen, draft, load/setActiveProject/open/close)

## 3. Frontend — Color picker y Header

- [x] 3.1 Crear `components/Project/ColorPicker.vue` (swatches, v-model color, ring en seleccionado)
- [x] 3.2 Crear `components/Header/HeaderProjectSlot.vue` (pill con color + nombre o CTA)
- [x] 3.3 Integrar slot central en `Header.vue`; click abre drawer

## 4. Frontend — Project drawer

- [x] 4.1 Crear `components/Project/ProjectDrawer.vue` (overlay izquierdo, backdrop, close)
- [x] 4.2 Vista lista: proyectos con color, botón `+ Crear`, click abre edit
- [x] 4.3 Vista edit: título grande, descripción opcional, ColorPicker, reflejo en lista en tiempo real
- [x] 4.4 Auto-save con debounce (~400ms) llamando create/update según draft nuevo o existente
- [x] 4.5 Botón **Seleccionar proyecto**: setActiveProject, persist localStorage, cerrar drawer, volver a ruta previa

## 5. Frontend — Shell global y SideBarText

- [x] 5.1 Mover `SideBarText` a `App.vue` en layout autenticado (flex main + sidebar)
- [x] 5.2 Montar `ProjectDrawer` en `App.vue`
- [x] 5.3 Quitar `SideBarText` de `LogsView.vue`; ajustar clases/padding del main para no romper desktop ni mobile
- [x] 5.4 Verificar que writer persiste contenido y expanded al navegar entre rutas autenticadas

## 6. Frontend — Logs por proyecto

- [x] 6.1 Extender `interfaces/Log.d.ts` con `projectId`
- [x] 6.2 Actualizar `useLog`: `getLogs(projectId)`, `createLog` con `projectId`
- [x] 6.3 En `LogsView`: watcher de activeProject → reload logs + clearLog; empty state si no hay proyecto
- [x] 6.4 Pasar `projectId` desde store en `LogForm` al crear log
- [x] 6.5 Al montar app autenticada: `loadProjects()` + restaurar activeProject desde localStorage

## 7. Verificación

- [x] 7.1 Smoke test desktop: header proyecto, drawer, auto-save, seleccionar, logs filtrados, sidebar global
- [x] 7.2 Smoke test mobile: drawer overlay, bottom sidebar, contenido principal usable
- [x] 7.3 Typecheck frontend (`pnpm` en mission-log) y backend si aplica
