## Context

See proposal.md for why. The room in `MeetingRunView` always opens on the context act. `goNext` moves context → development → close, from the arrow buttons and from the room arrow keys. The clock has never started when `showStart` is true: `executed` is false and `startedAt`, `duration`, `runningSince`, and `finishedAt` are null. **Iniciar** already calls `POST /meeting/:id/clock/resume`. **Finalizar** opens `ConfirmModal` and, only after confirm, calls finish. An open segment keeps ticking through that modal. **Información adicional** is one `v-model` rendered as a `rows="3"` textarea in the issue frame and again on the close act.

## Goals / Non-Goals

**Goals:**

- Ask once per visit to the room, at the first move from context to development, and only when **Iniciar** would be shown.
- Stop an open segment at the moment **Finalizar** is pressed. Confirm finishes. Cancel continues from that second.
- Let the additional-info textarea grow and shrink with its text in both places it appears.

**Non-Goals:**

- A new clock endpoint, or storing the “already asked” flag on the server or in the browser.
- Asking on the planning form, on the meetings table, or when the owner only reads the context act.
- Changing the planning-form textarea.
- Pausing because the tab was hidden or the page was closed.

## Decisions

### The start question is a flag on the room instance

`MeetingRunView` keeps a boolean that starts false and is not written anywhere else. It becomes true the first time this visit tries to leave context toward development while `showStart` is true. The act does not change until the owner answers.

- Confirm calls the same resume action as **Iniciar**, then shows development. If resume fails, development still shows and **Iniciar** stays, so they can retry. This visit does not ask again.
- Cancel does not call resume, shows development, and this visit does not ask again. Further next and previous moves do not ask.
- Leaving the room destroys the view, so the flag dies with it. The next entry starts false. If the clock still has not started, the next context → development asks again.
- Changing the meeting id inside the room resets the flag. A clock that has already started, or an executed meeting whose clock never started, never asks.

The arrow keys use `goNext`, so they hit the same gate. While the question is open, those arrows do nothing.

Alternative: ask as soon as the room mounts, before any move. Rejected because the prompt belongs to the first move to the next act, and reading context or going back to the form should not ask. Alternative: remember the cancel in `sessionStorage`. Rejected because leaving the room and coming back must ask again, and a view-local flag already does that.

### Finalizar pauses the open segment before the question

If a segment is open, the click freezes the on-screen seconds and calls pause. The confirmation opens only after that pause succeeds. The readout then shows the stored duration and does not advance. The other clock controls do nothing while the confirmation is open.

- Confirm calls finish and does not resume. A failed finish leaves the clock paused; **Reanudar** and **Finalizar** stay available.
- Cancel, when this click was the pause, calls resume. The counter continues from the paused duration and does not add the time the confirmation was open. Cancel when the clock was already paused does not resume.
- If the pause fails, the confirmation does not open and the previous readout keeps running.
- If the owner leaves the room while the confirmation is open after that pause, the room resumes before it goes, so leaving does not leave the clock paused. Closing the page cannot send that resume, so the clock stays paused.

Alternative: freeze only the local interval and leave `runningSince` open. Rejected because cancel would jump forward by the seconds spent in the modal, and confirm would store those seconds. The existing pause and resume actions already stop and continue a segment.

### One fitter for both additional-info textareas

The card helper `fitTextarea` returns early when the box is taller than the text, so it cannot shrink, and it is tied to expand-on-focus. The room field instead sets the textarea height to its scroll height on each input and again when the act paints the stored text. `rows="3"` is the minimum. `resize` is off and the textarea does not scroll internally; the act column scrolls. The issue frame and the close act share the value, so both use the same fit. The planning form is left as it is.

Alternative: `field-sizing: content`. Rejected so the height stays explicit in the two room fields and does not depend on a CSS property the rest of the textareas do not use.

## Risks / Trade-offs

- [Closing the page on the finish confirmation leaves the clock paused] → The page cannot resume after unload. The next visit shows **Reanudar**.
- [Pause and the on-screen freeze can differ by about a second] → The click freezes the label; the server duration replaces it when pause returns.
- [Confirm advances even when resume fails] → **Iniciar** remains. The visit does not ask a second time.

## Migration Plan

No data migration and no API change. The next visit to the room uses the new prompt and the new finish sequence.

## Open Questions

None.
