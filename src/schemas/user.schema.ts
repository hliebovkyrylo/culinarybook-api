import { z } from "zod";

export const UdpateUserInfoSchema = z.object({
  username: z.string().max(32),
  name    : z.string().max(32),
  image   : z.string(),
});

export const CreateFollowSchema = z.object({
  followerId: z.string(),
  userId    : z.string(),
});

export type IUpdateUserInfoSchema = z.infer<typeof UdpateUserInfoSchema>;
export type ICreateFollow         = z.infer<typeof CreateFollowSchema>;