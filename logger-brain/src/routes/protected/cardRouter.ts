import { Router } from "express";

import { cardListQueryRequestForm, storeCardRequestForm } from "../../middlewares/requestForm/cardRequestForm.js";
import { uuidRequestForm } from "../../middlewares/requestForm/uuidRequestForm.js";
import { createCard, deleteCard, getCardById, listCards, updateCard } from "../../controllers/cardController.js";
import { catchErrors } from "../../utils/catchErrors.js";

export const cardRouter = Router();

cardRouter.get('/', [cardListQueryRequestForm], catchErrors(listCards));

cardRouter.post('/', [storeCardRequestForm], catchErrors(createCard));

cardRouter.get('/:id', [uuidRequestForm], catchErrors(getCardById));

cardRouter.put('/:id', [uuidRequestForm, storeCardRequestForm], catchErrors(updateCard));

cardRouter.delete('/:id', [uuidRequestForm], catchErrors(deleteCard));
