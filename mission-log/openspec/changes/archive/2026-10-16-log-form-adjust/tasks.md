## 1. Writer store foundations (`textDataStore.ts`)

- [x] 1.1 Add an `expanded` ref plus `toggleExpanded()` to `textDataStore`, owned by the store instead of the component
- [x] 1.2 Add a `format` ref (`'plain' | 'markdown'`, default `'plain'`)
- [x] 1.3 Add `appendTextData(text, format?)`: overwrite when current content is empty, otherwise concatenate with a `\n\n---\n\n` divider; set `format` when provided
- [x] 1.4 Update `setTextData(text, format?)` to also accept/set `format`
- [x] 1.5 Make `setTextData` and `appendTextData` set `expanded.value = true` when the resulting content is non-empty

## 2. `SideBarText.vue`

- [x] 2.1 Remove `props.textData`, the local `data` ref, and the `watch` over the (no-longer-meaningful) prop
- [x] 2.2 Read/toggle `expanded` from `textDataStore` instead of local state
- [x] 2.3 Add a small copy-to-clipboard button using `navigator.clipboard.writeText`, wired to `successToast`/`errorToast`, with an empty-content guard
- [x] 2.4 Read `textDataStore.format` and apply an accent-color style when it's `'markdown'` (no prop, no rendering)
- [x] 2.5 Rework the panel layout for small viewports: bottom-anchored full-width drawer below the medium breakpoint, existing side-rail at `md+`

## 3. Call-site cleanup

- [x] 3.1 Remove the now-unused `:textData="textData"` prop pass-through in `LogsView.vue` (`SideBarText` reads the store directly)

## 4. Log form quick actions

- [x] 4.1 In `LogStore.vue`, add `@keydown.enter.prevent` (reusing/renaming the existing `onTab` handler) to the description, responsible, and tag inputs so Enter saves create/update the same way Tab-out does today
- [x] 4.2 In `LogStore.vue`'s existing `watch(selectedLog, ...)`, add `descriptionRef.value?.focus()` in the `else` branch (selected log cleared/absent)
- [x] 4.3 In `LogForm.vue`, remove the `Backspace`-based `handleKeyDown` entirely; replace with a `"+"`-based handler on the same global `keydown` listener, guarded so it does not fire when `event.target` is an `INPUT`/`TEXTAREA`
- [x] 4.4 In `LogForm.vue`'s `handleCreate` **and** `handleUpdate`, after a successful call, generate the report via `generateLogInfo` and call `textDataStore.appendTextData(text, 'markdown')`
- [x] 4.5 Update `handleGenerateInfo` to call `appendTextData(text, 'markdown')` instead of `setTextData` so the manual "Informe" button also appends
- [x] 4.6 In `handleConfirmFinishTask`, when `!selectedLog.value?.comment`, include `comment: textData` alongside `completed` in the single `updateLog` call

## 5. Verification

- [x] 5.1 Manually verify typing in `SideBarText` updates the store immediately with no stale/local-copy artifacts
- [x] 5.2 Manually verify Enter saves both the create flow and the edit flow
- [x] 5.3 Manually verify "+" clears the selected log, moves focus to the description field, does not touch the writer text, and does not fire while "+" is typed inside a field; verify `Backspace` no longer clears the log
- [x] 5.4 Manually verify finishing a task with an empty comment persists the writer content as the comment (check the network request payload)
- [x] 5.5 Manually verify the responsive layout at a mobile viewport width (e.g. 375px)
- [x] 5.6 Run `vue-tsc --noEmit` to confirm no type regressions
