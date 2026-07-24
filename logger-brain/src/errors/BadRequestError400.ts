import { BaseError } from "./BaseError.js";

export class BadRequestError400 extends BaseError {
    constructor(message: string = 'Validation errors', errors: any = null) {
        super(message, 400, errors);
    }
}