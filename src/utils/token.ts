import jwt           from "jsonwebtoken";
import { serialize } from 'cookie';

const JWT_SECRET     = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

interface IPayload {
  id: string;
};

export const createAccessToken = (id: string) => {
  const token = jwt.sign(
    {
      id
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    },
  )

  const serialized = serialize('access_token', token, {
    httpOnly: true,
    secure: process.env.PRODUCTION === 'true' ? true : false,
    sameSite: process.env.PRODUCTION === 'true' ? "none" : 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });

  return serialized;
};

export const verifyToken = (token: string) => {
  const payload = jwt.verify(token, JWT_SECRET) as IPayload;

  return payload.id;
};