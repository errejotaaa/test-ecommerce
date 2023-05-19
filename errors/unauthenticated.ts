import { StatusCodes } from "http-status-codes";
import { CustomError } from "./custom-api";

export class UnauthenticatedError extends Error implements CustomError {
  statusCode = StatusCodes.UNAUTHORIZED;
  constructor(message: string) {
    super(message);
  }
}
