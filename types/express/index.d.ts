import { requestUser } from "../custom";

//export {};

declare global {
  namespace Express {
    export interface Request {
      user: requestUser;
    }
  }
}
