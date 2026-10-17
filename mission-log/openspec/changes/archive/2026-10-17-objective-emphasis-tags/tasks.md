## 1. Keywords (`logger-brain`)

- [x] 1.1 Add `objectiveKeywords` in `src/utils/objectiveKeywords.ts` and verify with `pnpm exec tsx` that `Definir *API* para el _cliente_` yields `API`, `cliente`; `Acordar *cerrar alcance* hoy` yields `cerrar alcance`; `*_API_*` and `_*API*_` each yield `API` once; `Revisar *API* y luego _api_` yields `API`; `foo_bar_baz`, an unclosed `*API`, and a mark split across two lines yield nothing
- [x] 1.2 Add `nextStepTags(projectName, objective)` in that same file and verify with `pnpm exec tsx` that no keywords stay `reunión, Alpha`, `*API* para el _cliente_` becomes `reunión, Alpha, API, cliente`, a keyword equal to the project name or `reunión` is not repeated, and a keyword that would pass 255 characters is dropped whole while earlier keywords remain

## 2. Next-step write (`logger-brain`)

- [x] 2.1 Pass the objective that will be stored into `nextStepLabels` from create and from update (`changes.objective` when present, otherwise the stored objective) and use `nextStepTags` for `tags`; verify both call sites pass that objective and `syncNextSteps` still updates only `source` `meeting` logs
- [x] 2.2 Run `pnpm typecheck` in `logger-brain` and verify it exits 0

## 3. Form (`mission-log`)

- [x] 3.1 Add helper text on the objective, `Ctrl+B *negrita* y Ctrl+I _cursiva_ entran en los tags de los siguientes pasos.`, without a new input; verify the objective control is still one textarea and the helper is visible on the form
- [x] 3.2 Keep `generateMeetingSummary` sending the trimmed objective on its own line under `*Objetivo:*`, without stripping or wrapping `*` and `_`; verify a summary whose objective is `Cerrar *alcance* con el _cliente_` contains that exact body and a separate `*Objetivo:*` line
- [x] 3.3 On the objective textarea, Ctrl+B wraps the selection in `*` and Ctrl+I wraps it in `_`, the same shortcut removes that marker, and an empty selection inserts the pair with the caret between; verify those three cases on the form and that Ctrl+B in the title does not insert markers

## 4. End to end

- [x] 4.1 Save a meeting whose objective is `Definir *API* para el _cliente_`, with a project and one next step, and verify the new log's tags are `reunión, {project}, API, cliente`, the reloaded objective still shows the markers, and **Copiar resumen** puts `Definir *API* para el _cliente_` on the clipboard
- [x] 4.2 Change the objective keywords, save again, and verify the same next-step log's tags follow the new objective, while a log attached with `source` `log` keeps the tags it already had
