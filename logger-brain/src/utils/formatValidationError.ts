import { ZodError, z } from "zod";

export const formatValidationErrors = (error: ZodError): Record<string, string[]> | string => {
    const { fieldErrors, formErrors } = z.flattenError(error)
    
    return Object.keys(fieldErrors).length > 0 
                        ? fieldErrors 
                        : formErrors[0]
};