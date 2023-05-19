import { Request, Response, NextFunction } from "express";
import * as CustomError from "../errors";
import { isTokenValid } from "../utils";
import { JwtPayload } from "jsonwebtoken";

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.signedCookies.token;
  if (!token) {
    throw new CustomError.UnauthenticatedError("Authentication failed.");
  }
  try {
    const {
      payload: { userId, name, role },
    } = isTokenValid({ token }) as JwtPayload;
    req.user = {
      userId,
      name,
      role,
    };
    next();
  } catch (error) {
    throw new CustomError.UnauthenticatedError("Authentication failed.");
  }
};

//We create a function that will receive an array of roles and then will return the function that will be referenced in the express routes. To get the roles we need to invoce the fuction directly in the routes.
export const authorizePermissions = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError("Forbidden access.");
    }
    next();
  };
};
