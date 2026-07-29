import { Request } from "express";
import { InvalidCredentialsError401 } from "../errors/InvalidCredentialsError401";

export const getUserPayload =  (req: Request) => {
    if (!req.user) {
        throw new InvalidCredentialsError401('No autorizado');
    }
    return req.user
}