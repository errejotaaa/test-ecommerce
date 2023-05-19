import { StatusCodes } from "http-status-codes";
import { CustomError } from "./custom-api";

export class NotFoundError extends Error implements CustomError {
  statusCode = StatusCodes.NOT_FOUND;
  constructor(message: string) {
    super(message);
  }
}
