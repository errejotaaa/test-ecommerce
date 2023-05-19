import { UserController } from "./../controllers/user";
import { Router } from "express";
import {
  authenticateUser,
  authorizePermissions,
} from "../middleware/authentication";

const userCrtlr = new UserController();

export const userRouter = Router();

userRouter
  .route("/")
  .get(authenticateUser, authorizePermissions("admin"), userCrtlr.getAllUsers);
userRouter.route("/showMe").get(authenticateUser, userCrtlr.showCurrentUser);
userRouter.route("/update").patch(authenticateUser, userCrtlr.updateUser);
userRouter
  .route("/updatePassword")
  .patch(authenticateUser, userCrtlr.updateUserPassword);
userRouter.route("/:id").get(authenticateUser, userCrtlr.getSingleUser);
