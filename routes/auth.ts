import { Router } from "express";
import { AuthController } from "../controllers/auth";

export const authRouter = Router();

const auth = new AuthController();

authRouter.route("/register").post(auth.register);
authRouter.route("/login").post(auth.login);
authRouter.route("/logout").get(auth.logout);
//authRouter.route("/cookies").get(auth.test);
