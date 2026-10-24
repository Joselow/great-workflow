## 1. Finish

- [x] 1.1 Wrap `finishMeetingClock` in one `db.transaction` and run its reads, the open-segment update, the paused update, and the reload on that client. Verify a running finish still returns the closed clock, and a finish that throws before it completes leaves `duration`, `runningSince`, `finishedAt`, and `executed` unchanged.

## 2. Delete

- [x] 2.1 Wrap `deleteMeeting` in one `db.transaction`. After the meeting belongs to the user, delete its tasks (tasks of its requirements and tasks of the meeting), its requirements, its issues, its `card_meetings` rows, and its `log_meetings` rows. Delete a log only when this meeting's link has `source` `meeting`, and delete every remaining pivot of that log. Leave a `source` `log` row in place, including its links to other meetings. Then delete the meeting. Verify the card row remains, a `source` `log` row remains, a `source` `meeting` log linked to a second meeting is gone from that second meeting, rows of another meeting stay, and a foreign id returns `404` with nothing removed.
- [x] 2.2 Verify a failure inside the delete transaction leaves the meeting and its issues, requirements, tasks, logs, and links as they were.
