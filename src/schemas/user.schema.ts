import { z } from "zod";

export const UdpateUserInfoSchema = z.object({
  username: z.string(),
  name    : z.string(),
  image   : z.string(),
});

export type IUpdateUserInfoSchema = z.infer<typeof UdpateUserInfoSchema>;