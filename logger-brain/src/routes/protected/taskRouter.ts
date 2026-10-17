import { Router } from "express";

import {
    patchTaskRequestForm,
    storeTaskRequestForm,
    taskQueryRequestForm,
    updateTaskRequestForm,
} from "../../middlewares/requestForm/taskRequestForm.js";
import { uuidRequestForm } from "../../middlewares/requestForm/uuidRequestForm.js";
import {
    createTask,
    deleteTask,
    getTaskById,
    listTasks,
    patchTask,
    updateTask,
} from "../../controllers/taskController.js";
import { catchErrors } from "../../utils/catchErrors.js";

export const taskRouter = Router();

taskRouter.get("/", [taskQueryRequestForm], catchErrors(listTasks));

taskRouter.post("/", [storeTaskRequestForm], catchErrors(createTask));

taskRouter.get("/:id", [uuidRequestForm], catchErrors(getTaskById));

taskRouter.put("/:id", [uuidRequestForm, updateTaskRequestForm], catchErrors(updateTask));

taskRouter.patch("/:id", [uuidRequestForm, patchTaskRequestForm], catchErrors(patchTask));

taskRouter.delete("/:id", [uuidRequestForm], catchErrors(deleteTask));
