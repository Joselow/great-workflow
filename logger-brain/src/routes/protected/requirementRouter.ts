import { Router } from "express";

import {
    requirementQueryRequestForm,
    storeRequirementRequestForm,
    updateRequirementRequestForm,
} from "../../middlewares/requestForm/requirementRequestForm.js";
import { uuidRequestForm } from "../../middlewares/requestForm/uuidRequestForm.js";
import {
    createRequirement,
    deleteRequirement,
    getRequirementById,
    listRequirements,
    updateRequirement,
} from "../../controllers/requirementController.js";
import { catchErrors } from "../../utils/catchErrors.js";

export const requirementRouter = Router();

requirementRouter.get("/", [requirementQueryRequestForm], catchErrors(listRequirements));

requirementRouter.post("/", [storeRequirementRequestForm], catchErrors(createRequirement));

requirementRouter.get("/:id", [uuidRequestForm], catchErrors(getRequirementById));

requirementRouter.put("/:id", [uuidRequestForm, updateRequirementRequestForm], catchErrors(updateRequirement));

requirementRouter.delete("/:id", [uuidRequestForm], catchErrors(deleteRequirement));
