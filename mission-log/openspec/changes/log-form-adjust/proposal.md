## Why

`SideBarText.vue` already binds directly to `textDataStore` (fixed in a previous session), but it still has a leftover `props.textData` + local `watch` that duplicated state without being wired to anything, so the "expand on new content" behavior is currently dead code. On top of that cleanup, the writer panel and its surrounding log workflow are missing several small but high-friction pieces the user hits every day: no quick way to copy the generated report, finishing a task silently drops the write-up if the comment field was never filled, saving a log requires tabbing out instead of just hitting Enter, starting a fresh log requires reaching for the mouse, and the panel has no responsive behavior for mobile. Bundling these into one change keeps the writer panel and its integration with the log form consistent instead of patching them one at a time.

## What Changes

1. Remove the dead `props.textData` / local `data` ref / `watch` in `SideBarText.vue`. The textarea already `v-model`s the store's `textData` directly — the expand-on-new-content behavior needs a new mechanism since it can no longer key off a prop change (see design.md for the "no watcher" approach).
2. Add a small copy-to-clipboard button to `SideBarText`.
3. When a task is marked finished and its `comment` is empty, save it using the current writer content, sent to the backend in the same update request that marks it completed.
4. Enter (in addition to the current Tab-out) triggers save for both creating a new log and updating the selected one.
5. A global "+" shortcut, active while the log form is mounted, **replaces** the existing (unguarded) `Backspace`-clears-log shortcut entirely. It clears the currently selected log (starts a fresh entry) and moves focus to the description field — but must not fire while the user is typing "+" inside a field, and must **not** clear the writer/sidebar text.
6. When a log is created **or** updated, its generated report is appended into the writer content automatically. If the writer already has content, the new report is appended below a `---` divider instead of overwriting it. The existing manual "Informe" button switches to the same append behavior instead of overwriting.
7. `SideBarText` gains format awareness (`'plain' | 'markdown'`, default `'plain'`) so it can visually indicate markdown content (accent color) while staying a plain editable textarea — no rendering, no preview. The auto-generated report (`generateLogInfo`, which already emits `#`-style markdown headers) is the first thing tagged `'markdown'`.
8. Responsive/mobile layout for the writer panel — the current fixed `w-96` side rail does not work on small viewports.

## Capabilities

### New Capabilities
- `sidebar-writer`: The `SideBarText` writer panel's own contract — direct store binding, expand/collapse ownership, copy-to-clipboard, append-vs-overwrite content updates, multi-format support (plain/markdown), and responsive layout.
- `log-quick-actions`: Keyboard-driven and lifecycle-driven shortcuts around the log form — Enter-to-save on create/edit, "+" to start a new log without touching the writer, auto-populating the writer on log creation, and autosaving the writer content as the comment when finishing a task without one.

### Modified Capabilities
_None — no existing specs in `openspec/specs/` yet; this is the first change for this project._

## Impact

- Frontend only: `mission-log/src/commons/SideBarText.vue`, `mission-log/src/store/textDataStore.ts`, `mission-log/src/views/logs/LogsView.vue` (drop the now-unused prop pass-through), `mission-log/src/components/Logger/Form/LogForm.vue`, `mission-log/src/components/Logger/Form/LogStore.vue`.
- No backend changes expected: `PUT /log/:id` already accepts a partial body (already used today for both `{ comment }` and `{ completed }` independently via `useLog().updateLog`), so sending `{ completed, comment }` together needs no API change.
- No new runtime dependency planned for this iteration (markdown stays visually-indicated source text, not rendered HTML) — see design.md Open Questions if that scope changes later.
