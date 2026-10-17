## Context

See proposal.md for why. Next-step logs already get their labels in `logger-brain` from `nextStepLabels(title, date, projectName)`. `tags` is `reunión, {project name}`, cut so the string stays within `varchar(255)`. `syncNextSteps` writes that same string on create and again on update. The meeting `objective` is already on the write (`varchar(255)`) and is not passed into `nextStepLabels`.

**Copiar resumen** builds text in `mission-log/src/helpers/meetingSummary.ts`. The objective goes through `textBlock`, which only trims, and sits on its own line under `*Objetivo:*`. Neither package has a test runner.

## Goals / Non-Goals

**Goals:**

- Derive keywords from the objective on the server, in the same place that already builds `tags`.
- Leave **Copiar resumen** as a pass-through of the objective text the owner typed.

**Non-Goals:**

- A rich-text editor, a keywords field, or a preview of the tags.
- Parsing any meeting field other than the objective.
- Changing `tags` on logs joined with `source` `log`.
- A backfill of logs for meetings that are not saved again.
- A new column, request field, or test runner.

## Decisions

### 1. The server derives the keywords

`nextStepLabels` gains the objective string. Create and update pass the objective that will be stored: on update, `changes.objective` when the request includes it, otherwise the objective already stored. The form already sends the objective on every save, and it always sends `nextSteps`, so a save refreshes tags.

The client does not parse or send tags. One function keeps the form and the API from drifting.

Alternative considered: parse in the form and send the tag string. The form would own a rule the API must trust, and a partial client could omit the words.

### 2. Scan each line for WhatsApp spans

Put the scan and the tag assembly in `logger-brain/src/utils/objectiveKeywords.ts`. That file imports nothing from the database or the environment, so it can be checked with `tsx` on its own. `nextStepLabels` calls it.

Split the objective on newlines. On each line, walk left to right and take the first span that fits, then continue after it. Try the two combined forms before the single forms, so `*_API_*` and `_*API*_` yield `API` once:

1. `*_ … _*`
2. `_* … *_`
3. `* … *`
4. `_ … _`

A span counts only when the opener is at the start of the line or right after whitespace, and the closer is at the end of the line, right before whitespace, or right before `. , ; : ! ?`. Inner text is trimmed. Empty inner text is skipped. This is what keeps `foo_bar_baz` from becoming a keyword.

Dedupe with a case-insensitive set, keeping the first spelling. Drop a keyword that equals `reunión` or the project name under that same comparison.

Alternative considered: a single non-greedy `*...*` / `_..._` search with no boundary. That treats the underscores in `foo_bar_baz` as italic.

### 3. Append keywords after the current prefix

Build the prefix exactly as today: `reunión, ` plus the project name, shortening only the project name when that prefix would pass 255 characters. Then append `, {keyword}` while the result is still at most 255 characters. Stop at the first keyword that does not fit. Do not slice a keyword.

An objective with no keywords leaves the prefix unchanged.

### 4. Copy does not interpret the markers

`generateMeetingSummary` keeps `section('Objetivo', textBlock(objective))`. `textBlock` stays trim-only. The body is not wrapped in another `*` or `_`. No HTML conversion.

The form adds one quiet line under the objective: `Ctrl+B` in bold, then `Ctrl+I` in italic. The existing label stays.

### 5. One contenteditable shows the formatting

`RichTextEditor.vue` edits the objective, the current status, and each agenda row. Ctrl+B and Ctrl+I use the browser editing commands and CSS shows `<strong>` and `<em>`. The field's value stays plain text: bold is `*text*` and italic is `_text_`. **Copiar resumen** already copies those strings, so the sidebar and the clipboard get the WhatsApp markers without storing HTML.

The app-wide shortcut listener already ignores Ctrl. The title stays a normal input. No rich-text library.

## Risks / Trade-offs

- [A mark glued to a parenthesis, such as `(*API*)`, is not a keyword] → The boundary rule prefers that over reading underscores inside identifiers. The helper text shows the spaced form `*negrita*` and `_cursiva_`.
- [Later keywords disappear when `tags` hits 255, with no warning] → The objective is already at most 255 characters, and the prefix is kept whole. The column cannot grow.
- [An odd `*` or `_` left in the objective can make WhatsApp format the pasted summary in a surprising way] → The copier does not repair the owner's text. Unclosed marks are not keywords, and they stay visible in the objective.
- [Logs keep the old tags until the meeting is saved again] → The form sends next steps on save, and that save rewrites tags. No migration job.

## Migration Plan

No schema change and no backfill. Deploy the API before or with the form. Older clients still send the objective as plain text; meetings with no markers keep `reunión, {project name}`. Rolling back restores the prefix-only tags on the next save.
