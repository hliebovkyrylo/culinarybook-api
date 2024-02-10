import { z } from "zod";

export const SignUpSchema = z.object({
  email     : z.string().email(),
  username  : z.string(),
  name      : z.string(),
  password  : z.string(),
  image     : z.string().default(""),
  isVerified: z.boolean().default(false)
});

export const SignInSchema = z.object({
  email   : z.string().email(),
  password: z.string(),
});

export const CreateVerificationCodeSchema = z.object({
  userId: z.string(),
  code  : z.string(),
});

export const ChangePasswordSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string().min(8),
});

export type ISignUpSchema                 = z.infer<typeof SignUpSchema>;
export type ISignInSchema                 = z.infer<typeof SignInSchema>;
export type ICreateVerificationCodeSchema = z.infer<typeof CreateVerificationCodeSchema>;
export type IChangePasswordSchema         = z.infer<typeof ChangePasswordSchema>;