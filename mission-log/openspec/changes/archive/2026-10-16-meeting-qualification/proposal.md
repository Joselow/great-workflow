## Why

A meeting is only a closed loop once we can say whether it happened and whether its objective was met, and keep the summary and lessons from that conversation. Those columns already exist on `meetings`, and the form already shows the fields, but the API drops them on write and the list paints the status icons backwards. Qualification has to be a real save, visible on the meeting and in `/meetings`.

## What Changes

- Persist and return `summary`, `lessons`, `executed`, and `objectiveAchieved` on meeting create/update/get. List items include `objectiveAchieved` as well as `executed`.
- Saving a qualification sets `executed` to true and stores the objective verdict plus the two texts. `summary` is always optional. `lessons` is required only when the objective was not achieved. Choosing a verdict is required.
- On `/meetings`, show `verified` when the meeting was executed, and `rocket_launch` when the objective was also achieved.
- On the meeting form, keep showing summary and lessons, and show in the top right whether it was executed and whether the objective was achieved (text and icon). A **Calificar reunión** button stays available and opens a lazy-loaded modal with **Objetivo logrado** / **No logrado**, the summary textarea, the lessons textarea, and Guardar.
- Remove the unwired row actions "Marcar como ejecutada" and "Objetivo alcanzado". Qualification lives on the form modal.

## Capabilities

### New Capabilities
- `meeting-qualification-api`: Owner write/read of summary, lessons, executed, and objectiveAchieved, including the lessons rule and list fields.
- `meeting-qualification-ui`: List status icons, form header status, visible summary and lessons, and the lazy qualification modal.

### Modified Capabilities

## Impact

- Backend (`logger-brain`): `meetingValidation`, `meetingRequestForm`, `meetingController`, `meetingService`. No new table or migration; columns already exist (`summary`, `lessons`, `executed`, `objective_achieved`).
- Frontend (`mission-log`): `MeetingTable`, `MeetingFormView`, a new lazy `MeetingQualificationModal`, `MeetingListItem`. Reuse `ModalBase`. No new dependencies.
- Existing planning save must keep sending the qualification fields it already holds so a later Guardar does not wipe a qualification.
