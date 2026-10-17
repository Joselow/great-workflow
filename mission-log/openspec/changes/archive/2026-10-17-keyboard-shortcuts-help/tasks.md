## 1. Command registry

- [x] 1.1 Add `src/composables/useKeyboardCommands.ts` as a module singleton with the seven commands from design.md (id, group, Spanish label, keys, `match`, `when`, `run`), plus `helpOpen`, `openHelp`, `closeHelp`, and `toggleHelp`, and verify the modal can read that same array without a second list
- [x] 1.2 Implement `handleKeydown` with the guards from design.md (authenticated route only, skip input/textarea/select/contentEditable, skip Ctrl/Alt/Meta, skip other commands while help is open) and verify the help match is `shiftKey && event.key === '/'` and `?` is not matched

## 2. Shell listener

- [x] 2.1 Replace the `keydown` chain in `App.vue` with the shared handler, register it on mount and remove it on unmount, and verify the old `isShiftC` / `isShiftP` / `isShiftL` / `isShiftM` blocks and their `console.log` calls are gone
- [x] 2.2 Lazy-render the help modal from `App.vue` with `defineAsyncComponent` and `v-if="helpOpen"`, and verify the modal file is a dynamic import and is not rendered while help is closed

## 3. Existing actions

- [x] 3.1 Point Mayús+C, Mayús+M, and Mayús+L at `cards`, `meetings`, and `logger`, and point Mayús+P at the current drawer toggle (`closeDrawer` when open, `showProjectsDrawer(route.path)` when closed), and verify those four commands call the existing navigation and drawer functions
- [x] 3.2 Point Mayús+W at `textDataStore.toggleExpanded()` only, and verify `SideBarText.vue` layout classes are unchanged
- [x] 3.3 Remove the `window` keydown listener from `LogForm.vue`. Register a clear-log callback on mount and clear it on unmount. Expose `focusDescription` from `LogStore.vue`. The callback clears the selected log and focuses the description field, and verify `LogForm.vue` no longer calls `addEventListener` for keydown

## 4. Help modal

- [x] 4.1 Add the help modal component using `ModalBase` bound to `helpOpen`, with groups Navegar, Paneles, Logs, and Ayuda, the Spanish rows and `<kbd>` chips from design.md, title **Atajos de teclado**, and footer **Esc o Mayús+/ para cerrar**, and verify there is no search field and the rows are not buttons
- [x] 4.2 Add a header button with accessible name **Atajos de teclado** beside the theme toggle that calls `openHelp()`, and verify it opens the same modal as Mayús+/

## 5. Verification

- [x] 5.1 Run `pnpm exec vue-tsc -b` in `mission-log` and verify it exits 0
- [x] 5.2 On an authenticated page, verify Mayús+C/M/L navigate, Mayús+P toggles the project drawer, Mayús+W toggles Writer without changing its text, and Mayús+/ (the `/` character) opens and closes the modal
- [x] 5.3 Verify `?` does not open the modal, shortcuts do nothing inside a text field and on login, `+` on Logs clears the selection and focuses the description, and with the modal open Mayús+C does not navigate while Esc closes it
