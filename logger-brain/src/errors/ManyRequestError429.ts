import { BaseError } from "./BaseError.js";

export class ManyRequestError429 extends BaseError {
    constructor(message: string = 'Many requests, try again later', errors: any = null) {
        super(message, 429, errors);
    }
}