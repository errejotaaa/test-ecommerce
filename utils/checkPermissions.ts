import * as CustomError from "../errors";
import { Schema } from "mongoose";
import { requestUser } from "../types/custom";

//A function that checks if the user can only access information that belongs to itself. If it's  an admin then it can access all information.
export const checkPermissions = (
  requestUser: requestUser,
  resourceUserId: Schema.Types.ObjectId
) => {
  if (requestUser.role === "admin") return;
  if (requestUser.userId === resourceUserId.toString()) return;
  throw new CustomError.UnauthorizedError(
    "Not authorized to access this route."
  );
};
