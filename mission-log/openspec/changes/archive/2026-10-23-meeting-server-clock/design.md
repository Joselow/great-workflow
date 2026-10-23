## Context

See proposal.md for why. The room already has a clock in `useMeetingClock`: closed seconds live in `localStorage` under `meeting-run:<meetingId>`, the open segment is a timestamp in that browser, and **Finalizar** on the close act sends that total to `POST /meeting/:id/finish`. The server stores the integer and then refuses another finish. `executed` true or a non-null `duration` freezes the readout. `meetings.duration` already exists, in seconds. `estimated_duration` is the plan, in minutes. The open change `meeting-execution-room` is what put that client clock in place.

## Goals / Non-Goals

**Goals:**

- One clock per meeting, on the `meetings` row, updated only by server clock actions.
- The same four states the room already has to show: not started, running, paused, finished. Finished can be resumed, and `executed` stays true.
- A closed browser keeps the segment open. Coming back shows that gap and keeps counting.

**Non-Goals:**

- A table of segments, or showing each pause in the room.
- Editing the real duration from the planning form, or showing the clock on the meetings table.
- Pausing when the tab is hidden, or resuming when it becomes visible again.
- Writing the summary or the lessons from the clock. Finish sets `executed` only. Qualification still writes the summary, the lessons, and `objectiveAchieved`.

## Decisions

### The clock stays on `meetings`

Add nullable `started_at`, `running_since`, and `finished_at` as `timestamptz`. Keep `duration` as the closed seconds (`null` until the first segment is committed). A 1:1 table would only add a join on every read of the room.

`duration` is the accumulator. There is no second total. On pause and on finish the server does `duration = coalesce(duration, 0) + whole seconds`, using the database clock. Finishing also sets `finished_at` and `executed`. Resuming sets `running_since` only when the meeting is not finished and not executed. `started_at` is set only when it is null.

Alternative: a `status` enum plus `elapsed_seconds`. Rejected because `running_since` and `finished_at` already tell the four states apart, and `duration` is the column the app already has.

### The server is the only clock

The client never sends a duration. `POST /meeting/:id/finish` with a body duration is removed. Four actions, no body, same owner checks as the other meeting routes:

| Action | When a segment is open | When it is not |
|---|---|---|
| `POST /meeting/:id/clock/resume` | `400`, row unchanged | `started_at` if null, `running_since` now, `finished_at` null. `duration` stays |
| `POST /meeting/:id/clock/pause` | commit, then `running_since` null | `200`, row unchanged |
| `POST /meeting/:id/clock/tick` | removed. The room does not poll | — |
| `POST /meeting/:id/clock/finish` | commit, `running_since` null, `finished_at` now | if it was started and not finished, set `finished_at`. If already finished, `200` and no change. If never started, `400` |

Commit means: add the whole seconds of `now - running_since` (`floor`, never negative) and clear `running_since`. There is no cap. A laptop left closed still counts until the owner pauses or finishes. Finish also sets `executed` to true. Resume after finish clears `finished_at`, keeps `duration` and `executed`, and opens a new segment. Resume refuses a meeting that is already executed and has never started. Qualifying while the clock is already running does not stop it.

Each write is one conditional `UPDATE` on the current `running_since`, not a read-modify-write in the service. A second request waits on the row and then sees the new anchor, so the same open segment is not added twice.

Create, planning update, and qualification omit the four fields from their schemas and from the update. A body that includes them does not change them. List selects stay as they are. Get by id returns `duration`, `startedAt`, `runningSince`, and `finishedAt`.

Alternative: trust the client's accumulated seconds, which is what finish does today. Rejected because a closed browser would either lose the segment or let the client invent it.

### The room paints from the last response

On enter, the room reads `duration` and `runningSince` and does not pause. If `runningSince` is set, the readout is `duration` plus the whole seconds from that timestamp to the computer clock, and it keeps advancing. Closing the browser, hiding the tab, and leaving the route do not pause. Only **Pausar** and **Finalizar** stop the clock.

The header, on every act, shows the readout and the controls:

- Not started: **Iniciar**
- Running: **Pausar** and **Finalizar**
- Paused after a start: play and **Finalizar** on the right of the header
- Finished, or `executed`: no clock buttons

**Iniciar** and **Reanudar** both call resume. **Finalizar**, from the header icon or the close act, asks for confirmation, saves the time, and sets `executed`. After that the play button resumes the same counter.

While `runningSince` is set, the readout is the stored `duration` plus the whole seconds from `runningSince` to the computer clock. There is no tick and no browser store. A failed button leaves the previous readout in place. The saved total on pause or finish uses the server clock, so it can differ by a few seconds from the number on screen.

A leftover `meeting-run:<id>` key is deleted on enter and is not sent to the server.

The header cluster wraps on a narrow viewport so the controls stay visible and the act arrows stay where they are.

### What this does to the open execution-room change

That change's clock section (localStorage, auto-resume when the tab is shown, one-shot client finish, freeze when `duration` or `executed` is set) is the behavior this change removes in code. The specs in this change are the clock contract. Do not bring that client clock back while wiring the room.

## Risks / Trade-offs

- [A closed laptop keeps counting] → That is the rule. Only pause or finish stops it, including hours the browser was closed.
- [The on-screen number and the saved total can differ by a few seconds] → The screen uses the computer clock against `runningSince`. Pause and finish recompute with the server clock.
- [Two open rooms both show a running clock] → They share the same `runningSince`. One pause stores the segment once. The other room keeps its local readout until it loads the meeting again.
- [Old rows have a duration and no `finished_at`] → The migration backfills `finished_at` from `updated_at` where `duration` is not null, so they show as finished and can be resumed. `started_at` stays null on those rows.

## Migration Plan

Add the three nullable columns with Drizzle (`db:generate`, then `db:migrate`) and backfill `finished_at` in that migration. Existing `duration` values stay. Deploy the API before the frontend: the old finish route disappears, so the room that still posts a duration would fail until the frontend ships. Rollback the frontend first. The new columns can stay; dropping them is the schema rollback. A meeting resumed after the backfill clears `finished_at` and keeps `duration`.
