import { Router } from "express";

import { createAccountLimiter, loginLimiter } from "../middlewares/security/rateLimiter";
import { login, register } from "../controllers/auth";
import { catchErrors } from "../utils/catchErrors";

import { loginValidation, registerValidation } from "../middlewares/requestForm/auth";

export const authRouter = Router();

authRouter.post("/register", [ createAccountLimiter, loginValidation ],  
    catchErrors(register)
);

authRouter.post("/login", [ loginLimiter, registerValidation ],
    catchErrors(login)
);
