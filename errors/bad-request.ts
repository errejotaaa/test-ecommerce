import { StatusCodes } from "http-status-codes";
import { CustomError } from "./custom-api";

export class BadRequestError extends Error implements CustomError {
  statusCode = StatusCodes.BAD_REQUEST;
  constructor(message: string) {
    super(message);
  }
}
