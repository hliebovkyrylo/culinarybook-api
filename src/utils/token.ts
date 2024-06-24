import jwt from "jsonwebtoken";

const JWT_SECRET             = process.env.JWT_SECRET as string;
const JWT_ACCESS_EXPIRES_IN  = process.env.JWT_ACCESS_EXPIRES_IN;
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN;

interface IPayload {
  id: string;
};

export const createAccessToken = (id: string) => {
  return jwt.sign(
    {
      id
    },
    JWT_SECRET,
    {
      expiresIn: JWT_ACCESS_EXPIRES_IN,
    },
  )
};

export const createRefreshToken = (id: string) => {
  return jwt.sign(
    {
      id
    },
    JWT_SECRET,
    {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
    }
  )
}

export const verifyToken = (token: string) => {
  const payload = jwt.verify(token, JWT_SECRET) as IPayload;

  return payload.id;
};