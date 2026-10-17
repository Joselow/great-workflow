## Context

Shortcuts are a `keydown` chain in `App.vue` (`Shift+C`, `Shift+M`, `Shift+L`, `Shift+P`) plus a second `window` listener in `LogForm.vue` for `+`. `Shift+P` already toggles the project drawer. The Writer panel (`SideBarText`) toggles only from its tab, through `textDataStore.toggleExpanded()`. See proposal.md for why this changes.

The shell already lazy-loads `ProjectDrawer` with `defineAsyncComponent`, and `ModalBase` already provides the overlay, backdrop, Escape, and responsive widths. Stores are module singletons (`textDataStore`, `logStore`, `projectStore`), not Pinia.

`writer-panel-responsive` is an open change on the same panel. This change only flips `expanded`. It does not restyle the rail or the bottom sheet.

## Goals / Non-Goals

**Goals:**

- One command list that both the listener and the help modal read.
- Match **Mayús** plus the `/` character on a Spanish keyboard (`Shift+7`).
- Toggle Writer with **Mayús+W** through the existing store.
- Keep `+` as the Logs action already required by `log-quick-actions`, with a single listener.

**Non-Goals:**

- Search, a command palette, or rows that run actions.
- Treating `?` as the help shortcut.
- A `/shortcuts` route.
- Writer layout, copy, or clear behavior.
- New dependencies or Pinia.

## Decisions

### 1. One singleton module, same style as the other stores

`src/composables/useKeyboardCommands.ts` exports one shared object: the command array, `helpOpen`, `openHelp` / `closeHelp` / `toggleHelp`, and `handleKeydown`. `App.vue` registers that handler once. The modal and the header read the same object.

Each command has `id`, `group`, Spanish `label`, optional `scopeLabel`, display keys, `match`, `when`, and `run`. Adding a shortcut means adding one record.

**Alternative:** a static catalog plus separate handlers in each view. Rejected. That is the split this change removes.

**Alternative:** Pinia. Rejected. The app does not use it.

### 2. Help matches the slash character, not the question mark

```ts
event.shiftKey && event.key === '/'
```

On a Spanish keyboard, Mayús+7 produces `/` with `shiftKey`. The `?` key (Mayús+`'`) produces `?` and does not match. Do not also match `event.key === '?'` or `event.code === 'Slash'`.

Letter commands use `event.shiftKey && event.key.toLowerCase() === '<letter>'`.

The handler returns immediately when:

- `route.meta.requiresAuth` is not set
- the target is `INPUT`, `TEXTAREA`, `SELECT`, or `isContentEditable`
- `ctrlKey`, `altKey`, or `metaKey` is set
- `helpOpen` is true and the event is not the slash command (Escape still reaches `ModalBase`)

The first matching command with `when()` true runs, then `preventDefault()`. Remove the `console.log` calls in the current handler.

### 3. Actions reuse what already exists

| Command | Action |
|---|---|
| Mayús+C / M / L | `router.push` to `cards`, `meetings`, `logger` |
| Mayús+P | close the drawer if `drawerOpen`, otherwise `showProjectsDrawer(route.path)` |
| Mayús+W | `textDataStore.toggleExpanded()` |
| Mayús+/ | `toggleHelp()` |
| `+` | the Logs clear action below |

`+` applies only while Logs is mounted and a log is selected. `LogForm.vue` drops its listener. On mount it registers one callback; on unmount it clears it. That callback calls `clearLog()` and focuses the description input `LogStore.vue` already keeps in `descriptionRef` (expose a `focusDescription`). `when()` is "callback registered and a log is selected". The writer text is not touched.

### 4. The modal is lazy and read-only

`App.vue` renders the help modal with `v-if="helpOpen"` and `defineAsyncComponent`, so the file loads on first open. The component is UI only. It uses `ModalBase` (`v-model` bound to `helpOpen`, `maxWidth="md"`) and lists `commands` grouped in this order: **Navegar**, **Paneles**, **Logs**, **Ayuda**.

Copy, in Spanish:

| Group | Label | Keys | Scope |
|---|---|---|---|
| Navegar | Ir a Cards | Mayús C | |
| Navegar | Ir a Meetings | Mayús M | |
| Navegar | Ir a Logs | Mayús L | |
| Paneles | Abrir o cerrar proyectos | Mayús P | |
| Paneles | Abrir o cerrar Writer | Mayús W | |
| Logs | Quitar el log seleccionado | + | En Logs |
| Ayuda | Abrir o cerrar esta ayuda | Mayús / | |

Title: **Atajos de teclado**. Footer: **Esc o Mayús+/ para cerrar**. Keys are `<kbd>` chips (small radius, fine border, no heavy shadow). Rows are not buttons. No search input.

The header control sits with the theme toggle. It is a button with accessible name **Atajos de teclado** and calls `openHelp()`.

### 5. Writer layout stays out of this change

Mayús+W calls `toggleExpanded()` only. Do not edit the rail, the bottom sheet, or the responsive classes. Those belong to `writer-panel-responsive`.

## Risks / Trade-offs

- [Spanish `/` vs US `?`] On a US keyboard, Shift+/ produces `?` and will not open help. → Accepted. The shortcut is the `/` character with Shift.
- [`App.vue` and `SideBarText.vue` also change in `writer-panel-responsive`] → This change does not edit writer layout classes. The keyboard call goes through the store.
- [`+` focus is specified and not implemented today] The current listener only calls `clearLog()`. → The registered callback adds the focus the `log-quick-actions` spec already requires. Clicking **Nuevo** stays as it is.
- [Help open blocks every other shortcut, including Mayús+W] → Intended. Esc or Mayús+/ closes it first.

## Migration Plan

Frontend only. No data migration. Rollback is reverting the listener to `App.vue` and `LogForm.vue`.

## Open Questions

None.
