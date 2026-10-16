## 1. Backend schema (`logger-brain`)

- [x] 1.1 Reshape `src/db/schemas/meetings.ts` (title, nullable projectId, date, estimatedDuration, topicStatus, objective, participants, color, agenda jsonb, execution columns unused in the form) and verify it matches the design field table
- [x] 1.2 Add `log_meetings.ts` and `card_meetings.ts` (uuid v7, unique pair, `source` on log links, timestamps, relations) and verify types export
- [x] 1.3 Remove `meetingId` / `typeMeetingLink` from `logs.ts` and `meetingId` from `cards.ts` (keep `flMeeting`); verify services no longer reference those columns
- [x] 1.4 Generate and apply the Drizzle migration with backfill of existing log/card pointers into join tables, then drop old columns; verify Studio/`\d` shows the new tables and dropped columns

## 2. Backend meeting API (`logger-brain`)

- [x] 2.1 Add Zod create/update + list-query schemas and request-form middleware; verify invalid bodies and unpaired `from`/`to` return 400
- [x] 2.2 Add `meetingService` create/get/list/update/delete: owner `userId`, project ownership check, agenda untitled drop, replace `cardIds`/`logLinks`, keep existing log `source` on unique pairs; verify unowned card/log is 400 and foreign meeting id is 404
- [x] 2.3 Add controller + `meetingRouter` (`GET /` before `GET /:id`, POST, PUT, DELETE) and mount under `/app/meeting`; verify 401 without token and owner CRUD round-trip including linked cards/logs

## 3. Backend log and card payload (`logger-brain`)

- [x] 3.1 Drop `meetingId` and `typeMeetingLink` from log validation, middleware, controller, and service; verify create/update with those fields is 400 and list/get omit them
- [x] 3.2 Stop reading/writing `meetingId` on cards; verify create/get/list/public responses omit `meetingId` and still include `flMeeting`

## 4. Frontend types and client (`mission-log`)

- [x] 4.1 Add `interfaces/meeting.ts` and `useMeeting` (list, create, getById, update, delete); verify calls hit `/app/meeting`
- [x] 4.2 Remove `meetingId` / `typeMeetingLink` from log types and card `meetingId` from `interfaces/card.ts`; verify TypeScript build

## 5. Extract card form (`mission-log`)

- [x] 5.1 Move the card editor into `components/Card/CardForm.vue` (`v-model` draft, emit save) and keep copy/share/danger zone on `CardFormView`; verify `/cards/new` and `/cards/:id` still create, edit, and save as today

## 6. Meeting planning UI (`mission-log`)

- [x] 6.1 Add `MeetingAgendaList.vue` (add, title, done, up/down, remove); verify draft order matches the list
- [x] 6.2 Add `MeetingCardPanel.vue` + `MeetingCardModal.vue` (list/search owned cards, create via `CardForm`, add to draft, remove unlink only); verify a created card appears in `/cards` even if the meeting is not saved
- [x] 6.3 Add `MeetingFormView.vue`: one draft ref, `startView` load, project default, ColorPicker, ConfirmModal, query `logs` → `logLinks` source `log`, DangerZone on edit; verify create replace-to-edit and reload shows persisted planning + cards
- [x] 6.4 Add `MeetingsView.vue` (thin list + empty state + new) and routes `/meetings`, `/meetings/new`, `/meetings/:id` (new before id); verify Shift+M navigates to the list

## 7. End-to-end checks

- [x] 7.1 Create a meeting with agenda, two attached cards (one existing, one created in-modal), confirm save, reload; verify GET has both cards and agenda `done` flags
- [x] 7.2 Create a meeting with `?logs=` ids, save, then omit one card on update; verify log links keep `source` `log`, the omitted card is unlinked, and the card still lists in `/cards`
- [x] 7.3 Delete the meeting; verify cards and logs still exist and a second user gets 404 for that id
