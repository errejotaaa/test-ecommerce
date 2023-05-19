import mongoose, { Model } from "mongoose";
import isEmail from "validator/lib/isEmail";
import bcrypt from "bcryptjs";

export interface IUser {
  _id: mongoose.Schema.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface IUserMethods extends IUser {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface UserModel extends Model<IUser, {}, IUserMethods> {}

export interface CustomEmail {
  type: StringConstructor;
  required: [true, string];
  validate: {
    validator: (str: string) => boolean;
    message: string;
  };
  unique: boolean;
}

const UserSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>({
  name: {
    type: String,
    required: [true, "please provide a name."],
    maxlength: 50,
    minlenth: 3,
  },
  email: {
    type: String,
    required: [true, "please provide a name."],
    validate: {
      validator: isEmail,
      message: "Please provide a valid email address.",
    },
    unique: true,
  } as CustomEmail,

  password: {
    type: String,
    required: [true, "Please provide a valid password."],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
});

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

export const User = mongoose.model<IUser, UserModel>("User", UserSchema);
