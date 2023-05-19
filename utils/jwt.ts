import { Response } from "express";
import jwt from "jsonwebtoken";

// export const createJWT = ({ payload }: { payload: any }) => {
//   //objct destructuring payload
//   const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
//     expiresIn: process.env.JWT_LIFETIME,
//   });
//   return token;
// };

export const isTokenValid = ({ token }: { token: any }) =>
  jwt.verify(token, process.env.JWT_SECRET as string);

export const attachCookiesToResponse = ({
  res,
  userToken,
}: {
  res: Response;
  userToken: any;
}) => {
  const token = jwt.sign(
    { payload: userToken },
    process.env.JWT_SECRET as string,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  );
  const oneDay = 100 * 60 * 60 * 24;
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === "production" ? true : false,
    signed: true,
  });

  //You dont need to return the res object because you already have access to it in the controller itself
};
