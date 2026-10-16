## Context

See proposal.md for why. `log_meetings.source` already allows `log | meeting`. GET already returns each linked log as `{ id, description, source }`. `syncLogLinks` replaces the whole join set for a meeting, so a normal save would delete `source = meeting` rows if they are not in `logLinks`.

`logs.project_id` is not null. `responsible` is varchar(100). `tags` is varchar(255). `description` on the log API is at least 2 characters. There is no `db.transaction` in the meeting service today, and `logService.createLog` inserts one row on the shared `db` client.

The form left column is currently date, status, objective, agenda, duration, participants. The title is an input at the top. The wireframe's checkbox marks and rainbow borders are not the product UI.

## Goals / Non-Goals

**Goals:**
- One transaction for the meeting write and its next-step logs.
- New logs and new joins go in as two batch inserts, after the meeting row exists.
- `source = log` links stay on their own sync path.

**Non-Goals:**
- A position column or reorder for next steps. List order is `createdAt` ascending; new rows go at the end.
- Checkboxes on the agenda.
- Editing `responsible` or `tags` in the form. They are derived.
- Color on a next step.
- A second project picker. `CardProjectSelect` stays in the header.

## Decisions

### 1. `nextSteps` is not `logLinks`

`logLinks` remains the logs that were attached from the log side (`source = log`). `nextSteps` is `{ logId?: uuid; description: string }[]`.

| Payload | Meaning |
| --- | --- |
| `nextSteps` omitted | leave meeting-born logs as they are |
| `nextSteps: []` | remove all `source = meeting` logs of this meeting |
| row with `logId` | update that log |
| row without `logId` | create log + join |

The form always sends the array, including `[]`. Blank descriptions are removed before the write. A `logId` must already be a `source = meeting` log of this meeting owned by the user; anything else is `400`.

`syncLogLinks` must only delete joins whose `source` is `log`. It must not delete `source = meeting` rows. An existing pair keeps its source.

Alternative considered: reuse `logLinks` with `source: meeting` and let the client send the derived responsible. That puts the log shape in the browser and makes one sync function delete both kinds of links. The form would have to resend every attached log on every save or lose it.

### 2. Meeting, then logs, then joins, in one transaction

`createMeeting` and `updateMeeting` run inside `db.transaction`. The existing issue, card, and log-link syncs take that transaction client instead of the global `db`.

Create order inside the transaction:

```
insert meeting
insert logs        -- one values() list, .returning()
insert log_meetings  -- one values() list, source 'meeting'
```

There are no foreign keys, so the join delete and the log delete are both explicit. Removing a step deletes its `log_meetings` row, then the log. A comment written later on that log goes away with it. That is the same act as removing the step.

Updates of existing descriptions are one update per changed log inside the same transaction. Their texts differ, so they are not one insert. New logs still share a single insert. Do not call `logService.createLog` in a loop: it does not take a transaction and it writes one row at a time.

Derived columns, built in the meeting service after the project is known to belong to the user:

| Column | Value |
| --- | --- |
| `description` | trimmed step |
| `responsible` | `Reunión {title} {fecha}` |
| `tags` | `reunión, {project name}` |
| `completed`, `comment` | null |
| `project_id` | meeting project |
| `user_id` | token |

`fecha` uses `America/Lima` and `DD/MM/YY h:mm:ss A`, so a UTC server still matches the clock on the form. If `responsible` would pass 100 characters, shorten the title and keep the `Reunión` prefix and the date. If `tags` would pass 255, shorten the project name.

A kept step with a trimmed description shorter than 2 characters is `400` before any write. A kept step with no project is `400` before any write. Whitespace-only rows are not kept.

Refreshing an existing step also rewrites `responsible` and `tags`, so a renamed meeting or a moved date does not leave the old label on the log.

### 3. Form order is a move, plus one list component

Left column, top to bottom:

```
{draft.title}          text, not an input
objective
topicStatus
title                  the input
issues                 agenda, color stays
nextSteps              text only
estimatedDuration
participants
date
```

`MeetingNextStepList.vue` follows `MeetingIssueList` for add, remove, and Enter-to-add. No color, no reorder buttons. The view stays the owner of the draft. On load, `logs` with `source === 'meeting'` become `nextSteps` (`logId` + `description`); `source === 'log'` stays in `logLinks`. After save, copy the returned meeting-born logs back onto those rows so the next save sends their ids.

If any remaining step has text and `projectId` is null, the save stops with a toast and does not open the confirm modal. Same for a one-character description.

The right column is untouched: cards, summary, lessons, copy summary, qualify.

## Risks / Trade-offs

- [A save deletes a next-step log that already has a comment] → The step list is the source of truth for logs born from the meeting. `source = log` logs are not in that list, so they are not deleted.
- [`syncLogLinks` still treats every missing id as a delete] → Filter deletes to `source = log` in the same change. Otherwise the first planning save after this ships removes the new joins.
- [Server timezone] → Stamp the responsible date in `America/Lima`, not the process timezone.
- [Transaction client forgotten in one sync helper] → Pass `tx` into every write in create and update. A helper that closes over `db` would commit outside the rollback.

## Migration Plan

No migration. `source = meeting` and the log columns already exist. Rollback is reverting the API and the form. Logs created while this is deployed remain normal logs; the join rows remain valid.

## Open Questions

None. Project required, derived responsible and tags, and delete-on-remove are specified.
