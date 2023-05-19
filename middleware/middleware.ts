import express from "express";
//import morgan from "morgan"; //for logging purposes
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import fileUpload from "express-fileupload";

//////////////////Security packages//////////////////
import rateLimiter from "express-rate-limit";
import helmet from "helmet";
import xss from "xss-clean";
import cors from "cors";
import mongoSanitinze from "express-mongo-sanitize";
////////////////////////////////////////////////////

config();

export const middleware = [
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 60 }),
  helmet(),
  cors(),
  xss(),
  mongoSanitinze(),
  express.static("public"),
  // morgan("tiny"),
  cookieParser(process.env.JWT_SECRET as string),
  fileUpload(),
];
