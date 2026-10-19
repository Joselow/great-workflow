import { Router } from 'express';

import {
    createActionTemplate,
    deleteActionTemplate,
    getActionTemplateById,
    listActionTemplates,
    updateActionTemplate,
} from '../../controllers/actionTemplateController.js';
import {
    actionTemplateIdRequestForm,
    actionTemplateQueryRequestForm,
    storeActionTemplateRequestForm,
} from '../../middlewares/requestForm/actionTemplateRequestForm.js';
import { catchErrors } from '../../utils/catchErrors.js';

export const actionTemplateRouter = Router();

actionTemplateRouter.get('/', [actionTemplateQueryRequestForm], catchErrors(listActionTemplates));

actionTemplateRouter.post('/', [storeActionTemplateRequestForm], catchErrors(createActionTemplate));

actionTemplateRouter.get('/:id', [actionTemplateIdRequestForm], catchErrors(getActionTemplateById));

actionTemplateRouter.put('/:id', [actionTemplateIdRequestForm, storeActionTemplateRequestForm], catchErrors(updateActionTemplate));

actionTemplateRouter.delete('/:id', [actionTemplateIdRequestForm], catchErrors(deleteActionTemplate));
