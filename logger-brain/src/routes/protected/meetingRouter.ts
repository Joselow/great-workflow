import { Router } from "express";

import { meetingListQueryRequestForm, storeMeetingRequestForm } from "../../middlewares/requestForm/meetingRequestForm.js";
import { uuidRequestForm } from "../../middlewares/requestForm/uuidRequestForm.js";
import { createMeeting, deleteMeeting, finishMeetingClock, getMeetingById, listMeetings, pauseMeetingClock, resumeMeetingClock, updateMeeting } from "../../controllers/meetingController.js";
import { catchErrors } from "../../utils/catchErrors.js";

export const meetingRouter = Router();

meetingRouter.get("/", [meetingListQueryRequestForm], catchErrors(listMeetings));

meetingRouter.post("/", [storeMeetingRequestForm], catchErrors(createMeeting));

meetingRouter.get("/:id", [uuidRequestForm], catchErrors(getMeetingById));

meetingRouter.put("/:id", [uuidRequestForm, storeMeetingRequestForm], catchErrors(updateMeeting));

meetingRouter.post("/:id/clock/resume", [uuidRequestForm], catchErrors(resumeMeetingClock));

meetingRouter.post("/:id/clock/pause", [uuidRequestForm], catchErrors(pauseMeetingClock));

meetingRouter.post("/:id/clock/finish", [uuidRequestForm], catchErrors(finishMeetingClock));

meetingRouter.delete("/:id", [uuidRequestForm], catchErrors(deleteMeeting));
