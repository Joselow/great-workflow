import { Router } from "express";

import { meetingListQueryRequestForm, storeMeetingRequestForm } from "../../middlewares/requestForm/meetingRequestForm.js";
import { uuidRequestForm } from "../../middlewares/requestForm/uuidRequestForm.js";
import { createMeeting, deleteMeeting, getMeetingById, listMeetings, updateMeeting } from "../../controllers/meetingController.js";
import { catchErrors } from "../../utils/catchErrors.js";

export const meetingRouter = Router();

meetingRouter.get("/", [meetingListQueryRequestForm], catchErrors(listMeetings));

meetingRouter.post("/", [storeMeetingRequestForm], catchErrors(createMeeting));

meetingRouter.get("/:id", [uuidRequestForm], catchErrors(getMeetingById));

meetingRouter.put("/:id", [uuidRequestForm, storeMeetingRequestForm], catchErrors(updateMeeting));

meetingRouter.delete("/:id", [uuidRequestForm], catchErrors(deleteMeeting));
