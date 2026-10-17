## Why

The words that matter in a meeting live in the objective, but the logs born from its next steps only get `reunión, {project}`. Marking those words in the objective should carry them into those tags, and the same marks should survive **Copiar resumen** so WhatsApp shows bold and italic when the text is pasted.

## What Changes

- In the objective only, text wrapped in `*asterisks*` (bold) or `_underscores_` (italic) is a keyword. Both styles count. No other meeting field contributes keywords.
- Next-step logs keep today's tags and append those keywords, in the order they appear: `reunión, {project name}, {keyword}, …`. Logs attached from the log side stay untouched.
- The objective is stored as typed, markers included. Keywords are derived when the next-step logs are written, and refreshed when those logs are saved again.
- **Copiar resumen** keeps `*` and `_` in the objective so a paste into WhatsApp renders bold and italic. It does not turn them into HTML or strip them.
- In the objective field, Ctrl+B wraps the selection in `*` and Ctrl+I wraps it in `_`. The same shortcut removes that marker. The control stays a native textarea.

## Capabilities

### New Capabilities
- `objective-emphasis`: How bold and italic spans in the meeting objective are recognized, and that only that field supplies keywords.
- `meeting-summary-copy`: **Copiar resumen** copies the objective with WhatsApp markers (`*bold*`, `_italic_`) intact.

### Modified Capabilities
- `meeting-next-step-logs`: `tags` on logs born from next steps stay `reunión, {project name}` and also include the objective keywords, still within 255 characters.

## Impact

- Backend (`logger-brain`): `nextStepLabels` in `meetingService` reads the saved objective and extends `tags`. No new column and no new request field. `logs.tags` remains `varchar(255)`.
- Frontend (`mission-log`): the objective textarea in `MeetingFormView.vue` stays the place to type the markers. Ctrl+B and Ctrl+I wrap the native selection. `generateMeetingSummary` must pass the objective through without removing `*` or `_`.
- A meeting with no marked words keeps the current tags string.
