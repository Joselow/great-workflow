import { Router } from "express";

import { createAccountLimiter, loginLimiter } from "../middlewares/security/rateLimiter";
import { login, register } from "../controllers/authController";
import { catchErrors } from "../utils/catchErrors";

import { registerRequestForm, loginRequestForm } from "../middlewares/requestForm/authRequestForm";

export const authRouter = Router();

authRouter.post("/register", [ createAccountLimiter, registerRequestForm ],
    catchErrors(register)
);

authRouter.post("/login", [ loginLimiter, loginRequestForm ],
    catchErrors(login)
);
