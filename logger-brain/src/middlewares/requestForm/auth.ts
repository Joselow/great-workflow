import type { NextFunction, Request, Response } from "express";

import { verifyLoginSchema, verifyRegisterSchema } from "../../validations/auth.js";
import { formatValidationErrors } from "../../utils/formatValidationError.js";

import { BadRequestError400 } from "../../errors/BadRequestError400.js";

export const loginValidation = (req: Request, res: Response, next: NextFunction): void => {

 const { name, email, password, phone } = req.body;
 
  const validated = verifyRegisterSchema ({
    email, password, name, phone
  })  
  
  if (!validated.success) {
      const errors = formatValidationErrors(validated.error)
      throw new BadRequestError400('The given data was invalid', errors)      
  } 

  next();
};

export const registerValidation = (req: Request, res: Response, next: NextFunction): void => {
    const { email, password } = req.body;
    
     const validated = verifyLoginSchema({
       email, password 
     })  
     
     if (!validated.success) {
         const errors = formatValidationErrors(validated.error)
         throw new BadRequestError400('The given data was invalid', errors)      
     } 
   
     next();
};