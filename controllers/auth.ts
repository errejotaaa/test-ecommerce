import { Request, Response } from "express";
import { User } from "../models/User";
import { StatusCodes } from "http-status-codes";
import * as CustomError from "../errors";
import { attachCookiesToResponse } from "../utils";
import { createTokenUser } from "../utils/createTokenUser";

export class AuthController {
  constructor() {}

  async register(req: Request, res: Response) {
    const { email, name, password } = req.body;

    const emailAlreadyExists = await User.findOne({ email });
    if (emailAlreadyExists) {
      throw new CustomError.BadRequestError("Email already exists.");
    }

    //First registered user is an administrator
    const isFirstAccount = (await User.countDocuments()) === 0;
    const role = isFirstAccount ? "admin" : "user";

    const user = await User.create({ name, email, password, role });
    const userToken = createTokenUser({ user });
    attachCookiesToResponse({ res, userToken });
    res.status(StatusCodes.CREATED).json({ user: userToken });
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new CustomError.BadRequestError(
        "Please provide email and password."
      );
    }
    const user = await User.findOne({ email });
    if (!user) {
      throw new CustomError.UnauthenticatedError("User is invalid.");
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new CustomError.UnauthenticatedError("User is invalid.");
    }
    const userToken = createTokenUser({ user });
    attachCookiesToResponse({ res, userToken });
    res.status(StatusCodes.OK).json({ user: userToken });
  }

  async logout(req: Request, res: Response) {
    res.cookie("token", "logout", {
      httpOnly: true,
      expires: new Date(Date.now()),
    });
    res.status(StatusCodes.OK);
  }

  // async test(req: Request, res: Response) {
  //   //console.log(req.cookies);
  //   console.log(req.signedCookies);
  //   res.send("Cookies");
  // }
}
