import { Request, Response } from "express";
import { IUser, User, IUserMethods } from "../models/User";
import { StatusCodes } from "http-status-codes";
import * as CustomError from "../errors";
import { createTokenUser } from "../utils/createTokenUser";
import { attachCookiesToResponse } from "../utils";
import { Document, Types } from "mongoose";
import { checkPermissions } from "../utils/checkPermissions";

export class UserController {
  constructor() {}
  //----------------------------------------------------------------
  async getAllUsers(req: Request, res: Response) {
    console.log(req.user);
    const users = await User.find({ role: "user" }).select("-password");
    res.status(StatusCodes.OK).json({ users });
  }

  //----------------------------------------------------------------
  async getSingleUser(req: Request, res: Response) {
    const user = await User.findOne({ _id: req.params.id }).select("-password");
    if (!user) {
      throw new CustomError.NotFoundError(
        "No User found with id: " + req.params.id
      );
    }
    checkPermissions(req.user, user._id);
    res.status(StatusCodes.OK).json({ user });
  }

  //----------------------------------------------------------------
  async showCurrentUser(req: Request, res: Response) {
    res.status(StatusCodes.OK).json({ user: req.user });
  }

  //----------------------------------------------------------------
  async updateUser(req: Request, res: Response) {
    const { name, email } = req.body;

    if (!name || !email) {
      throw new CustomError.BadRequestError("Please provide all values.");
    }
    const user = (await User.findOneAndUpdate(
      { _id: req.user.userId },
      { email, name },
      { new: true, runValidators: true }
    )) as Document<unknown, any, IUser> &
      Omit<
        IUser &
          Required<{
            _id: Types.ObjectId;
          }>,
        keyof IUserMethods
      > &
      IUserMethods;

    const userToken = createTokenUser({ user });
    attachCookiesToResponse({ res, userToken });
    res.status(StatusCodes.OK).json({ user: userToken });
  }

  // async updateUser(req: Request, res: Response) {
  //   const { name, email } = req.body;

  //   if (!name || !email) {
  //     throw new CustomError.BadRequestError("Please provide all values.");
  //   }
  //   const user = (await User.findOne({ _id: req.user.userId })) as Document<
  //     unknown,
  //     any,
  //     IUser
  //   > &
  //     Omit<
  //       IUser &
  //         Required<{
  //           _id: Types.ObjectId;
  //         }>,
  //       keyof IUserMethods
  //     > &
  //     IUserMethods;

  //   user.name = name;
  //   user.email = email;
  //   user.save();
  //   const userToken = createTokenUser({ user });
  //   attachCookiesToResponse({ res, userToken });
  //   res.status(StatusCodes.OK).json({ user: userToken });
  // }

  //----------------------------------------------------------------
  async updateUserPassword(req: Request, res: Response) {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      throw new CustomError.BadRequestError("Please provide both passwords.");
    }

    const user = await User.findOne({ _id: req.user.userId });

    if (user) {
      const isPasswordCorrect = await user.comparePassword(oldPassword);

      if (!isPasswordCorrect) {
        throw new CustomError.UnauthenticatedError("Invalid credentials.");
      }
      user.password = newPassword;
      await user.save();
      res.status(StatusCodes.OK).json({ msg: "Sucess! password updated" });
    }
  }
}
