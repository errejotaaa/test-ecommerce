import { StatusCodes } from "http-status-codes";
import { CustomError } from "./custom-api";

export class UnauthorizedError extends Error implements CustomError {
  statusCode = StatusCodes.FORBIDDEN;
  constructor(message: string) {
    super(message);
  }
}
