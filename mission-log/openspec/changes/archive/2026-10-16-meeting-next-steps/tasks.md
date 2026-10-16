## 1. Request shape (`logger-brain`)

- [x] 1.1 Add optional `nextSteps` (`{ logId?: uuid, description: string }[]`) to the meeting create schema and to the update schema after `.partial()`; verify a planning body without `nextSteps` still parses and a body with two descriptions parses
- [x] 1.2 Pass `nextSteps` through `storeMeetingRequestForm` and both create and update in the controller; verify a request that includes the array still reaches the service

## 2. Next-step write (`logger-brain`)

- [x] 2.1 Run meeting create and update inside `db.transaction`, and thread that client through the existing issue, card, and log-link writes; verify a thrown error inside the callback does not leave the new meeting row
- [x] 2.2 Build `responsible` as `Reunión {title} {fecha}` in `America/Lima` (`DD/MM/YY h:mm:ss A`), shortening the title so the result is at most 100 characters, and `tags` as `reunión, {project name}` at most 255 characters; verify a long title still ends with the date and stays within 100
- [x] 2.3 Insert new next-step logs in one `insert().values()`, then their `log_meetings` rows in one insert with `source` `meeting`, after the meeting row exists; verify two steps create two logs, `completed` and `comment` null, and GET returns both with `source` `meeting`
- [x] 2.4 Reject with `400` before writing when a kept step has no project or a trimmed description shorter than 2 characters, and drop whitespace-only rows; verify the meeting row is unchanged
- [x] 2.5 On update, update description plus refreshed `responsible` and `tags` for rows with `logId`, insert rows without `logId`, and delete omitted `source` `meeting` logs and their joins; verify a removed step disappears from the project log list and a `source` `log` join remains
- [x] 2.6 Limit `syncLogLinks` deletes to `source` `log`, and reject a `logId` that is not a `source` `meeting` log of this meeting; verify a planning save that only sends `logLinks` does not remove next-step joins

## 3. Form data (`mission-log`)

- [x] 3.1 Add `nextSteps` to the meeting draft and write payload, load `source` `meeting` logs into that list and `source` `log` logs into `logLinks`, and send only trimmed rows on save; verify a reloaded meeting shows the meeting-born description in the step list and not the attached log
- [x] 3.2 Add `MeetingNextStepList.vue` with add, remove, and Enter-to-add, and no color control; verify a new row accepts text and a removed row leaves the draft

## 4. Form order (`mission-log`)

- [x] 4.1 Reorder the left column to display title, objective, current status, title input, agenda, next steps, estimated time, participants, date; verify the heading mirrors the title input and is not an input, and the date sits under the participants
- [x] 4.2 Block confirm-save when a next step has text and the meeting has no project, and when a trimmed step is one character; verify the request is not sent and the owner sees why
- [x] 4.3 After a successful save, copy returned `source` `meeting` logs back onto `nextSteps` with their log ids; verify a second save updates the same log instead of creating another

## 5. End-to-end

- [x] 5.1 Create a meeting with a project, two next steps, and one blank row, then open the project logs; verify two logs exist with the responsible and tags pattern, the blank row did not create a log, and the form shows both steps again
- [x] 5.2 Rename the meeting, remove one step, keep one `source` `log` attachment, and save; verify the remaining log's responsible uses the new title, the removed log is gone, and the attached log is still linked
