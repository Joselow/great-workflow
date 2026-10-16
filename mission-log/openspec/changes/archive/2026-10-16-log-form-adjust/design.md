## Context

`SideBarText.vue` currently has leftover dead code from the prop → store migration: a `props.textData` nobody passes anymore in a meaningful way, a local `data` ref, and a `watch(() => props.textData, ...)` that both copied the value locally and drove `expanded`. The textarea itself already `v-model`s `textData` (destructured straight from `textDataStore`), so the watch no longer does anything useful — but removing it also removes the only thing currently setting `expanded = true`.

Separately, `LogForm.vue` already has one precedent for a global keyboard shortcut: a `window.addEventListener('keydown', handleKeyDown)` that clears the selected log on `Backspace`, with no guard for whether the user is typing inside a field. **Resolved:** this shortcut is replaced outright by `+` (not kept alongside it) — see Decision 5.

## Goals / Non-Goals

**Goals:**
- Make `expanded` driven by the store, not a component-local watcher over a prop that no longer exists.
- Give the writer panel a copy button, append-vs-overwrite content updates, a `format` prop, and a usable mobile layout.
- Wire the log form's Enter/`+` shortcuts and the finish-task/create-log integrations with the writer content.

**Non-Goals:**
- Rendering markdown to HTML (a real markdown pipeline + sanitizer) or any live preview. Confirmed: text-only with a visual indicator, no rendering.
- Per-instance writer state — `SideBarText` stays a singleton panel backed by the singleton `textDataStore`, same pattern as today. Multi-instance support is out of scope.

## Decisions

### 1. `expanded` moves into `textDataStore`, driven by the mutators — not a watcher

You asked: keep the expand behavior, but without a `watch`, since there's no prop to watch anymore and the local copy is gone. Three options considered:

- **A. `watchEffect`/`watch` on the store's `textData` from within the component.** Still a watcher, just implicit — doesn't actually address the concern, and re-derives "did new content arrive" reactively downstream from where it actually happened.
- **B. A `computed` deriving `expanded` from `!!textData.value`.** Rejected: the toggle button needs to be able to *collapse* the panel even while content is present (manual override), which a pure derived computed can't hold — you'd need a second piece of state anyway, defeating the point.
- **C. (Chosen) Move `expanded` ownership into `textDataStore` itself, alongside `textData`.** `setTextData` and `appendTextData` set `expanded.value = true` as part of the mutation — the same place that already knows "new content just arrived." `SideBarText` reads `textDataStore.expanded` and calls `textDataStore.toggleExpanded()` from the tab button; no watcher anywhere.

This is a **cohesion** argument: the moment something knows content changed is the mutator itself, not a reactive side-channel. It also means any future second consumer of the writer store gets consistent expand behavior for free.

### 2. Copy button uses the Clipboard API only

`navigator.clipboard.writeText`, wrapped in try/catch, reporting through the existing `successToast`/`errorToast` helpers (`useAlerts.ts`) — same feedback mechanism already used everywhere else in the app. No `document.execCommand('copy')` legacy fallback (Non-Goal) — the app already targets modern Chromium-class browsers (see Vite 8 / vue-tsc tooling baseline).

### 3. Append-vs-overwrite lives on the store, not the caller; triggers on both create and update

`textDataStore.appendTextData(text, format?)`: if current `textData` is empty, behaves like `setTextData`; otherwise concatenates `${current}\n\n---\n\n${text}`. **Resolved:** this is called after both a successful create *and* a successful update in `LogForm.vue` (`handleCreate` and `handleUpdate`), not creation only — plus the manual "Informe" button (`handleGenerateInfo`), so the divider logic exists in exactly one place.

The store itself stays task-agnostic, per your note — it never receives or holds a `Log`. Callers (`LogForm.vue`) are the ones that already have the log data and call `generateLogInfo(log)` to build the string; the store's job is only to store/append/format that already-built string, same as today.

### 4. `format` moves into the store alongside `textData`/`expanded`, not a component prop

