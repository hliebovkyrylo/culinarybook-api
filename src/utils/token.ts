import { serialize } from "cookie";
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
  const refreshToken = jwt.sign(
    {
      id
    },
    JWT_SECRET,
    {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
    }
  )

  const serialized = serialize('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.PRODUCTION === 'true' ? true : false,
    sameSite: process.env.PRODUCTION === 'true' ? 'strict' : 'lax',
    maxAge: 60 * 60 * 24 * 31,
    path: '/'
  });

  return serialized;
}

export const createNoSerializedRefreshToken = (id: string) => {
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