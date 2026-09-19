## Context

See proposal.md for why. `fwl:activeProject` already writes via `useProjectSelected`. The cards list filter is a local ref defaulting to `all` and never stored. `App.vue` `startApp()` returns immediately when `route.meta.requiresAuth` is falsy — on reload that meta is often empty during setup, so the store never reads localStorage. The list `<select>` hardcodes `color: '#1f2937'` and has no `color-scheme: dark`, so native options wash out. `CardProjectSelect` already uses `dark:[color-scheme:dark]`.

## Goals / Non-Goals

**Goals:**
- Readable project options in dark mode on the cards filter (same pattern as the form picker).
- Header active project restored from `fwl:activeProject` after the router is ready, on authenticated routes.
- Cards list project filter survives reload via its own localStorage key.

**Non-Goals:**
- Binding the list filter to `activeProject` (still independent: header vs gallery).
- Persisting search text or Prompt/Meeting pills.
- Changing how the card form saves `projectId` (that is the API, not this storage bug).
- Public routes still must not fetch `/app/project`.

## Decisions

### 1. Restore active project after `router.isReady()`, not on the first setup tick

- **A. Keep `if (!route.meta.requiresAuth) return` at setup** — meta is often empty; restore never runs. This is the bug.
- **B. (Chosen)** `await router.isReady()` then: if the matched route requires auth, `checkAuth()` + `getActiveProject()`. If the user later lands on a public route first and then navigates to `/cards`, watch `route.meta.requiresAuth` and run restore once when it becomes true (idempotent if the store already has an active project).

Still skip `showProjectsDrawer` / `GET /project` on public pages.

### 2. Cards list filter gets its own storage key

- **A. Reuse `fwl:activeProject` for the list** — mixing header and gallery. Rejected.
- **B. (Chosen)** `fwl:cardsProjectFilter` = `'all' | 'null' | <uuid>`. Read on `/cards` mount (before first fetch). Write on change. Invalid / missing / unknown uuid → `all`.

Reuse `getStoredData` / `setStoredData` from `activeProjectStorage.ts` (plain string, no JSON needed).

### 3. Dark select: `color-scheme` + no hardcoded chip text color

Match `CardProjectSelect`: `dark:[color-scheme:dark]`, chip text `text-gray-800 dark:text-gray-100` (drop inline `color: '#1f2937'`). Native `<option>` follows the OS/dark color-scheme; do not invent a custom dropdown.

## Risks / Trade-offs

- **[Risk]** `router.isReady()` slightly delays header project chip → **Mitigation**: acceptable; today the chip is missing entirely after reload.
- **[Risk]** Stale uuid in the list filter after project delete → **Mitigation**: treat as `all`.
- **[Risk]** Native `<option>` styling still varies by OS → **Mitigation**: `color-scheme: dark` is the reliable lever; same as the form picker.

## Migration Plan

Frontend only. Existing `fwl:activeProject` values stay valid. New key starts empty (Todos). Rollback: revert the three files; leftover `fwl:cardsProjectFilter` is harmless.

## Open Questions

None.