Originally scoped as a `format` prop on `SideBarText`. Revised for consistency with Decision 1: `SideBarText` already takes zero props and reads everything from `textDataStore` directly, so `format` (`'plain' | 'markdown'`, default `'plain'`) becomes a third store-owned ref, set by whichever mutator call provides it — `setTextData(text, format?)` / `appendTextData(text, format?)`, defaulting to `'plain'` when omitted. This directly answers "¿cómo pasa a establecerse como markdown?": `handleGenerateInfo` and the create/update auto-append calls pass `'markdown'` explicitly, since `generateLogInfo` already emits `#`-style headers.

**Resolved:** no rendered preview. `'markdown'` only changes the textarea's accent border/text color (e.g. `brand-cyan`) as a visual cue — content stays a plain editable `<textarea>`. No new dependency needed.

### 5. Keyboard shortcuts guard on focused element; `+` fully replaces `Backspace`

- Enter-to-save is bound directly on the log form's `<input>` elements (`@keydown.enter.prevent`), so it's naturally scoped — no global listener needed.
- The existing global `Backspace` handler in `LogForm.vue` is **removed**, not kept alongside the new one. `+` becomes the only clear-log shortcut, on the same global `keydown` listener, guarded so it does not fire when `event.target` is an `INPUT`/`TEXTAREA`.
- **Resolved:** after clearing, focus moves to the description field. Rather than threading a signal from `LogForm.vue` (where the shortcut lives) down into `LogStore.vue` (where the description `<input>` and its existing `descriptionRef` live), this reuses the `watch(selectedLog, ...)` already in `LogStore.vue` — its `else` branch (taken whenever `selectedLog` becomes falsy, which is exactly what `clearLog()` produces) resets the form fields today; it now also calls `descriptionRef.value?.focus()`. No new cross-component wiring — same cohesion argument as Decision 1: the place that already reacts to "the log was cleared" is where the focus side effect belongs. (This also means the form autofocuses the description field on initial mount, since the watcher runs with `immediate: true` — a reasonable, unrequested-but-harmless side effect of reusing this watcher rather than special-casing it.)

### 6. Comment-on-finish reuses the existing partial-update endpoint

`handleConfirmFinishTask` already calls `updateLog(id, { completed: ... })`. When `!selectedLog.value?.comment`, the payload becomes `{ completed: ..., comment: textData.value }` in the same request — no new backend route, since `PUT /log/:id` already accepts arbitrary partial fields (proven today by `SaveComment.vue`'s independent `{ comment }`-only update).

## Risks / Trade-offs

- **[Risk]** A global `+` listener could still leak into contexts you didn't intend (e.g. focus inside a modal's input that isn't one of the three log fields) → **Mitigation**: guard checks element tag (`INPUT`/`TEXTAREA`), not a specific field allowlist, so it's robust to new fields being added later.
- **[Risk]** Auto-appending a report on every create *and* update, plus the manual button, means the writer content can grow unbounded over a long session → **Mitigation**: none needed now; the user already has `clearTextData()` available; no auto-truncation planned (Non-Goal).
- **[Risk]** Reusing the `selectedLog` watcher's `else` branch for focus means the description field also autofocuses on initial page load (not just on explicit `+` clears), since the watch runs with `immediate: true` → **Mitigation**: accepted as harmless; splitting "initial mount" from "explicit clear" would need new state for no real benefit.
- **[Risk]** Moving `expanded` into the shared store makes it app-wide singleton state by construction → **Mitigation**: acceptable, matches how `textDataStore` already works; revisit only if a second `SideBarText` instance is ever needed.

## Migration Plan

Pure frontend change, no data migration. No feature flag planned — ship directly since none of the changes are behind an API contract the backend needs to coordinate on.

## Resolved Decisions

All Open Questions from the initial draft are resolved:

1. **Auto-append trigger scope:** happens on both create **and** update (not creation-only). The store stays task-agnostic — callers pass already-built strings.
2. **Mobile layout:** bottom-anchored drawer approach confirmed.
3. **Markdown scope:** no preview, no rendering, no new dependency — accent-color indicator only.
4. **`Backspace` shortcut:** removed outright, replaced by `+`. Clearing also focuses the description field (via the existing `LogStore.vue` watcher, see Decision 5).
