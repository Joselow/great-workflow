import { BaseError } from "./BaseError.js";

export class InternalServerError500 extends BaseError {
    constructor(message: string = 'Internal Server Error') {
        super(message, 500);
    }
}