## 1. Meeting columns and finish

- [x] 1.1 Add nullable `additional_info` text, `platform` varchar(30), `meeting_url` text, `access_details` text, and `duration` integer to `logger-brain/src/db/schemas/meetings.ts`. Generate the migration and verify the new SQL adds those five columns as nullable
- [x] 1.2 Apply the migration and verify a meeting row can store nulls in all five columns
- [x] 1.3 Accept the four logistics fields on create and update. Map blank strings to null. Allow `platform` null or `meet`, `zoom`, `teams`, `whatsapp`, `presencial`, `otro`, and verify any other value returns 400 without writing. Verify get by id returns the five fields and an omitted create stores them as null
- [x] 1.4 Keep `duration` off the planning schema so a create, update, or qualification body cannot change it. Verify a `PUT` that includes `duration` leaves the stored value, including when qualification sets `executed` true
- [x] 1.5 Add `POST /meeting/:id/finish` with `{ duration }` integer ≥ 0. Verify 125 is stored, `executed` stays false, and summary, lessons, and logistics stay as they were. Verify a second finish, a finish when `executed` is true, a negative duration, a foreign id, and a missing token return 400, 400, 400, 404, and 401 and do not write

## 2. Planning form

- [x] 2.1 Add platform, meeting URL, access details, and additional info to the meeting types and to the planning payload. Verify save sends those four fields and does not send `duration`
- [x] 2.2 Render the logistics section on the right column, above summary: empty platform plus Google Meet, Zoom, Teams, WhatsApp, Presencial, and Otro; URL; access details; additional info. Verify reload shows the saved values and clearing them saves nulls. Verify the left column order is unchanged and there is no input for actual seconds
- [x] 2.3 Show **Iniciar reunión** directly under **Copiar resumen** only when the meeting has an id. Verify a click opens the run route for that id, and the create form does not show the button

## 3. Bare room shell

- [x] 3.1 Add child route `:id/run` named `runMeeting` with `meta.bare`, before `:id`. In `App.vue`, render a bare authenticated route as `RouterView` only. Verify the run route shows no header, project drawer, or writer, and `/meetings/:id` still shows all three
- [x] 3.2 Add `MeetingRunView` and load the meeting by id. Verify the title and clock stay visible, next and previous move across context, development, and close, and a missing meeting shows not found. On a narrow viewport, verify the act controls sit on the bottom edge

## 4. Clock

- [x] 4.1 Add `useMeetingClock` with `localStorage` key `meeting-run:<meetingId>`. Verify an open room advances, hiding the document or leaving the route stops it, the hidden or away gap is not added, and returning continues from the stored seconds. Verify the readout is `HH:MM:SS` on every act
- [x] 4.2 Treat `executed` true or a stored `duration` as frozen. Verify the room shows that duration, or `00:00:00` when it is null, does not tick, does not keep the storage key, and does not show **Finalizar**

## 5. Development notebook

- [x] 5.1 On development, list issues in agenda order. Verify a single click stays on the list, a double click shows that issue's name and the notebook, and back returns to the list. Verify a second issue shows its own name and the same requirements
- [x] 5.2 Add `MeetingRunNotebook`. Sort requirements and tasks newest first in the client. Verify the empty requirement row stays on top, a new requirement appears first, its tasks stay indented and visible under it, a new task appears first under that requirement, and the requirement **+** and the task **+** both create a task of that requirement. Verify the request body has no issue id
- [x] 5.3 Add the loose-task composer under the requirements. Verify a loose task is stored with this meeting id and a null requirement id, and appears in that list rather than under a requirement
- [x] 5.4 When the meeting has no project, verify the room still opens and shows no requirement, task, or loose-task composer. When it has no issues, verify development shows an empty list and no requirement composer

## 6. Close

- [x] 6.1 Commit additional info with a `PUT` of only `{ additionalInfo }` on blur from the issue frame and from close. Verify the other issue and the close act show it, a blank becomes null, and `summary` and `lessons` stay unchanged
- [x] 6.2 On close, list agenda, notebook, additional info, next steps, and a thank-you line that includes the participants. Verify the thank-you is not sent to the API. When the meeting has a project, verify adding a next step stores a `meeting` log and keeps the previous steps. When it has no project, verify there is no next-step composer
- [x] 6.3 Confirm **Finalizar**, flush the clock, and `POST` the seconds. Verify `duration` matches that total, `executed` stays false, and the readout stops. Verify the planning form does not mount the requirements or tasks blocks

## 7. Check

- [x] 7.1 Run `pnpm typecheck` in `logger-brain` and `pnpm exec vue-tsc --noEmit` in `mission-log` and verify both exit 0
