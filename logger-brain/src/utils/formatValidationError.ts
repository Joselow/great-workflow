import { ZodError, z } from "zod";

export const formatValidationErrors = (error: ZodError) => {
    const errorFormatted = z.flattenError(error).fieldErrors
    return errorFormatted
};