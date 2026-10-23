## 1. Clock columns

- [x] 1.1 Add nullable `started_at`, `running_since`, and `finished_at` (`timestamptz`) to `meetings` and keep `duration` as the closed seconds. Generate the migration and backfill `finished_at` from `updated_at` where `duration` is not null. Verify the SQL adds those three nullable columns, leaves an existing `duration` of 125 as 125, sets `finished_at` on that row, and leaves `started_at` and `running_since` null.

## 2. Clock actions

- [x] 2.1 Return `duration`, `startedAt`, `runningSince`, and `finishedAt` from get by id. Keep them off create, planning update, and qualification writes, and off the list select. Verify a create body that sends the four fields stores them null, an update or a qualification that sets `executed` leaves the stored clock unchanged, get returns the four fields, and a list item omits them.
- [x] 2.2 Add `POST /meeting/:id/clock/resume` with no duration body. Verify the first resume sets `startedAt` equal to `runningSince` and leaves `duration` null, a later resume keeps `duration` 300 and the original `startedAt`, a resume after finish returns 400 without clearing `finishedAt`, a resume while running returns 400 without writing, a missing token returns 401, a foreign id returns 404, and `executed` stays false.
- [x] 2.3 Add `POST /meeting/:id/clock/pause` as one conditional update on the database clock. Do not add a tick. Verify a 30 second open segment on a `duration` of 300 pauses to 330 with `runningSince` null, a gap over 120 seconds is added, a pause while already paused returns success without writing, and two overlapping commits add that segment once.
- [x] 2.4 Add `POST /meeting/:id/clock/finish` and remove `POST /meeting/:id/finish`. Verify finishing a 30 second open segment on a `duration` of 600 stores 630, clears `runningSince`, sets `finishedAt` and `executed`, and keeps `startedAt`; finishing while paused sets `finishedAt` and `executed` and keeps `duration` 600; finishing again returns success without writing; finishing a meeting that never started returns 400; a gap over 120 seconds is added; and a client-supplied duration is no longer accepted on the old route.

## 3. Room clock

- [x] 3.1 Show an open segment from `duration` plus the whole seconds since `runningSince`. Do not pause on enter and do not use `localStorage`. Verify opening a meeting whose `runningSince` is already in the past shows that gap and keeps advancing, without a pause request.
- [x] 3.2 While a segment is open, advance the readout every second on the computer clock and do not call tick. Verify the readout moves without a request and the room never sends a duration.
- [x] 3.3 Put play, pause, and **Finalizar** on the right of the header while the meeting is not finished. **Finalizar** confirms first. Verify a finished or executed-and-never-started meeting shows no clock buttons, dismissing the confirmation does not finish, a failed resume keeps the play button and the previous readout, and the act arrows remain.
- [x] 3.4 Do not pause when leaving the room, hiding the tab, or unloading the page. Verify those events leave `runningSince` set.
