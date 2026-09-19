## 1. Dark mode select

- [ ] 1.1 In `CardListFilters.vue`, drop the hardcoded chip `color: '#1f2937'`, use `text-gray-800 dark:text-gray-100`, and add `dark:[color-scheme:dark]` on the `<select>` (same as `CardProjectSelect`); verify project names are readable in the open list in dark mode
- [ ] 1.2 Confirm `CardProjectSelect.vue` already follows that pattern; align any leftover contrast gap; verify the form picker options stay readable in dark mode

## 2. Restore active project

- [ ] 2.1 In `App.vue`, wait for `router.isReady()` before `checkAuth` / `getActiveProject`; do not return solely because setup-time `route.meta.requiresAuth` is empty; verify reload of `/cards` or `/cards/:id` shows the header chip from `fwl:activeProject`
- [ ] 2.2 If the first route is public, restore once when navigating to an authenticated route; verify `/c/:id` still does not call `GET /app/project`

## 3. Persist cards list filter

- [ ] 3.1 Store the gallery project filter as `fwl:cardsProjectFilter` (`all` | `null` | uuid) via existing storage helpers; read it before the first list fetch on `/cards`; write it when the filter changes; invalid/unknown → `all`; verify Todos / Global cards / a project survive reload
