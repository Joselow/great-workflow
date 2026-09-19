## Why

In dark mode the project `<select>` on `/cards` (and similar filters) is unreadable: native options render washed-out on a light popup. Separately, the active project is stored in localStorage (`fwl:activeProject`) but often does not come back after reload — `App.vue` skips restore when `route.meta.requiresAuth` is not ready yet, so the header shows “Seleccionar o crear proyecto”. The cards list filter always resets to Todos for the same reason: it lives only in memory.

## What Changes

- Make project dropdown options readable in dark mode (closed chip and open list).
- Restore `fwl:activeProject` into the store after the router is ready, on authenticated routes. Do not skip restore because the first setup tick lacks route meta.
- Persist the cards list project filter (Todos / Global cards / project id) in localStorage and restore it on `/cards` load.

## Capabilities

### New Capabilities
- `card-filter-dark-ui`: Dark-mode contrast for the cards project filter (and the same native select pattern on the card form picker).
- `project-selection-persist`: Restore the header active project from localStorage after router ready; persist and restore the cards list project filter.

### Modified Capabilities
- None — `openspec/specs/` has no main specs yet.

## Impact

- Frontend only (`mission-log`): `App.vue`, `CardListFilters.vue`, `CardProjectSelect.vue`, `CardsView.vue`. Reuse `activeProjectStorage` (or the same helpers) with a second key for the list filter.
- No API / schema changes. Not **BREAKING**.
