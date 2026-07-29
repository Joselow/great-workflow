import { z } from "zod";

export const uuidSchema = z.uuidv7();

export const verifyUUID = (id: unknown) => {
    return uuidSchema.safeParse(id)
}