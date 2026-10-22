## Context

See proposal.md for why. A saved meeting is `GET/PUT /meeting/:id`. Qualification is the same `PUT` with `objectiveAchieved`, which forces `executed` true. `estimatedDuration` is planned minutes. Issues are replaced on every planning save (`syncIssues` deletes and reinserts them). Requirements and tasks already hang off a meeting; the API rejects `issueId`. `GET /requirement` and `GET /task` return oldest first. The planning form's requirements block is commented out. `App.vue` mounts header, project drawer, and `SideBarText` on every authenticated route.

## Goals / Non-Goals

**Goals:**

- Persist the four logistics fields and a one-shot actual `duration` in seconds.
- Open a bare room from **Iniciar reunión**, under **Copiar resumen**.
- One notebook per meeting, framed by whichever issue is open.
- A clock that accumulates only while the room is visible, then freezes on **Finalizar** or when `executed` is already true.

**Non-Goals:**

- Linking a requirement or a task to an issue, or making issue ids stable.
- Setting `executed`, `summary`, or `lessons` from **Finalizar**.
- Changing `/requirements`, `/tasks`, the summary copier, or the meetings table.
- A platforms table, a new dependency, or a second task form.

## Decisions

### 1. Five nullable columns, duration written only by finish

Add to `meetings`: `additional_info` text, `platform` varchar(30), `meeting_url` text, `access_details` text, `duration` integer. All nullable. No default other than null.

`platform` is `meet | zoom | teams | whatsapp | presencial | otro`. The form labels them Google Meet, Zoom, Teams, WhatsApp, Presencial, Otro, plus an empty choice. Blank logistics become null.

`duration` is not on the planning Zod object. Zod already strips unknown keys, so a planning body that includes it never reaches the service. Qualification's `PUT` also cannot clear it, because the column is absent from that write. `GET /meeting/:id` returns the five fields. The list payload stays as it is.

`POST /meeting/:id/finish` with `{ duration }` (integer ≥ 0) is the only writer. It updates that column when `executed` is false and `duration` is null. Otherwise it throws `BadRequestError400` and does not write. Owner checks match the other meeting routes. Register it on `meetingRouter` as `/:id/finish`.

Alternative considered: let the planning `PUT` accept `duration`. A full-form save could then wipe or invent the clock. A separate action keeps the plan and the result apart.

### 2. Logistics sit on the right; the button sits under copy

The left column order stays the one in `meeting-form-order`. The right column gains the logistics section above summary: platform select, URL, access details, additional info. **Iniciar reunión** renders directly under **Copiar resumen**, and only when `draft.id` exists. It routes to `runMeeting`. It does not save the form first.

The planning payload gains the four logistics fields and still omits `duration`.

### 3. The room is a bare child route

Under `/meetings`, add `:id/run` named `runMeeting`, declared before `:id`, with `meta.requiresAuth` and `meta.bare`. In `App.vue`, a bare authenticated route renders `RouterView` only. `ToastLauncher` stays where it is, outside that branch. Header, `ProjectDrawer`, and `SideBarText` stay on every other authenticated route.

The view is `MeetingRunView`. It loads the meeting with `getMeetingById`. A missing meeting uses the existing not-found view.

Three acts: `context`, `development`, `close`. The title and the clock stay in a bar above the act. Side controls move one act. Inside development, double-click opens an issue frame; a back control returns to the issue list without changing act. Next from an open issue goes to close. Below the medium breakpoint the act controls sit on the bottom edge.

Context shows `topicStatus`, `objective`, and `participants` as read-only. Close shows the issues, the notebook read-only, additional info, next steps, and `Muchas gracias` plus the participants. That thank-you is rendered text.

### 4. The notebook is the meeting, sorted on the client

Do not change `syncIssues`. The frame is the issue name from the meeting payload. Creates go through `useRequirement` and `useTask` with `meetingId` and `projectId`, never `issueId`.

Load once per room: `getRequirements(projectId, meetingId)` and `getTasks({ projectId, meetingId })`. Sort both by `createdAt` descending in the view. Group tasks by `requirementId`. `requirementId === null` is the loose list, under the requirements, without indent. Leaving the API order alone keeps `/requirements` and `/tasks` as they are.

The top row is an empty requirement composer; Enter or **+** creates it and the row stays empty above the list. Each requirement's **+**, and each of its tasks' **+**, focuses an empty task row directly under that requirement. Saving it creates a task with that `requirementId`, an empty description, and `completed` false. A loose-task composer under the list does the same with no `requirementId` and with `meetingId`. Tasks stay visible; there is no collapse.

No project: the room still opens, and those composers are absent. The existing API already rejects a requirement on a meeting without a project.

Additional info commits with a partial `PUT` of `{ additionalInfo }` on blur, from the issue frame and from close. That must be the only field in the body, so next steps and planning fields stay untouched.

### 5. The clock is accumulated open time

`useMeetingClock` keeps `localStorage` key `meeting-run:<meetingId>` as `{ accumulatedSec, segmentStartedAt }`.

A meeting is frozen when `executed` is true or `duration` is not null. Frozen: show `duration ?? 0` as `HH:MM:SS`, do not start a segment, do not write the key, and hide **Finalizar**. Opening the room clears a leftover key so a later visit cannot resume.

Not frozen: on enter, ignore a stored `segmentStartedAt` (the previous segment is over; the gap must not count) and start `segmentStartedAt` at now. Display is `accumulatedSec` plus the open segment. Every 5 seconds, and on `visibilitychange` hidden, `pagehide`, and unmount, add the open segment into `accumulatedSec`, clear `segmentStartedAt`, and write. Becoming visible starts a new segment. Leaving the route is the same pause.

**Finalizar** asks for confirm, flushes, then `POST /meeting/:id/finish` with the integer seconds. Success stores the response `duration`, clears the key, and the readout stops. Failure leaves the key in place so the seconds are still there.

Two visible tabs of the same room can both tick. This is a single-user tool; the last flush wins. Not solved here.

### 6. Next steps on close send the whole list

`syncNextSteps` deletes meeting-source logs whose ids are omitted. The close composer loads the current `source: meeting` logs and `PUT`s `{ nextSteps }` with every existing `{ logId, description }` plus the new `{ description }`. No other meeting fields go in that body. No project: the composer is hidden, matching the API.

## Risks / Trade-offs

- [A killed tab loses up to five seconds] → The flush interval is the bound. The gap after death is not added, because a stale `segmentStartedAt` is discarded on the next open.
- [Planning save still recreates issues] → The notebook does not store issue ids, so the new ids only change the frame labels.
- [Additional info and the planning form can overwrite each other] → Both write the same column. The last commit wins. The room sends only that field.
- [Finish is client-reported seconds] → The server stores the integer it is given. It does not recompute the clock.
- [`MeetingRunView` can get large] → Keep the clock in the composable and the notebook in its own component. The view owns acts, load, and the close act.

## Migration Plan

Add the nullable columns with Drizzle (`db:generate`, then `db:migrate`). Existing rows read as null. Deploy the API before the frontend. Rollback the frontend first; the new columns can stay. Dropping them is the schema rollback.

## Open Questions

None.
