## Why

Navigation shortcuts already exist (`Mayús+C`, `Mayús+M`, `Mayús+L`, `Mayús+P`, and `+` on Logs), but they are hardcoded in two listeners and nowhere documented. A person cannot discover them, and each new shortcut has to be wired by hand.

## What Changes

- Add one command registry as the only source of shortcut definitions, matching, and actions. The authenticated shell uses a single listener. The help view reads that same list.
- Document every registered command in a lazy-loaded modal: Spanish plain text, grouped, with key chips. No search. Rows do not run actions.
- Open and close that modal with **Mayús** together with the `/` character. The `?` character is not the shortcut.
- Toggle the Writer panel with **Mayús+W**, using the same expanded state as the existing tab.
- Keep the current commands: Cards, Meetings, Logs, project drawer, and `+` to clear the selected log. Ignore shortcuts while typing, and ignore `Ctrl`, `Alt`, and `Meta`.
- While the help modal is open, only **Mayús+/** and **Esc** close it. Other commands wait.
- Add a small header control that opens the same modal, so the shortcut is visible.

## Capabilities

### New Capabilities

- `keyboard-commands`: One registry and one listener for global and scoped shortcuts, including guards and the Writer toggle.
- `keyboard-shortcuts-help`: Lazy documentation modal, Spanish plain text sourced from the registry, opened with Mayús+/.

### Modified Capabilities

- `sidebar-writer`: The Writer panel also toggles from the registered Mayús+W command. Click and double-click on the tab stay as they are. Content is not cleared.

## Impact

- `mission-log/src/App.vue`: replace the hardcoded `keydown` chain with the registry listener. Lazy-mount the help modal in the authenticated shell.
- `mission-log/src/components/Logger/Form/LogForm.vue`: remove its own `+` listener. The registry keeps the existing Logs behavior (clear the selection, do not clear the writer, do not fire inside a field).
- `mission-log/src/commons/SideBarText.vue` and `textDataStore`: Mayús+W flips `expanded`. No layout change. The in-flight `writer-panel-responsive` change still owns the rail and bottom-sheet layout.
- `mission-log/src/components/Header.vue`: a control that opens the help modal.
- No API, schema, or new dependency. `project-drawer` and `log-quick-actions` requirements stay as they are; those actions are only registered and documented here.
