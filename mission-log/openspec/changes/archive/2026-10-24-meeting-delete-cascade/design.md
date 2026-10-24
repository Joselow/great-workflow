## Context

See proposal.md for why. `finishMeetingClock` and `deleteMeeting` each call the shared `db` client one statement at a time. Create and update already use `db.transaction`. There are no foreign keys, so a half-finished delete is not rejected by the database; it just leaves rows behind. A read after a write on a second connection cannot see the uncommitted row.

## Goals / Non-Goals

**Goals:**

- One transaction per finish and one transaction per delete. A thrown error rolls that call back.
- Delete removes issues, requirements, and tasks of that meeting, then the meeting. A `source` `log` link drops only its pivot. A `source` `meeting` link drops the pivot and the log.
- The reads that decide a finish, and the reload after the write, use the same transaction as the write.

**Non-Goals:**

- Changing the clock formula, the finish rules, or the room buttons.
- Deleting card rows.
- Deleting a log whose link on this meeting has `source` `log`.
- Adding foreign keys.

## Decisions

### One `db.transaction` per call

`finishMeetingClock` and `deleteMeeting` open `db.transaction` and pass that client into every select, update, and delete of the call. Helpers that today call the shared `db` take the transaction client. A `400` or `404` thrown inside the transaction rolls back; those two responses happen before any write, so the rollback is empty.

Alternative: leave finish on the shared client because it is one `UPDATE`. Rejected because the reload and a retry of the open segment are separate statements, and the same shape should cover both endpoints.

### Delete order

Inside the transaction, after the meeting is known to belong to the user:

1. Read the requirement ids of this meeting and the log links of this meeting (`logId`, `source`).
2. Delete tasks of this user whose meeting id is this meeting, or whose requirement id is one of those requirements. Creating a task on a requirement copies that requirement's meeting id, so those two sets match for requirement tasks. A task saved on the meeting with no requirement is still in the first set.
3. Delete requirements of this user whose meeting id is this meeting.
4. Delete issues of this meeting.
5. Delete this meeting's `log_meetings` rows.
6. For the links whose `source` was `meeting`, delete any remaining `log_meetings` rows of those log ids, then delete those logs for this user. A `source` `log` row is not in this set.
7. Delete `card_meetings` rows for this meeting.
8. Delete the meeting.

Skip an `inArray` when its id list is empty.

Alternative: delete every linked log. Rejected because a `source` `log` row existed before the meeting.

### Cards stay

`card_meetings` rows go. The card row stays. The card is a document of its own, and this change does not name it as something to remove.

## Risks / Trade-offs

- [A next step also linked from another meeting disappears there] → The log row is gone, so its other pivots go in the same transaction. The other meeting stays.
- [A long delete holds the transaction open] → The set is the rows of one meeting. No extra round trip outside the transaction.

## Migration Plan

No data migration. The next delete uses the new rule. Rows already left behind by older deletes stay until someone deletes them by hand.

## Open Questions

None.
