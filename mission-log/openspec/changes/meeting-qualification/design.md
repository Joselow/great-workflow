## Context

See proposal.md for why. The columns already exist on `meetings` (`summary` text, `lessons` text, `executed` boolean default false, `objective_achieved` boolean nullable). `GET /meeting/:id` returns the row, so the fields already come back. They never stick: `storeMeetingRequestForm` rebuilds the body from planning keys only, `CreateMeetingSchema` does not list them, and `meetingService` does not write them. List selects `executed` but not `objectiveAchieved`.

The form already binds `draft.summary`, `draft.lessons`, `draft.executed`, and `draft.objectiveAchieved`, and `toPayload` already sends them. `MeetingTable` draws `verified` and `rocket_launch` when `!meeting.executed`. The row menu has two buttons, "Marcar como ejecutada" and "Objetivo alcanzado", with no handlers.

UI constraints: Pastel Soft UI / Soft Brutalism, `ModalBase`, Material Symbols, no new dependencies. Components stay UI-only; HTTP stays in `useMeeting`.

## Goals / Non-Goals

**Goals:**
- One write path: the existing create/update meeting body gains the four fields.
- Modal save persists qualification without writing unsaved planning edits.
- Header, form texts, and list icons read the same four fields.

**Non-Goals:**
- A separate qualify endpoint or a new table.
- Clearing a verdict back to "Sin calificar".
- Qualifying a meeting that has not been saved yet.
- Generating the correo / WhatsApp summaries (those buttons stay as they are).
- Changing planning validation (title, date, duration).

## Decisions

### 1. Extend PUT/POST, do not add `/qualify`

The update schema is already partial. Qualification is four columns on the same row, with the same owner check.

Alternative considered: `PATCH /meeting/:id/qualification`. It would isolate the lessons rule, but it duplicates the owner lookup and the form's main Guardar still has to send the same fields or a later planning save cannot round-trip them. One schema, two callers.

Callers:

| Caller | Body |
| --- | --- |
| Main Guardar | Full planning payload plus the qualification currently on the draft |
| Modal Guardar | Only `objectiveAchieved`, `summary`, `lessons` |

The service sets `executed` true whenever `objectiveAchieved` is `true` or `false`, including when the body also says `executed: false`. Omitting the four fields on update leaves the stored values.

```
objectiveAchieved null  + executed false  →  not held, sin calificar
objectiveAchieved true                    →  executed true, rocket
objectiveAchieved false + lessons         →  executed true, no rocket
objectiveAchieved false + blank lessons   →  400, row unchanged
```

Blank `summary` or `lessons` (empty or whitespace) is stored as null, except the 400 above. Trim before that check.

Apply the lessons refine **after** `.partial()` on the update schema. Do not rely on a refine placed on the create schema surviving `partial()`.

The middleware and the controller must pass the four fields through. Adding them only to Zod still drops them, because the middleware rebuilds the object from a fixed key list.

### 2. Modal owns a copy; the parent persists

`MeetingQualificationModal.vue` is UI. It receives the current qualification, copies it locally on open, and emits the choice on Guardar. Cancelar drops the copy. The parent calls a new `qualifyMeeting(id, payload)` that `PUT`s only those fields, then writes the response back onto the draft (`executed`, `objectiveAchieved`, `summary`, `lessons`).

That PUT does not include title, issues, or cards, so an open planning edit survives qualification.

The modal is lazy:

```
defineAsyncComponent(() => import('@/components/Meeting/MeetingQualificationModal.vue'))
```

Render it with `v-if` the first time the button is used, so the chunk is not part of the form's initial load. Vue keeps the component cached after that.

The button "Calificar reunión" renders only when `draft.id` is set. A new meeting shows the header status ("No ejecutada", "Sin calificar") and no button.

Local Guardar checks, before the request: a choice is selected; if the choice is "No logrado", lessons trim to non-empty. The API repeats the lessons rule so the main Guardar cannot bypass it. The main Guardar shows the same lessons error and does not open the confirm modal.

### 3. Header and list read the booleans directly

List: fix the inverted condition. `verified` when `meeting.executed`. `rocket_launch` when `meeting.objectiveAchieved` is true. Add `objectiveAchieved` to the list select and to `MeetingListItem`.

Header, top right, always both facts:

| State | Label | Icon |
| --- | --- | --- |
| `executed` | Ejecutada | `verified` |
| not executed | No ejecutada | `pending` |
| `objectiveAchieved === true` | Objetivo logrado | `rocket_launch` |
| `objectiveAchieved === false` | No logrado | `cancel` |
| `objectiveAchieved === null` | Sin calificar | `help` |

Positive labels use the existing green. "No logrado" uses the existing rose. The other two stay muted. The qualify button sits in that same header cluster.

```
[ proyecto ]                      [ rocket Objetivo logrado ] [ verified Ejecutada ] [ Calificar reunión ]
```

Delete the two unwired row-menu buttons. They are not a second qualify path.

### 4. Summary and lessons stay on the form

The right-column textareas stay bound to the draft. Modal save patches the draft, so the textareas update when the modal closes. Main Guardar keeps sending them.

Drop `maxlength="255"` on those two textareas. The columns are `text`; 255 was copied from `objective`.

Modal copy:

- Title: ¿Objetivo logrado?
- Choices: Objetivo logrado / No logrado (one selected)
- Summary: ¿Cómo te fue en la reunión? ¿Cómo se llevó la reunión?
- Lessons: ¿Qué lecciones te llevas o sacas de esta reunión?
- Footer: Cancelar / Guardar, on `ModalBase`

Selected "Objetivo logrado" uses a green outline. Selected "No logrado" uses a rose outline. Same flat borders as the rest of the form.

## Risks / Trade-offs

- [Planning save sends a stale verdict] → Modal success must patch the draft from the response before any later Guardar. `toPayload` already forwards the four draft fields.
- [User edits the summary textarea while the modal is open] → The modal holds a copy from open time. Last successful save wins. Acceptable; the modal is the qualification writer and the textarea is the same draft.
- [Zod refine only on create] → A partial update with `objectiveAchieved: false` and no lessons would pass. Put the refine on the update schema itself.
- [List icon fix is a one-line condition change] → `MeetingListItem` has no `objectiveAchieved` today, so the rocket cannot be correct until the list payload grows. Do both in the same change.

## Migration Plan

No migration and no backfill. Existing rows already have `executed` false and null summary, lessons, and `objective_achieved`. Rollback is reverting the API and UI; stored qualifications remain valid columns.

## Open Questions

None. Verdict-implies-executed, lessons-only-when-not-achieved, and qualify-only-after-save are specified.
