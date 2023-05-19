import { IUser } from "../models/User";
export const createTokenUser = ({ user }: { user: IUser }) => ({
  userId: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});
