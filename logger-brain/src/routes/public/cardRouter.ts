import { Router } from "express";

import { uuidRequestForm } from "../../middlewares/requestForm/uuidRequestForm.js";
import { getPublicCard } from "../../controllers/cardController.js";
import { catchErrors } from "../../utils/catchErrors.js";

export const publicCardRouter = Router();

publicCardRouter.get('/:id', [uuidRequestForm], catchErrors(getPublicCard));
