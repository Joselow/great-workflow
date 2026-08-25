import { Router } from "express";

import { storeProjectRequestForm } from "../../middlewares/requestForm/projectRequestForm.js";
import { uuidRequestForm } from "../../middlewares/requestForm/uuidRequestForm.js";
import { getProjects, createProject, updateProject, getProjectById } from "../../controllers/projectController.js";
import { catchErrors } from "../../utils/catchErrors.js";

export const projectRouter = Router();

projectRouter.get('/', catchErrors(getProjects));

projectRouter.get('/:id', catchErrors(getProjectById));

projectRouter.post('/', [storeProjectRequestForm], catchErrors(createProject));

projectRouter.put('/:id', [uuidRequestForm, storeProjectRequestForm], catchErrors(updateProject));
