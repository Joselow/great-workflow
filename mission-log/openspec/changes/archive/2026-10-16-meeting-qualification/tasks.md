## 1. Qualification write path (`logger-brain`)

- [x] 1.1 Add `summary`, `lessons`, `executed`, and `objectiveAchieved` to `CreateMeetingSchema` and to `UpdateMeetingSchema` after `.partial()`, with a refine that rejects `objectiveAchieved: false` when `lessons` is missing, null, or whitespace; verify a partial planning body still parses and a "no logrado" body without lessons fails
- [x] 1.2 Pass those four fields through `storeMeetingRequestForm`, `createMeeting`, and `updateMeeting` in the controller; verify a request body that includes them still reaches the service
- [x] 1.3 Extend `MeetingWriteInput` and create/update in `meetingService`: store blank summary and lessons as null, and force `executed` true when `objectiveAchieved` is true or false; verify create without the fields returns null texts, `executed` false, and `objectiveAchieved` null, and an update that omits them leaves a saved qualification in place

## 2. List payload (`logger-brain`)

- [x] 2.1 Select `objectiveAchieved` in `listMeetings` and include it on each item next to `executed`; verify one achieved meeting and one unexecuted meeting come back with `true`/`true` and `false`/`null`

## 3. Client types (`mission-log`)

- [x] 3.1 Add `objectiveAchieved: boolean | null` to `MeetingListItem`; verify the list type matches the list response
- [x] 3.2 Add `qualifyMeeting` in `useMeeting` that PUTs only `objectiveAchieved`, `summary`, and `lessons`; verify it does not send planning fields

## 4. Meetings list (`mission-log`)

- [x] 4.1 Show `verified` only when `meeting.executed` is true and `rocket_launch` only when `meeting.objectiveAchieved` is true, beside the title; verify an unexecuted row shows neither icon and an executed-but-not-achieved row shows only `verified`
- [x] 4.2 Remove the unwired "Marcar como ejecutada" and "Objetivo alcanzado" actions from `MeetingTable.vue`; verify the row menu no longer offers them

## 5. Meeting form (`mission-log`)

- [x] 5.1 In the form header, show executed ("Ejecutada" + `verified`, or "No ejecutada" + `pending`) and objective ("Objetivo logrado" + `rocket_launch`, "No logrado" + `cancel`, or "Sin calificar" + `help`); verify a saved achieved meeting and a new draft render the matching pair
- [x] 5.2 Keep summary and lessons on the draft, drop their `maxlength`, and block the main save when the verdict is not achieved and lessons are blank; verify a normal planning save still persists summary, lessons, and the current verdict
- [x] 5.3 Add lazy `MeetingQualificationModal.vue` (`defineAsyncComponent` + `v-if`), opened by "Calificar reunión" only when `draft.id` exists, with the two exclusive choices, both textareas, Cancelar, and Guardar; verify the create form has no button and the modal chunk loads on first open
- [x] 5.4 On Guardar, require a choice, require lessons only for "No logrado", call `qualifyMeeting`, and patch the draft from the response; verify cancel leaves the stored qualification unchanged and a successful "Objetivo logrado" with empty texts updates the header to Ejecutada and Objetivo logrado

## 6. End-to-end

- [x] 6.1 Qualify an existing meeting as not achieved with lessons and no summary, reload the form and `/meetings`; verify the header shows "No logrado", the list shows `verified` without `rocket_launch`, and lessons survived a later planning save
- [x] 6.2 Qualify the same meeting as achieved with empty lessons, then try to save "No logrado" with blank lessons; verify the rocket appears, and the blank lessons attempt stays on screen without changing the stored verdict
