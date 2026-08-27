import { Router } from "express";

import { logQueryRequestForm, storeLogRequestForm } from "../../middlewares/requestForm/logRequestForm";
import { uuidRequestForm } from "../../middlewares/requestForm/uuidRequestForm";

import { getLog, createLog, updateLog, destroyLog } from "../../controllers/logController";

import { catchErrors } from "../../utils/catchErrors";

export const logRouter = Router();

logRouter.get('/', [logQueryRequestForm],
    catchErrors(getLog)
)

logRouter.post('/', [storeLogRequestForm],
    catchErrors(createLog)
)

logRouter.put('/:id', [uuidRequestForm, storeLogRequestForm],
    catchErrors(updateLog)
)

logRouter.delete('/:id', [uuidRequestForm],
    catchErrors(destroyLog)
)